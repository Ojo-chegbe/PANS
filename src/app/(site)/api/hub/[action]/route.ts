import { NextResponse } from "next/server";
import { z } from "zod";
import { getCMS } from "@/lib/payload";
import { checkOrigin, rateLimit } from "@/lib/security";
import { assert, DomainError, relationID, type Actor } from "@/lib/domain";
import {
  checkout,
  confirmPayment,
  cancelOrder,
  issueRefund,
} from "@/services/commerce";
import * as actions from "@/services/actions";
import { requestAccessEmail } from "@/services/account-access";
import {
  emailConfigurationError,
  emailDeliveryConfigured,
} from "@/lib/email-config";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> },
) {
  try {
    checkOrigin(request);
    const { action } = await params;
    assert(
      Number(request.headers.get("content-length") || 0) < 128000,
      "This request is too large.",
      413,
    );
    const payload = await getCMS();
    const { user } = await payload.auth({ headers: request.headers });
    const actor = user as Actor | null;
    const publicActions = [
      "register",
      "forgot-password",
      "resend-verification",
      "contact",
    ];
    if (!publicActions.includes(action))
      assert(actor, "Please sign in to continue.", 401);
    let body: any;
    try {
      body = await request.json();
    } catch {
      throw new DomainError("Please check your form and try again.");
    }
    await rateLimit(
      payload,
      action +
        ":" +
        (actor?.id ||
          String(body.email || "public")
            .trim()
            .toLowerCase()
            .slice(0, 254)),
      publicActions.includes(action) ? 20 : 60,
      15,
    );
    let result: any;
    if (action === "register") {
      if (emailConfigurationError())
        throw new DomainError(
          "Registration is temporarily unavailable while email delivery is being restored. Please try again later.",
          503,
        );
      const data = z
        .object({
          name: z.string().trim().min(2).max(120),
          email: z
            .email()
            .max(254)
            .transform((x) => x.toLowerCase()),
          password: z
            .string()
            .min(12, "Use at least 12 characters for your password.")
            .max(128),
          level: z.enum(["100L", "200L", "300L", "400L", "500L", "Alumni"]),
        })
        .parse(body);
      await rateLimit(payload, "signup:" + data.email, 3, 60);
      const exists = await payload.count({
        collection: "users",
        where: { email: { equals: data.email } },
        overrideAccess: true,
      });
      if (!exists.totalDocs)
        await payload.create({
          collection: "users",
          data: { ...data, roles: ["student"] },
          overrideAccess: true,
          context: { system: true },
        });
      result = {
        message: emailDeliveryConfigured()
          ? "Check your email to verify your account. If you already have an account, sign in or reset your password."
          : "Your registration request is complete. This preview saves verification emails locally, so nothing will arrive in your inbox. Ask the site owner for your verification link. If you already have an account, sign in.",
      };
    } else if (
      action === "forgot-password" ||
      action === "resend-verification"
    ) {
      result = await requestAccessEmail(
        payload,
        action === "forgot-password" ? "reset" : "verification",
        body,
      );
    } else if (action === "contact") {
      const data = z
        .object({
          name: z.string().trim().min(2).max(120),
          email: z.email(),
          subject: z.string().trim().min(3).max(200),
          message: z.string().trim().min(15).max(5000),
          category: z.enum([
            "General",
            "Technical",
            "Partnership",
            "Mentorship",
            "Digital Store",
            "Event",
          ]),
          website: z.string().max(0).optional(),
        })
        .parse(body);
      const { website, ...message } = data;
      await payload.create({
        collection: "contact-messages",
        data: message,
        overrideAccess: true,
      });
      result = {
        message:
          "Your message has been received. The PANS team will get back to you.",
      };
    } else if (action === "checkout")
      result = await checkout(
        payload,
        actor!,
        actions.checkoutSchema.parse(body),
      );
    else if (action === "verify-payment") {
      const data = z
        .object({ reference: z.string().min(5).max(200) })
        .parse(body);
      const order = await confirmPayment(payload, data.reference, actor!);
      result = { redirect: "/account/orders/" + order.id };
    } else if (action === "cancel-order") {
      const data = z.object({ id: actions.idSchema }).parse(body);
      result = await cancelOrder(payload, actor!, data.id);
    } else if (action === "refund-order")
      result = await issueRefund(
        payload,
        actor!,
        actions.idSchema.parse(body.id),
      );
    else if (action === "register-event")
      result = await actions.registerEvent(payload, actor!, body);
    else if (action === "event-interest")
      result = await actions.eventInterest(payload, actor!, body);
    else if (action === "request-mentor")
      result = await actions.requestMentor(payload, actor!, body);
    else if (action === "mentorship-status")
      result = await actions.mentorshipStatus(payload, actor!, body);
    else if (action === "enroll")
      result = await actions.enroll(payload, actor!, body);
    else if (action === "complete-lesson")
      result = await actions.completeLesson(payload, actor!, body);
    else if (action === "bookmark")
      result = await actions.bookmark(payload, actor!, body);
    else if (action === "apply")
      result = await actions.apply(payload, actor!, body);
    else if (action === "submit-content")
      result = await actions.submitContent(payload, actor!, body);
    else if (action === "cancel-registration")
      result = await actions.cancelRegistration(payload, actor!, body);
    else if (action === "profile") {
      const data = z
        .object({
          name: z.string().trim().min(2).max(120),
          phone: z.string().trim().max(40),
          level: z.enum(["100L", "200L", "300L", "400L", "500L", "Alumni"]),
          department: z.string().trim().min(1).max(100),
          bio: z.string().trim().max(1500),
        })
        .parse(body);
      await payload.update({
        collection: "users",
        id: actor!.id,
        data,
        overrideAccess: false,
        user: user!,
      });
      result = { message: "Your profile has been updated." };
    } else if (action === "mentor-profile") {
      assert(
        actor!.roles?.includes("mentor"),
        "This profile is not available.",
        403,
      );
      const data = z
        .object({
          description: z.string().trim().min(20).max(3000),
          availability: z.enum(["available", "limited", "unavailable"]),
          position: z.string().trim().max(200),
          expertise: z.string().trim().max(500),
        })
        .parse(body);
      const found = await payload.find({
        collection: "mentors",
        where: { owner: { equals: actor!.id } },
        limit: 1,
        overrideAccess: true,
      });
      assert(found.docs[0], "Your mentor profile is not available.", 404);
      await payload.update({
        collection: "mentors",
        id: found.docs[0].id,
        data: {
          ...data,
          expertise: data.expertise
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
        },
        overrideAccess: true,
        context: { system: true },
      });
      result = { message: "Your mentor profile has been updated." };
    } else if (action === "read-notification") {
      const data = z
        .object({ id: z.union([z.string(), z.number()]) })
        .parse(body);
      const notification = await payload.findByID({
        collection: "notifications",
        id: data.id,
        overrideAccess: false,
        user: user!,
      });
      assert(
        String(relationID(notification.owner)) === String(actor!.id),
        "This notification is not available.",
        403,
      );
      await payload.update({
        collection: "notifications",
        id: data.id,
        data: { readAt: new Date().toISOString() },
        overrideAccess: true,
      });
      result = { message: "Marked as read." };
    } else throw new DomainError("This action is not available.", 404);
    if (actor)
      await payload.create({
        collection: "audit-log",
        data: {
          actor: actor.id,
          action,
          collection: "hub",
          record: String(
            body.id || body.event || body.course || body.lesson || actor.id,
          ),
        },
        overrideAccess: true,
        context: { skipAudit: true },
      });
    return NextResponse.json(result || { message: "Saved." });
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json(
        { message: error.issues[0]?.message || "Please check your form." },
        { status: 400 },
      );
    if (error instanceof DomainError)
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    const status = (error as any)?.status;
    if (status === 403 || status === 404)
      return NextResponse.json(
        { message: "This record is not available." },
        { status },
      );
    console.error(
      "Hub action failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { message: "We could not complete that request. Please try again." },
      { status: 500 },
    );
  }
}

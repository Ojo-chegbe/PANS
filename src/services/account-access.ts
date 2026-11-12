import { randomBytes } from "node:crypto";
import type { Payload } from "payload";
import { z } from "zod";
import { DomainError } from "../lib/domain";
import { readVerificationToken, verificationEmail } from "../lib/account-links";
import { rateLimit } from "../lib/security";
import { transaction } from "../lib/transactions";
import { emailDeliveryConfigured } from "../lib/email-config";

const emailInput = z.object({
  email: z
    .email()
    .max(254)
    .transform((s) => s.trim().toLowerCase()),
});
export const resetInput = z.object({
  token: z
    .string()
    .regex(/^[a-f0-9]{40}$/, "This reset link is invalid. Request a new link."),
  password: z
    .string()
    .min(12, "Use at least 12 characters for your password.")
    .max(128),
});
export function accessEmailMessage(kind: "verification" | "reset") {
  return emailDeliveryConfigured()
    ? `If this email belongs to an ${kind === "verification" ? "unverified " : ""}account, a ${kind} link has been sent. Check your inbox and spam folder.`
    : `If this email belongs to an ${kind === "verification" ? "unverified " : ""}account, its ${kind} link has been saved in the local preview outbox. Ask the site owner for the link; no email will arrive in your inbox.`;
}
export async function requestAccessEmail(
  payload: Payload,
  kind: "verification" | "reset",
  body: unknown,
) {
  const { email } = emailInput.parse(body);
  // Apply the same limits even when the email is unknown or already verified.
  await rateLimit(payload, `${kind}-cooldown:${email}`, 1, 1);
  await rateLimit(payload, `${kind}-email:${email}`, 3, 60);
  try {
    if (kind === "reset") {
      await payload.forgotPassword({
        collection: "users",
        data: { email },
        disableEmail: false,
      });
    } else {
      const recipient = await transaction(
        payload,
        `verification:${email}`,
        async (req) => {
          const found = await payload.find({
            collection: "users",
            where: { email: { equals: email } },
            limit: 1,
            depth: 0,
            overrideAccess: true,
            req,
          });
          const user = found.docs[0];
          if (!user || user._verified) return null;
          const token = randomBytes(32).toString("hex");
          await payload.db.updateOne({
            collection: "users",
            id: user.id,
            data: { _verificationToken: token },
            req,
            returning: false,
          });
          return { email: user.email, token };
        },
      );
      if (recipient)
        await payload.sendEmail({
          to: recipient.email,
          subject: "Verify your PANS account",
          html: verificationEmail(recipient.token, payload.secret),
        });
    }
  } catch {
    // Do not expose account existence through provider failures or log tokens/addresses.
    payload.logger.error(
      `Account ${kind} email could not be completed. Check the email service and retry.`,
    );
  }
  return { message: accessEmailMessage(kind) };
}

export async function verifyAccount(payload: Payload, value: unknown) {
  const signed = z.string().max(512).parse(value);
  const token = readVerificationToken(signed, payload.secret);
  await rateLimit(payload, `verify-link:${token}`, 10, 15);
  await transaction(payload, `verify-link:${token}`, async (req) => {
    try {
      await payload.verifyEmail({ collection: "users", token, req });
    } catch (error) {
      if ((error as { status?: number }).status === 403)
        throw new DomainError(
          "This verification link is invalid or has already been used. Try signing in, or request a new link.",
          400,
        );
      throw error;
    }
  });
  return {
    message: "Your email is verified. You can now sign in.",
    verified: true,
  };
}

export async function recoverPassword(payload: Payload, body: unknown) {
  const data = resetInput.parse(body);
  await rateLimit(payload, `reset-link:${data.token}`, 8, 15);
  await transaction(payload, `reset-link:${data.token}`, async (req) => {
    const user = await payload.db.findOne({
      collection: "users",
      where: {
        and: [
          { resetPasswordToken: { equals: data.token } },
          {
            resetPasswordExpiration: { greater_than: new Date().toISOString() },
          },
        ],
      },
      req,
    });
    if (!user)
      throw new DomainError(
        "This reset link has expired or has already been used. Request a new link below.",
        410,
      );
    await payload.resetPassword({
      collection: "users",
      data,
      req,
      overrideAccess: true,
    });
    const updated = await payload.db.findOne({
      collection: "users",
      where: { id: { equals: user.id } },
      req,
    });
    // Payload revokes old sessions and creates one new session. Require an explicit
    // sign-in after recovery, including for accounts that still need verification.
    await payload.db.updateOne({
      collection: "users",
      id: user.id,
      data: { ...updated, sessions: [], resetPasswordToken: null },
      req,
      returning: false,
    });
  });
  return {
    message: "Your password has been changed. Sign in with your new password.",
    redirect: "/sign-in?reset=success",
  };
}

import type { Payload } from "payload";
import { z } from "zod";
import {
  assert,
  isStaff,
  owns,
  relationID,
  type Actor,
  type ID,
} from "@/lib/domain";
import { transaction } from "@/lib/transactions";
import { grant } from "./commerce";
import { notify } from "./notifications";
import { plainRichText } from "@/lib/richtext";
const text = (min = 1, max = 1000) => z.string().trim().min(min).max(max);
const id = z
  .union([z.number().int().positive(), z.string().regex(/^\d+$/)])
  .transform(Number)
  .pipe(z.number().int().positive());
export const idSchema = id;
const levels = z.enum(["100L", "200L", "300L", "400L", "500L", "Alumni"]);
export const checkoutSchema = z.object({
  items: z
    .array(z.object({ product: id, quantity: z.number().int().min(1).max(20) }))
    .min(1)
    .max(40),
});
export async function registerEvent(
  payload: Payload,
  user: Actor,
  input: unknown,
) {
  const data = z
    .object({
      event: id,
      phone: text(0, 40),
      level: levels,
      department: text(1, 100),
      membership: z.boolean().default(false),
    })
    .parse(input);
  return transaction(payload, "event:" + data.event, async (req) => {
    const event = await payload.findByID({
      collection: "events",
      id: data.event,
      overrideAccess: false,
      user: user as any,
      depth: 0,
      req,
    });
    assert(
      event._status === "published" && event.reviewStatus === "approved",
      "This event is not available.",
      404,
    );
    assert(
      ["upcoming", "ongoing"].includes(event.eventStatus || "") &&
        event.startsAt,
      "Registration is not open for this event.",
    );
    assert(
      !event.registrationDeadline ||
        new Date(event.registrationDeadline) > new Date(),
      "Registration has closed.",
    );
    assert(
      !event.endsAt || new Date(event.endsAt) > new Date(),
      "This event has ended.",
    );
    const key = user.id + ":" + event.id;
    const existing = await payload.find({
      collection: "registrations",
      where: { key: { equals: key } },
      limit: 1,
      overrideAccess: true,
      req,
    });
    if (existing.docs[0]?.status === "confirmed")
      return {
        message: "You are already registered.",
        redirect: "/account/events",
      };
    const count = await payload.count({
      collection: "registrations",
      where: {
        and: [
          { event: { equals: event.id } },
          { status: { equals: "confirmed" } },
        ],
      },
      overrideAccess: true,
      req,
    });
    assert(
      !event.capacity || count.totalDocs < event.capacity,
      "This event is fully booked.",
      409,
    );
    const registration = {
      owner: user.id,
      event: event.id,
      name: user.name!,
      email: user.email!,
      phone: data.phone,
      level: data.level,
      department: data.department,
      membership: data.membership,
      status: "confirmed" as const,
    };
    if (existing.docs[0])
      await payload.update({
        collection: "registrations",
        id: existing.docs[0].id,
        data: registration,
        overrideAccess: true,
        req,
      });
    else
      await payload.create({
        collection: "registrations",
        data: { key, ...registration },
        overrideAccess: true,
        req,
      });
    await notify(
      payload,
      user.id,
      "You are registered for " + event.title,
      "Your place is confirmed. View the event details and your registration in your account.",
      "/events/" + event.slug,
      req,
    );
    return { message: "Your place is confirmed.", redirect: "/account/events" };
  });
}
export async function eventInterest(
  payload: Payload,
  user: Actor,
  input: unknown,
) {
  const data = z.object({ event: id }).parse(input);
  const event = await payload.findByID({
    collection: "events",
    id: data.event,
    overrideAccess: false,
    user: user as any,
  });
  return transaction(
    payload,
    "interest:" + user.id + ":" + event.id,
    async (req) => {
      const key = user.id + ":" + event.id;
      const found = await payload.find({
        collection: "event-interests",
        where: { key: { equals: key } },
        limit: 1,
        overrideAccess: true,
        req,
      });
      if (found.docs[0]) {
        await payload.delete({
          collection: "event-interests",
          id: found.docs[0].id,
          overrideAccess: true,
          req,
        });
        return { message: "Removed from your interests." };
      }
      await payload.create({
        collection: "event-interests",
        data: { key, owner: user.id, event: event.id },
        overrideAccess: true,
        req,
      });
      return {
        message:
          "Saved to your account. We will let you know when registration opens.",
      };
    },
  );
}
export async function requestMentor(
  payload: Payload,
  user: Actor,
  input: unknown,
) {
  const data = z
    .object({
      phone: text(0, 40),
      level: levels,
      interest: text(1, 150),
      careerGoal: text(0, 1500),
      preferredType: z.enum([
        "Senior student",
        "Pharmacist",
        "Alumnus",
        "No preference",
      ]),
      message: text(15, 3000),
      requestedMentor: id.optional(),
    })
    .parse(input);
  if (data.requestedMentor)
    await payload.findByID({
      collection: "mentors",
      id: data.requestedMentor,
      overrideAccess: false,
      user: user as any,
    });
  return transaction(payload, "mentorship:" + user.id, async (req) => {
    const active = await payload.count({
      collection: "mentorship-requests",
      where: {
        and: [
          { owner: { equals: user.id } },
          {
            status: {
              in: ["submitted", "under-review", "assigned", "accepted"],
            },
          },
        ],
      },
      overrideAccess: true,
      req,
    });
    assert(
      active.totalDocs < 3,
      "You already have three active requests. Please wait for an update.",
    );
    await payload.create({
      collection: "mentorship-requests",
      data: {
        ...data,
        name: user.name!,
        email: user.email!,
        owner: user.id,
        status: "submitted",
      },
      overrideAccess: true,
      req,
    });
    await notify(
      payload,
      user.id,
      "Your mentorship request has been received",
      "The PANS team will review your request and help find a suitable mentor.",
      "/account/mentorship",
      req,
    );
    return {
      message: "Your request has been submitted.",
      redirect: "/account/mentorship",
    };
  });
}
export async function mentorshipStatus(
  payload: Payload,
  user: Actor,
  input: unknown,
) {
  const data = z
    .object({
      id,
      status: z.enum(["accepted", "declined", "completed", "cancelled"]),
    })
    .parse(input);
  return transaction(payload, "mentorship-request:" + data.id, async (req) => {
    const request = await payload.findByID({
      collection: "mentorship-requests",
      id: data.id,
      overrideAccess: true,
      depth: 0,
      req,
    });
    const mentor = owns(user, request.assignedMentor);
    assert(
      isStaff(user) || mentor || owns(user, request.owner),
      "This request is not available.",
      403,
    );
    if (!isStaff(user)) {
      if (mentor)
        assert(
          (request.status === "assigned" &&
            ["accepted", "declined"].includes(data.status)) ||
            (request.status === "accepted" && data.status === "completed"),
          "This status change is not available.",
        );
      else
        assert(
          data.status === "cancelled" &&
            ["submitted", "under-review", "assigned"].includes(
              request.status || "",
            ),
          "This request cannot be cancelled.",
        );
    }
    await payload.update({
      collection: "mentorship-requests",
      id: request.id,
      data: { status: data.status },
      overrideAccess: true,
      req,
    });
    await notify(
      payload,
      relationID(request.owner)!,
      "Mentorship request updated",
      "Your mentorship request is now " + data.status + ".",
      "/account/mentorship",
      req,
    );
    return { message: "The request has been updated." };
  });
}
export async function enroll(payload: Payload, user: Actor, input: unknown) {
  const data = z.object({ course: id }).parse(input);
  return transaction(
    payload,
    "enrolment:" + user.id + ":" + data.course,
    async (req) => {
      const course = await payload.findByID({
        collection: "courses",
        id: data.course,
        overrideAccess: false,
        user: user as any,
        req,
      });
      assert(course.isFree, "Purchase this course to enrol.");
      await grant(payload, user.id, { course: course.id }, undefined, req);
      return {
        redirect: "/learn/" + course.slug,
        message: "You are enrolled.",
      };
    },
  );
}
export async function completeLesson(
  payload: Payload,
  user: Actor,
  input: unknown,
) {
  const data = z.object({ lesson: id }).parse(input);
  const lesson = await payload.findByID({
    collection: "lessons",
    id: data.lesson,
    overrideAccess: false,
    user: user as any,
    depth: 0,
  });
  assert(lesson._status === "published", "This lesson is not available.", 404);
  const granted = await payload.count({
    collection: "entitlements",
    where: {
      and: [
        { owner: { equals: user.id } },
        { course: { equals: relationID(lesson.course) } },
        { active: { equals: true } },
      ],
    },
    overrideAccess: true,
  });
  assert(
    granted.totalDocs > 0,
    "Enrol in this course to save your progress.",
    403,
  );
  return transaction(
    payload,
    "progress:" + user.id + ":" + lesson.id,
    async (req) => {
      const key = user.id + ":" + lesson.id;
      const existing = await payload.find({
        collection: "progress",
        where: { key: { equals: key } },
        limit: 1,
        overrideAccess: true,
        req,
      });
      if (!existing.totalDocs)
        await payload.create({
          collection: "progress",
          data: {
            key,
            owner: user.id,
            lesson: lesson.id,
            course: relationID(lesson.course)!,
            completedAt: new Date().toISOString(),
          },
          overrideAccess: true,
          req,
        });
      return { message: "Lesson marked as complete." };
    },
  );
}
export async function bookmark(payload: Payload, user: Actor, input: unknown) {
  const data = z.object({ resource: id }).parse(input);
  await payload.findByID({
    collection: "resources",
    id: data.resource,
    overrideAccess: false,
    user: user as any,
  });
  return transaction(
    payload,
    "bookmark:" + user.id + ":" + data.resource,
    async (req) => {
      const key = user.id + ":" + data.resource;
      const found = await payload.find({
        collection: "bookmarks",
        where: { key: { equals: key } },
        limit: 1,
        overrideAccess: true,
        req,
      });
      if (found.docs[0]) {
        await payload.delete({
          collection: "bookmarks",
          id: found.docs[0].id,
          overrideAccess: true,
          req,
        });
        return { message: "Removed from your saved resources." };
      }
      await payload.create({
        collection: "bookmarks",
        data: { key, owner: user.id, resource: data.resource },
        overrideAccess: true,
        req,
      });
      return { message: "Resource saved to your account." };
    },
  );
}
export async function apply(payload: Payload, user: Actor, input: unknown) {
  const data = z
    .object({
      kind: z.enum(["mentor", "contributor"]),
      bio: text(30, 3000),
      expertise: text(0, 300),
      position: text(0, 200),
    })
    .parse(input);
  return transaction(
    payload,
    "application:" + data.kind + ":" + user.id,
    async (req) => {
      const collection =
        data.kind === "mentor"
          ? "mentor-applications"
          : "contributor-applications";
      const existing = await payload.find({
        collection,
        where: {
          and: [
            { owner: { equals: user.id } },
            { status: { in: ["pending", "approved"] } },
          ],
        },
        limit: 1,
        overrideAccess: true,
        req,
      });
      assert(
        !existing.totalDocs,
        "You already have an application under review or approved.",
      );
      await payload.create({
        collection,
        data: {
          owner: user.id,
          name: user.name!,
          bio: data.bio,
          expertise: data.expertise,
          position: data.position,
          status: "pending",
        },
        overrideAccess: true,
        req,
      });
      return {
        message: "Your application has been submitted.",
        redirect: "/account/contributions",
      };
    },
  );
}
export async function submitContent(
  payload: Payload,
  user: Actor,
  input: unknown,
) {
  assert(
    user.roles?.includes("contributor") || isStaff(user),
    "Apply to become a contributor before submitting content.",
    403,
  );
  const data = z
    .object({
      kind: z.enum(["resources", "articles", "products"]),
      id: id.optional(),
      title: text(3, 180),
      description: text(20, 4000),
      category: text(1, 100),
      resourceType: z
        .enum([
          "PDF",
          "Article",
          "Video",
          "Website",
          "Template",
          "Course",
          "Opportunity",
        ])
        .optional(),
      url: z
        .url()
        .refine((value) => /^https?:/.test(value), "Use an http or https link.")
        .optional()
        .or(z.literal("")),
      price: z
        .number()
        .min(0)
        .max(100000000)
        .refine(
          (value) => Math.abs(Math.round(value * 100) - value * 100) < 0.000001,
          "Use no more than two decimal places.",
        )
        .optional(),
      file: id.optional(),
    })
    .parse(input);
  if (data.file) {
    const file = await payload.findByID({
      collection: "files",
      id: data.file,
      overrideAccess: false,
      user: user as any,
    });
    assert(
      owns(user, file.owner) || isStaff(user),
      "Choose a file you uploaded.",
      403,
    );
  }
  assert(
    data.kind !== "products" || data.file,
    "Upload the product file before submitting.",
  );
  const { slugify } = await import("@/lib/domain");
  let original: any;
  if (data.id) {
    original = await payload.findByID({
      collection: data.kind,
      id: data.id,
      draft: true,
      overrideAccess: false,
      user: user as any,
    });
    assert(
      owns(user, original.owner) || isStaff(user),
      "This submission is not available.",
      403,
    );
    assert(
      ["draft", "changes-requested"].includes(original.reviewStatus),
      "Only draft submissions and requested changes can be edited.",
      409,
    );
  }
  const document = {
    title: data.title,
    slug: original?.slug || slugify(data.title) + "-" + Date.now().toString(36),
    description:
      data.kind === "articles"
        ? data.description.slice(0, 180)
        : data.description,
    ...(data.kind === "articles"
      ? { content: plainRichText(data.description) }
      : {}),
    category: data.category,
    owner: user.id,
    reviewStatus: "pending",
    _status: "draft",
    ...(data.kind === "resources"
      ? {
          resourceType: data.resourceType || "Article",
          url: data.url,
          file: data.file,
        }
      : {}),
    ...(data.kind === "products"
      ? {
          type: "digital",
          price: Math.round((data.price || 0) * 100),
          file: data.file,
        }
      : {}),
  };
  if (data.id)
    await payload.update({
      collection: data.kind,
      id: data.id,
      data: document as any,
      draft: true,
      overrideAccess: false,
      user: user as any,
    });
  else
    await payload.create({
      collection: data.kind,
      data: document as any,
      overrideAccess: false,
      user: user as any,
    });
  return {
    message: "Your submission is ready for review.",
    redirect: "/account/contributions",
  };
}
export async function cancelRegistration(
  payload: Payload,
  user: Actor,
  input: unknown,
) {
  const data = z.object({ id }).parse(input);
  return transaction(payload, "registration:" + data.id, async (req) => {
    const registration = await payload.findByID({
      collection: "registrations",
      id: data.id,
      overrideAccess: true,
      req,
    });
    assert(
      owns(user, registration.owner) || isStaff(user),
      "This registration is not available.",
      403,
    );
    await payload.update({
      collection: "registrations",
      id: data.id,
      data: { status: "cancelled" },
      overrideAccess: true,
      req,
    });
    return { message: "Your registration has been cancelled." };
  });
}

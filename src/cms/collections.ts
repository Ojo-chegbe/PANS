import path from "node:path";
import { publicMediaHeaders } from "@/lib/media";
import { isLocalPreview } from "@/lib/environment";
import { verificationEmail } from "@/lib/account-links";
import { accountEndpoints } from "./account-endpoints";
import {
  APIError,
  type CollectionConfig,
  type Field,
  type CollectionBeforeChangeHook,
} from "payload";
import {
  staff,
  administrator,
  staffField,
  adminField,
  nobody,
  ownerOrStaff,
  selfOrStaff,
  publishedOrOwner,
  submitter,
  editableByOwner,
  mentorRequests,
  privateFiles,
} from "@/lib/access";
import {
  isStaff,
  isAdmin,
  owns,
  relationID,
  slugify,
  published,
  type Actor,
} from "@/lib/domain";

const owner: Field = {
  name: "owner",
  type: "relationship",
  relationTo: "users",
  admin: { position: "sidebar" },
  access: { create: staffField, update: staffField },
};
const title: Field = { name: "title", type: "text", required: true };
const slug: Field = {
  name: "slug",
  type: "text",
  required: true,
  unique: true,
  index: true,
  hooks: {
    beforeValidate: [
      ({ value, siblingData }) => value || slugify(siblingData?.title || ""),
    ],
  },
};
const description: Field = {
  name: "description",
  type: "textarea",
  required: true,
};
const image: Field = { name: "image", type: "upload", relationTo: "media" };
const category: Field = { name: "category", type: "text", index: true };
const content: Field = { name: "content", type: "richText" };
const seo: Field = {
  type: "group",
  name: "seo",
  fields: [
    { name: "title", type: "text" },
    { name: "description", type: "textarea" },
    { name: "noIndex", type: "checkbox", defaultValue: false },
  ],
};
const review: Field = {
  name: "reviewStatus",
  type: "select",
  options: ["draft", "pending", "changes-requested", "approved", "archived"],
  defaultValue: "draft",
  required: true,
  admin: { position: "sidebar" },
};
const moderation: CollectionBeforeChangeHook = ({ data, req, originalDoc }) => {
  if (req.context.system) return data;
  const user = req.user as Actor | null;
  if (!isStaff(user)) {
    if (!user || !user.roles?.includes("contributor"))
      throw new APIError("You do not have permission to submit content.", 403);
    if (
      data._status === "published" ||
      (data.reviewStatus && !["draft", "pending"].includes(data.reviewStatus))
    )
      throw new APIError(
        "Only an editor can approve and publish content.",
        403,
      );
    data.owner = originalDoc?.owner || user.id;
    data._status = "draft";
  } else if (data._status === "published") data.reviewStatus = "approved";
  return data;
};
const audit: NonNullable<CollectionConfig["hooks"]>["afterChange"] = [
  async ({ doc, operation, req, collection }) => {
    if (req.context.skipAudit || !req.user) return doc;
    await req.payload.create({
      collection: "audit-log",
      data: {
        actor: req.user.id,
        action: operation,
        collection: collection.slug,
        record: String(doc.id),
      },
      overrideAccess: true,
      req,
      context: { skipAudit: true },
    });
    return doc;
  },
];
function editorial(
  collectionSlug: string,
  fields: Field[],
  group = "Publishing",
  contributions = true,
): CollectionConfig {
  return {
    slug: collectionSlug,
    admin: {
      useAsTitle: "title",
      group,
      defaultColumns: ["title", "reviewStatus", "updatedAt"],
    },
    access: {
      read: publishedOrOwner,
      create: contributions ? submitter : staff,
      update: contributions ? editableByOwner : staff,
      delete: administrator,
    },
    versions: { drafts: { autosave: { interval: 1500 } }, maxPerDoc: 30 },
    hooks: { beforeChange: [moderation], afterChange: audit },
    fields: [
      title,
      slug,
      description,
      ...fields,
      owner,
      review,
      {
        name: "reviewNotes",
        type: "textarea",
        access: {
          read: ({ req, doc }) =>
            isStaff(req.user as Actor | null) ||
            owns(req.user as Actor | null, doc?.owner),
          create: staffField,
          update: staffField,
        },
      },
      seo,
    ],
  };
}
const operations = (
  collectionSlug: string,
  fields: Field[],
  options: Partial<CollectionConfig> = {},
): CollectionConfig => ({
  slug: collectionSlug,
  admin: {
    group: "Platform activity",
    defaultColumns: ["id", "createdAt"],
    ...options.admin,
  },
  access: {
    read: ownerOrStaff,
    create: nobody,
    update: nobody,
    delete: administrator,
    ...options.access,
  },
  fields: [owner, ...fields],
  ...Object.fromEntries(
    Object.entries(options).filter(
      ([key]) => key !== "admin" && key !== "access",
    ),
  ),
});
const immutable = { create: () => false, update: () => false };

export const Users: CollectionConfig = {
  slug: "users",
  endpoints: accountEndpoints,
  // Account mutations use the guarded REST workflows, including expiry checks.
  graphQL: false,
  auth: {
    verify: true,
    tokenExpiration: 7200,
    maxLoginAttempts: 8,
    lockTime: 15 * 60 * 1000,
    useSessions: true,
    cookies: {
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production" && !isLocalPreview(),
    },
  },
  admin: {
    useAsTitle: "name",
    group: "People",
    defaultColumns: ["name", "email", "roles"],
    hidden: ({ user }) => !isStaff(user as Actor | null),
  },
  access: {
    admin: ({ req }) => isStaff(req.user as Actor | null),
    read: selfOrStaff,
    create: administrator,
    update: selfOrStaff,
    delete: administrator,
    unlock: administrator,
  },
  hooks: {
    beforeOperation: [
      ({ args, operation, req }) => {
        if (
          (operation === "create" ||
            operation === "update" ||
            operation === "updateByID") &&
          "data" in args &&
          args.data &&
          Object.hasOwn(args.data, "roles") &&
          !req.context.system &&
          !isAdmin(req.user as Actor | null)
        )
          throw new APIError("You cannot change account permissions.", 403);
        return args;
      },
    ],
    beforeChange: [
      ({ data, req }) => {
        if (data.email) data.email = data.email.trim().toLowerCase();
        return data;
      },
    ],
    afterChange: audit,
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "roles",
      type: "select",
      hasMany: true,
      required: true,
      defaultValue: ["student"],
      options: ["admin", "manager", "mentor", "contributor", "student"],
      access: { create: adminField, update: adminField },
    },
    {
      name: "level",
      type: "select",
      options: ["100L", "200L", "300L", "400L", "500L", "Alumni"],
    },
    { name: "phone", type: "text" },
    { name: "department", type: "text", defaultValue: "Pharmacy" },
    { name: "bio", type: "textarea" },
    { name: "photo", type: "upload", relationTo: "media" },
    {
      name: "membershipVerified",
      type: "checkbox",
      defaultValue: false,
      access: { create: staffField, update: staffField },
    },
  ],
};
export const Media: CollectionConfig = {
  slug: "media",
  admin: { group: "Files", useAsTitle: "alt" },
  access: {
    read: () => true,
    create: submitter,
    update: ownerOrStaff,
    delete: ownerOrStaff,
  },
  upload: {
    staticDir: path.resolve(".data/media"),
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    imageSizes: [
      { name: "card", width: 860, withoutEnlargement: true },
      { name: "thumbnail", width: 320, withoutEnlargement: true },
    ],
    adminThumbnail: "thumbnail",
    modifyResponseHeaders: publicMediaHeaders,
    formatOptions: { format: "webp", options: { quality: 82 } },
  },
  hooks: {
    beforeChange: [
      ({ data, req, originalDoc }) => {
        if (!isStaff(req.user as Actor | null) && req.user)
          data.owner = relationID(originalDoc?.owner) || req.user.id;
        return data;
      },
    ],
  },
  fields: [{ name: "alt", type: "text", required: true }, owner],
};
export const Files: CollectionConfig = {
  slug: "files",
  admin: {
    group: "Files",
    useAsTitle: "label",
    components: { beforeList: ["/components/admin/VideoUpload#VideoUpload"] },
  },
  access: {
    read: privateFiles,
    create: submitter,
    update: ownerOrStaff,
    delete: administrator,
  },
  upload: {
    staticDir: path.resolve(".data/files"),
    // Large multipart uploads are registered only by the trusted finalize endpoint.
    filesRequiredOnCreate: false,
    mimeTypes: [
      "application/pdf",
      "application/zip",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "video/mp4",
      "audio/mpeg",
    ],
  },
  hooks: {
    beforeValidate: [
      ({ data, req, operation, originalDoc }) => {
        if (req.context.verifiedVideoUpload || req.file) return data;
        if (operation === "create")
          throw new APIError(
            "Choose a file, or use the resumable video uploader.",
            400,
          );
        for (const field of [
          "filename",
          "prefix",
          "_objectKey",
          "mimeType",
          "filesize",
        ]) {
          if (
            data?.[field] !== undefined &&
            data[field] !== originalDoc?.[field]
          )
            throw new APIError(
              "Upload a replacement file to change its storage details.",
              400,
            );
        }
        return data;
      },
    ],
    beforeChange: [
      ({ data, req, originalDoc }) => {
        if (!isStaff(req.user as Actor | null) && req.user) {
          data.owner = relationID(originalDoc?.owner) || req.user.id;
          data.visibility = "private";
        }
        return data;
      },
    ],
  },
  fields: [
    { name: "label", type: "text", required: true },
    {
      name: "visibility",
      type: "select",
      options: ["private", "members"],
      defaultValue: "private",
      required: true,
      access: { create: staffField, update: staffField },
    },
    owner,
  ],
};
export const Products = editorial(
  "products",
  [
    image,
    category,
    {
      name: "type",
      type: "select",
      options: ["digital", "course", "physical"],
      required: true,
    },
    {
      name: "price",
      type: "number",
      required: true,
      min: 0,
      admin: { description: "Amount in kobo. ₦2,500 = 250000 kobo." },
      validate: (value: number | null | undefined) =>
        value == null ||
        Number.isSafeInteger(value) ||
        "Enter a whole number of kobo.",
    },
    { name: "file", type: "upload", relationTo: "files" },
    { name: "course", type: "relationship", relationTo: "courses" },
    {
      name: "stock",
      type: "number",
      min: 0,
      defaultValue: 0,
      access: { create: staffField, update: staffField },
    },
    { name: "featured", type: "checkbox" },
    { name: "displayOrder", type: "number", defaultValue: 0 },
    content,
  ],
  "Store",
);
Products.hooks!.beforeChange!.push(async ({ data, originalDoc, req }) => {
  if (data._status !== "published") return data;
  const next = { ...originalDoc, ...data };
  if (next.type === "digital" && !next.file)
    throw new APIError(
      "Upload a protected file before publishing this digital product.",
      400,
    );
  if (next.type === "course" && !next.course)
    throw new APIError("Choose a course before publishing this product.", 400);
  if (next.type === "digital") {
    const file = await req.payload.findByID({
      collection: "files",
      id: relationID(next.file)!,
      depth: 0,
      overrideAccess: true,
      req,
    });
    if (file.visibility !== "private")
      throw new APIError("Paid product files must be private.", 400);
  }
  return data;
});
export const Courses = editorial(
  "courses",
  [
    image,
    category,
    { name: "instructor", type: "text" },
    {
      name: "delivery",
      type: "select",
      options: ["self-paced", "live"],
      defaultValue: "self-paced",
    },
    { name: "isFree", type: "checkbox", defaultValue: false },
    { name: "duration", type: "text" },
    {
      name: "modules",
      type: "array",
      fields: [{ name: "title", type: "text", required: true }],
    },
    content,
  ],
  "Learning",
);
export const Lessons = editorial(
  "lessons",
  [
    {
      name: "course",
      type: "relationship",
      relationTo: "courses",
      required: true,
      index: true,
    },
    { name: "module", type: "text" },
    { name: "position", type: "number", required: true, defaultValue: 0 },
    { name: "preview", type: "checkbox", defaultValue: false },
    content,
    {
      name: "videoURL",
      type: "text",
      admin: {
        description: "Use an HTTPS video URL from an approved provider.",
      },
    },
    {
      name: "attachments",
      type: "array",
      fields: [
        { name: "file", type: "upload", relationTo: "files", required: true },
      ],
    },
  ],
  "Learning",
  false,
);
Lessons.access!.read = async ({ req }) => {
  if (isStaff(req.user as Actor | null)) return true;
  const base = { and: [published, { preview: { equals: true } }] };
  if (!req.user) return base as any;
  const grants = await req.payload.find({
    collection: "entitlements",
    where: {
      and: [{ owner: { equals: req.user.id } }, { active: { equals: true } }],
    },
    limit: 500,
    depth: 0,
    overrideAccess: true,
    req,
  });
  return {
    and: [
      published,
      {
        or: [
          { preview: { equals: true } },
          {
            course: {
              in: grants.docs.map((x) => relationID(x.course)).filter(Boolean),
            },
          },
        ],
      },
    ],
  } as any;
};
export const Resources = editorial("resources", [
  image,
  category,
  {
    name: "level",
    type: "select",
    hasMany: true,
    options: ["100L", "200L", "300L", "400L", "500L", "Alumni"],
  },
  {
    name: "resourceType",
    type: "select",
    options: [
      "PDF",
      "Article",
      "Video",
      "Website",
      "Template",
      "Course",
      "Opportunity",
    ],
    required: true,
  },
  { name: "url", type: "text" },
  { name: "file", type: "upload", relationTo: "files" },
  content,
]);
export const Articles = editorial("articles", [
  image,
  category,
  { name: "tags", type: "text", hasMany: true },
  content,
]);
export const Opportunities = editorial("opportunities", [
  category,
  { name: "organization", type: "text" },
  { name: "deadline", type: "date" },
  { name: "eligibility", type: "textarea" },
  { name: "location", type: "text" },
  { name: "url", type: "text", required: true },
  content,
]);
export const Mentors = editorial(
  "mentors",
  [
    image,
    { name: "position", type: "text" },
    { name: "expertise", type: "text", hasMany: true },
    { name: "yearsExperience", type: "number", min: 0 },
    {
      name: "availability",
      type: "select",
      options: ["available", "limited", "unavailable"],
      defaultValue: "available",
    },
    { name: "capacity", type: "number", min: 1, defaultValue: 5 },
    { name: "linkedin", type: "text" },
    content,
  ],
  "People",
  false,
);
export const Events = editorial(
  "events",
  [
    image,
    category,
    { name: "startsAt", type: "date" },
    { name: "endsAt", type: "date" },
    { name: "registrationDeadline", type: "date" },
    { name: "venue", type: "text" },
    {
      name: "mode",
      type: "select",
      options: ["in-person", "online", "hybrid"],
      defaultValue: "hybrid",
    },
    { name: "capacity", type: "number", min: 1 },
    {
      name: "eventStatus",
      type: "select",
      options: ["announced", "upcoming", "ongoing", "completed", "cancelled"],
      defaultValue: "announced",
    },
    {
      name: "speakers",
      type: "array",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "position", type: "text" },
      ],
    },
    {
      name: "schedule",
      type: "array",
      fields: [
        { name: "time", type: "text", required: true },
        { name: "activity", type: "text", required: true },
      ],
    },
    content,
  ],
  "Events",
  false,
);
export const Leadership = editorial(
  "leadership",
  [
    { name: "session", type: "text", required: true, unique: true },
    { name: "verified", type: "checkbox", defaultValue: false },
    image,
    { name: "president", type: "text" },
    { name: "vision", type: "textarea" },
    {
      name: "achievements",
      type: "array",
      fields: [{ name: "text", type: "textarea", required: true }],
    },
    {
      name: "executives",
      type: "array",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "position", type: "text", required: true },
        { name: "photo", type: "upload", relationTo: "media" },
      ],
    },
    content,
  ],
  "Association",
  false,
);
export const Albums = editorial(
  "albums",
  [image, { name: "event", type: "relationship", relationTo: "events" }],
  "Association",
  false,
);
export const Photos: CollectionConfig = {
  slug: "photos",
  admin: { group: "Association", useAsTitle: "caption" },
  access: { read: () => true, create: staff, update: staff, delete: staff },
  fields: [
    {
      name: "album",
      type: "relationship",
      relationTo: "albums",
      required: true,
    },
    { name: "image", type: "upload", relationTo: "media", required: true },
    { name: "caption", type: "text", required: true },
    { name: "position", type: "number", defaultValue: 0 },
  ],
  hooks: { afterChange: audit },
};
export const Projects = editorial(
  "projects",
  [
    image,
    {
      name: "milestones",
      type: "array",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea" },
        { name: "complete", type: "checkbox", defaultValue: false },
      ],
    },
    content,
  ],
  "Association",
  false,
);
export const Pages = editorial(
  "pages",
  [
    content,
    {
      name: "blocks",
      type: "blocks",
      blocks: [
        {
          slug: "text",
          fields: [
            { name: "heading", type: "text" },
            { name: "body", type: "richText" },
          ],
        },
        {
          slug: "image",
          fields: [
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              required: true,
            },
            { name: "caption", type: "text" },
          ],
        },
        {
          slug: "links",
          fields: [
            { name: "heading", type: "text" },
            {
              name: "items",
              type: "array",
              fields: [
                { name: "label", type: "text", required: true },
                { name: "url", type: "text", required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
  "Website",
  false,
);
export const Orders = operations(
  "orders",
  [
    {
      name: "reference",
      type: "text",
      required: true,
      unique: true,
      access: immutable,
    },
    { name: "customerEmail", type: "email", required: true, access: immutable },
    { name: "total", type: "number", required: true, access: immutable },
    { name: "currency", type: "text", defaultValue: "NGN", access: immutable },
    {
      name: "paymentStatus",
      type: "select",
      options: ["pending", "paid", "refund-pending", "refunded", "cancelled"],
      defaultValue: "pending",
      access: immutable,
    },
    {
      name: "fulfilment",
      type: "select",
      options: [
        "pending",
        "ready-for-collection",
        "collected",
        "complete",
        "needs-attention",
        "cancelled",
      ],
      defaultValue: "pending",
      access: { create: staffField, update: staffField },
    },
    { name: "providerID", type: "text", access: immutable },
    { name: "checkoutURL", type: "text", access: immutable },
    {
      name: "stockReserved",
      type: "checkbox",
      defaultValue: false,
      access: immutable,
    },
    { name: "reservationExpiresAt", type: "date", access: immutable },
    {
      name: "items",
      type: "array",
      access: immutable,
      fields: [
        { name: "product", type: "relationship", relationTo: "products" },
        { name: "title", type: "text", required: true },
        { name: "quantity", type: "number", required: true },
        { name: "unitPrice", type: "number", required: true },
        {
          name: "type",
          type: "select",
          options: ["digital", "course", "physical"],
        },
        { name: "course", type: "relationship", relationTo: "courses" },
        { name: "file", type: "relationship", relationTo: "files" },
      ],
    },
  ],
  {
    admin: {
      group: "Store",
      useAsTitle: "reference",
      defaultColumns: [
        "reference",
        "customerEmail",
        "total",
        "paymentStatus",
        "fulfilment",
      ],
    },
    access: { update: staff },
    hooks: { afterChange: audit },
  },
);
export const Entitlements = operations(
  "entitlements",
  [
    { name: "key", type: "text", unique: true, required: true },
    { name: "product", type: "relationship", relationTo: "products" },
    { name: "course", type: "relationship", relationTo: "courses" },
    { name: "order", type: "relationship", relationTo: "orders" },
    { name: "files", type: "relationship", hasMany: true, relationTo: "files" },
    { name: "active", type: "checkbox", defaultValue: true },
  ],
  { admin: { group: "Store" } },
);
export const Enrollments = operations(
  "enrollments",
  [
    { name: "key", type: "text", unique: true, required: true },
    {
      name: "course",
      type: "relationship",
      relationTo: "courses",
      required: true,
    },
  ],
  { admin: { group: "Learning" } },
);
export const Progress = operations(
  "progress",
  [
    { name: "key", type: "text", unique: true, required: true },
    {
      name: "lesson",
      type: "relationship",
      relationTo: "lessons",
      required: true,
    },
    {
      name: "course",
      type: "relationship",
      relationTo: "courses",
      required: true,
    },
    { name: "completedAt", type: "date", required: true },
  ],
  { admin: { group: "Learning" } },
);
export const Registrations = operations(
  "registrations",
  [
    { name: "key", type: "text", unique: true, required: true },
    {
      name: "event",
      type: "relationship",
      relationTo: "events",
      required: true,
      index: true,
    },
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "level", type: "text" },
    { name: "department", type: "text" },
    { name: "membership", type: "checkbox" },
    {
      name: "status",
      type: "select",
      options: ["confirmed", "cancelled"],
      defaultValue: "confirmed",
    },
  ],
  {
    admin: {
      group: "Events",
      defaultColumns: ["event", "name", "email", "status"],
    },
  },
);
export const EventInterests = operations(
  "event-interests",
  [
    { name: "key", type: "text", unique: true, required: true },
    {
      name: "event",
      type: "relationship",
      relationTo: "events",
      required: true,
    },
  ],
  { admin: { group: "Events" } },
);
export const MentorshipRequests = operations(
  "mentorship-requests",
  [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "level", type: "text", required: true },
    { name: "interest", type: "text", required: true },
    { name: "careerGoal", type: "textarea" },
    {
      name: "preferredType",
      type: "select",
      options: ["Senior student", "Pharmacist", "Alumnus", "No preference"],
    },
    { name: "message", type: "textarea", required: true },
    { name: "requestedMentor", type: "relationship", relationTo: "mentors" },
    { name: "assignedMentor", type: "relationship", relationTo: "users" },
    {
      name: "status",
      type: "select",
      options: [
        "submitted",
        "under-review",
        "assigned",
        "accepted",
        "declined",
        "completed",
        "cancelled",
      ],
      defaultValue: "submitted",
    },
    {
      name: "adminNotes",
      type: "textarea",
      access: { read: staffField, create: staffField, update: staffField },
    },
  ],
  {
    admin: {
      group: "People",
      useAsTitle: "name",
      defaultColumns: ["name", "interest", "status", "assignedMentor"],
    },
    access: { read: mentorRequests, update: staff },
    hooks: {
      beforeChange: [
        ({ data, originalDoc, req }) => {
          if (
            !req.context.system &&
            data.assignedMentor &&
            !isStaff(req.user as Actor | null)
          )
            throw new APIError("Only a manager can assign mentors.", 403);
          if (data.assignedMentor && !data.status) data.status = "assigned";
          return data;
        },
      ],
      afterChange: audit,
    },
  },
);
function application(
  collectionSlug: "mentor-applications" | "contributor-applications",
): CollectionConfig {
  return operations(
    collectionSlug,
    [
      { name: "name", type: "text", required: true },
      { name: "bio", type: "textarea", required: true },
      { name: "expertise", type: "text" },
      { name: "position", type: "text" },
      {
        name: "status",
        type: "select",
        options: ["pending", "approved", "declined"],
        defaultValue: "pending",
        access: { create: staffField, update: staffField },
      },
      {
        name: "reviewNotes",
        type: "textarea",
        access: { create: staffField, update: staffField },
      },
    ],
    {
      admin: { group: "People", useAsTitle: "name" },
      access: { update: staff },
      hooks: {
        afterChange: [
          async ({ doc, previousDoc, req }) => {
            if (
              doc.status === "approved" &&
              previousDoc?.status !== "approved"
            ) {
              const id = relationID(doc.owner);
              if (id) {
                const user = await req.payload.findByID({
                  collection: "users",
                  id,
                  overrideAccess: true,
                  req,
                });
                const role: "mentor" | "contributor" =
                  collectionSlug === "mentor-applications"
                    ? "mentor"
                    : "contributor";
                await req.payload.update({
                  collection: "users",
                  id,
                  data: { roles: [...new Set([...(user.roles || []), role])] },
                  overrideAccess: true,
                  req,
                  context: { system: true },
                });
                if (role === "mentor") {
                  const existing = await req.payload.find({
                    collection: "mentors",
                    where: { owner: { equals: id } },
                    limit: 1,
                    overrideAccess: true,
                    req,
                  });
                  if (!existing.totalDocs)
                    await req.payload.create({
                      collection: "mentors",
                      data: {
                        title: doc.name,
                        slug: slugify(doc.name) + "-" + id,
                        description: doc.bio,
                        expertise: doc.expertise ? [doc.expertise] : [],
                        position: doc.position,
                        owner: id,
                        reviewStatus: "approved",
                        _status: "published",
                      },
                      overrideAccess: true,
                      req,
                      context: { system: true },
                    });
                }
              }
            }
            return doc;
          },
          ...audit!,
        ],
      },
    },
  );
}
export const MentorApplications = application("mentor-applications");
export const ContributorApplications = application("contributor-applications");
export const Bookmarks = operations("bookmarks", [
  { name: "key", type: "text", unique: true, required: true },
  {
    name: "resource",
    type: "relationship",
    relationTo: "resources",
    required: true,
  },
]);
export const Notifications = operations("notifications", [
  { name: "title", type: "text", required: true },
  { name: "message", type: "textarea", required: true },
  { name: "url", type: "text" },
  { name: "readAt", type: "date" },
]);
export const Contacts: CollectionConfig = {
  slug: "contact-messages",
  admin: { group: "Platform activity", useAsTitle: "subject" },
  access: { read: staff, create: nobody, update: staff, delete: administrator },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "subject", type: "text", required: true },
    {
      name: "category",
      type: "select",
      options: [
        "General",
        "Technical",
        "Partnership",
        "Mentorship",
        "Digital Store",
        "Event",
      ],
    },
    { name: "message", type: "textarea", required: true },
    { name: "resolved", type: "checkbox", defaultValue: false },
  ],
};
export const AuditLog: CollectionConfig = {
  slug: "audit-log",
  admin: {
    group: "Administration",
    defaultColumns: ["actor", "action", "collection", "record", "createdAt"],
  },
  access: {
    read: administrator,
    create: nobody,
    update: nobody,
    delete: nobody,
  },
  fields: [
    { name: "actor", type: "relationship", relationTo: "users" },
    { name: "action", type: "text", required: true },
    { name: "collection", type: "text", required: true },
    { name: "record", type: "text", required: true },
  ],
};
export const RateLimits: CollectionConfig = {
  slug: "rate-limits",
  admin: { hidden: true },
  access: { read: nobody, create: nobody, update: nobody, delete: nobody },
  fields: [
    { name: "key", type: "text", unique: true, required: true },
    { name: "count", type: "number", required: true },
    { name: "expiresAt", type: "date", required: true },
  ],
};
Products.fields.push({
  name: "salesOpen",
  type: "checkbox",
  defaultValue: false,
  admin: {
    description: "Enable purchases only when content or stock is ready.",
  },
  access: { create: staffField, update: staffField },
});
Events.fields.push({
  name: "registrationsExport",
  type: "ui",
  admin: { components: { Field: "/components/admin/EventExport#EventExport" } },
});
Orders.fields.push({
  name: "paymentActions",
  type: "ui",
  admin: {
    components: { Field: "/components/admin/EventExport#OrderPaymentActions" },
  },
});
for (const collection of [
  Products,
  Courses,
  Lessons,
  Resources,
  Articles,
  Opportunities,
  Mentors,
  Events,
  Leadership,
  Albums,
  Projects,
  Pages,
]) {
  collection.admin = {
    ...collection.admin,
    preview: (doc) =>
      (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000") +
      "/preview/" +
      collection.slug +
      "/" +
      doc.id,
  };
  collection.access = { ...collection.access, readVersions: ownerOrStaff };
}
Lessons.fields.push(
  {
    name: "largeVideoUpload",
    type: "ui",
    admin: {
      components: { Field: "/components/admin/VideoUpload#LessonVideoUpload" },
    },
  },
  {
    name: "videoFile",
    type: "upload",
    relationTo: "files",
    filterOptions: { mimeType: { equals: "video/mp4" } },
    admin: {
      description:
        "Choose an existing video, or upload one above. Save the lesson to keep your selection.",
    },
  },
);
Users.auth = {
  ...(typeof Users.auth === "object" ? Users.auth : {}),
  verify: {
    generateEmailSubject: () => "Verify your PANS account",
    generateEmailHTML: ({ token, req }: any) =>
      verificationEmail(token, req.payload.secret),
  },
  forgotPassword: {
    expiration: 60 * 60 * 1000,
    generateEmailSubject: () => "Reset your PANS password",
    generateEmailHTML: ({ token }: any) =>
      '<p>A password reset was requested for your PANS account.</p><p><a href="' +
      (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000") +
      "/reset-password?token=" +
      encodeURIComponent(token) +
      '">Choose a new password</a></p><p>This link expires in one hour. Only the most recent reset link will work.</p><p>If you did not request this, you can ignore this email.</p>',
  },
};
Users.hooks!.beforeChange!.push(({ data, req }) => {
  if (!req.context.system && !isStaff(req.user as Actor | null)) {
    delete data._verified;
    delete data.membershipVerified;
  }
  return data;
});
Users.hooks!.beforeChange!.push(({ data }) => {
  if (
    data.password &&
    (data.password.length < 12 || data.password.length > 128)
  )
    throw new APIError("Use a password between 12 and 128 characters.", 400);
  return data;
});
Resources.hooks!.beforeChange!.push(async ({ data, originalDoc, req }) => {
  const next = { ...originalDoc, ...data };
  if (data._status === "published" && next.file) {
    const fileID = relationID(next.file)!;
    const products = await req.payload.count({
      collection: "products",
      where: { file: { equals: fileID } },
      overrideAccess: true,
      req,
    });
    if (products.totalDocs)
      throw new APIError(
        "Use a separate file for a free resource. This file belongs to a store product.",
        400,
      );
    await req.payload.update({
      collection: "files",
      id: fileID,
      data: { visibility: "members" },
      overrideAccess: true,
      req,
    });
  }
  return data;
});
export const Downloads = operations(
  "downloads",
  [
    { name: "product", type: "relationship", relationTo: "products" },
    { name: "resource", type: "relationship", relationTo: "resources" },
    { name: "file", type: "relationship", relationTo: "files", required: true },
  ],
  { admin: { group: "Store" } },
);
export const Carts = operations(
  "carts",
  [
    { name: "key", type: "text", required: true, unique: true },
    {
      name: "items",
      type: "array",
      fields: [
        {
          name: "product",
          type: "relationship",
          relationTo: "products",
          required: true,
        },
        { name: "quantity", type: "number", required: true, min: 1, max: 20 },
      ],
    },
  ],
  { admin: { hidden: true } },
);
export const allCollections = [
  Users,
  Media,
  Files,
  Products,
  Courses,
  Lessons,
  Resources,
  Articles,
  Opportunities,
  Mentors,
  Events,
  Leadership,
  Albums,
  Photos,
  Projects,
  Pages,
  Orders,
  Entitlements,
  Enrollments,
  Progress,
  Registrations,
  EventInterests,
  MentorshipRequests,
  MentorApplications,
  ContributorApplications,
  Bookmarks,
  Notifications,
  Contacts,
  AuditLog,
  RateLimits,
  Downloads,
  Carts,
];

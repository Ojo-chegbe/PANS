import type { GlobalConfig } from "payload";
import { staff } from "@/lib/access";
import { isStaff, type Actor } from "@/lib/domain";
import { sections } from "@/lib/sections";
const access = { read: () => true, update: staff };
export const Home: GlobalConfig = {
  slug: "home",
  label: "Homepage",
  admin: { group: "Website" },
  access,
  versions: { drafts: true, max: 30 },
  fields: [
    {
      name: "hero",
      type: "group",
      fields: [
        { name: "eyebrow", type: "text", required: true },
        {
          name: "title",
          type: "textarea",
          required: true,
          admin: {
            description: "Use a new line where the heading should break.",
          },
        },
        { name: "description", type: "textarea", required: true },
        { name: "image", type: "upload", relationTo: "media" },
        { name: "caption", type: "text" },
        { name: "captionDescription", type: "textarea" },
        { name: "primaryLabel", type: "text" },
        { name: "primaryURL", type: "text" },
        { name: "secondaryLabel", type: "text" },
        { name: "secondaryURL", type: "text" },
      ],
    },
    {
      name: "stats",
      type: "array",
      fields: [
        { name: "value", type: "text", required: true },
        { name: "label", type: "text", required: true },
      ],
    },
    {
      name: "pathways",
      type: "array",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "text" },
        { name: "url", type: "text", required: true },
      ],
    },
    {
      name: "sections",
      type: "array",
      admin: {
        description:
          "Drag sections to reorder them. Existing layouts preserve the approved mock.",
      },
      fields: [
        {
          name: "kind",
          type: "select",
          required: true,
          options: [
            "store",
            "archive",
            "mentorship",
            "events",
            "about",
            "gallery",
            "resources",
            "articles",
            "opportunities",
          ],
        },
        { name: "visible", type: "checkbox", defaultValue: true },
        { name: "eyebrow", type: "text" },
        { name: "title", type: "textarea", required: true },
        { name: "description", type: "textarea" },
      ],
    },
    {
      name: "storePromos",
      type: "array",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea" },
        { name: "priceLabel", type: "text" },
        { name: "url", type: "text", required: true },
      ],
    },
    { name: "vision", type: "textarea" },
    { name: "mission", type: "textarea" },
    {
      name: "announcement",
      type: "group",
      fields: [
        { name: "visible", type: "checkbox", defaultValue: false },
        { name: "text", type: "text" },
        { name: "url", type: "text" },
      ],
    },
  ],
};
export const Settings: GlobalConfig = {
  slug: "settings",
  label: "Site settings",
  admin: { group: "Website" },
  access,
  versions: { max: 30 },
  fields: [
    {
      name: "siteName",
      type: "text",
      required: true,
      defaultValue: "PANS Digital Hub",
    },
    { name: "description", type: "textarea" },
    { name: "contactEmail", type: "email" },
    { name: "contactPhone", type: "text" },
    { name: "address", type: "textarea" },
    {
      name: "navigation",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "url", type: "text", required: true },
      ],
    },
    { name: "footerDescription", type: "textarea" },
    {
      name: "footerGroups",
      type: "array",
      fields: [
        { name: "title", type: "text", required: true },
        {
          name: "links",
          type: "array",
          fields: [
            { name: "label", type: "text", required: true },
            { name: "url", type: "text", required: true },
          ],
        },
      ],
    },
    {
      name: "socialLinks",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "url", type: "text", required: true },
      ],
    },
    {
      name: "collectionInstructions",
      type: "textarea",
      defaultValue:
        "Collect your order from the PANS team on campus. You will be notified when it is ready.",
    },
    {
      name: "copyright",
      type: "text",
      defaultValue:
        "Pharmaceutical Association of Nigerian Students — University of Jos Chapter",
    },
  ],
};
Home.access = {
  ...Home.access,
  readVersions: staff,
  read: ({ req }) =>
    req.query?.draft === "true" || req.query?.draft === true
      ? isStaff(req.user as Actor | null)
      : true,
};
Home.admin = {
  ...Home.admin,
  preview: () =>
    (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000") +
    "/?preview=true",
};
Settings.access = { ...Settings.access, readVersions: staff };
const heroFields = Home.fields.find(
  (field) => "name" in field && field.name === "hero",
);
if (heroFields && "fields" in heroFields)
  heroFields.fields.push({
    name: "photoLabel",
    type: "text",
    defaultValue: "UNIVERSITY OF JOS CHAPTER",
  });
Settings.fields.push({
  name: "pageIntros",
  label: "Page headings and introductions",
  type: "array",
  defaultValue: Object.entries(sections).map(([key, value]) => ({
    key,
    title: value.title,
    eyebrow: value.eyebrow,
    description: value.description,
  })),
  fields: [
    {
      name: "key",
      type: "text",
      required: true,
      admin: {
        description:
          "Page URL name, such as store, resources, contact, or mentorship.",
      },
    },
    { name: "title", type: "textarea", required: true },
    { name: "eyebrow", type: "text" },
    { name: "description", type: "textarea" },
  ],
});

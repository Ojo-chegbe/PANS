import type { Access, FieldAccess, Where } from "payload";
import { isStaff, isAdmin, relationID, published, type Actor } from "./domain";
export const staff: Access = ({ req }) => isStaff(req.user as Actor | null);
export const administrator: Access = ({ req }) =>
  isAdmin(req.user as Actor | null);
export const adminField: FieldAccess = ({ req }) =>
  isAdmin(req.user as Actor | null);
export const staffField: FieldAccess = ({ req }) =>
  isStaff(req.user as Actor | null);
export const nobody: Access = () => false;
export const ownerOrStaff: Access = ({ req }) =>
  isStaff(req.user as Actor | null)
    ? true
    : req.user
      ? { owner: { equals: req.user.id } }
      : false;
export const selfOrStaff: Access = ({ req }) =>
  isStaff(req.user as Actor | null)
    ? true
    : req.user
      ? { id: { equals: req.user.id } }
      : false;
export const publishedOrOwner: Access = ({ req }) => {
  if (isStaff(req.user as Actor | null)) return true;
  return req.user
    ? ({ or: [published, { owner: { equals: req.user.id } }] } as Where)
    : (published as Where);
};
export const submitter: Access = ({ req }) =>
  isStaff(req.user as Actor | null) ||
  Boolean((req.user as Actor | null)?.roles?.includes("contributor"));
export const editableByOwner: Access = ({ req }) =>
  isStaff(req.user as Actor | null)
    ? true
    : req.user
      ? ({
          and: [
            { owner: { equals: req.user.id } },
            { reviewStatus: { in: ["draft", "changes-requested"] } },
          ],
        } as Where)
      : false;
export const mentorRequests: Access = ({ req }) =>
  isStaff(req.user as Actor | null)
    ? true
    : req.user
      ? ({
          or: [
            { owner: { equals: req.user.id } },
            { assignedMentor: { equals: req.user.id } },
          ],
        } as Where)
      : false;
export const privateFiles: Access = async ({ req }) => {
  if (isStaff(req.user as Actor | null)) return true;
  if (!req.user) return false;
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
  const files = grants.docs.flatMap((grant) =>
    ((grant.files as unknown[]) || []).map(relationID).filter(Boolean),
  );
  const courseIDs = grants.docs
    .map((grant) => relationID(grant.course))
    .filter(Boolean);
  if (courseIDs.length) {
    const lessons = await req.payload.find({
      collection: "lessons",
      where: {
        and: [
          { course: { in: courseIDs } },
          { _status: { equals: "published" } },
        ],
      },
      limit: 1000,
      depth: 0,
      overrideAccess: true,
      req,
    });
    for (const lesson of lessons.docs) {
      for (const attachment of lesson.attachments || []) {
        const id = relationID(attachment.file);
        if (id) files.push(id);
      }
      const video = relationID(lesson.videoFile);
      if (video) files.push(video);
    }
  }
  return {
    or: [
      { owner: { equals: req.user.id } },
      { visibility: { equals: "members" } },
      { id: { in: files } },
    ],
  } as Where;
};

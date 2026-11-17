import { notFound } from "next/navigation";
import { MediaImage } from "@/components/MediaImage";
import { getCMS, getSession, mediaURL } from "@/lib/payload";
import { isStaff, owns, type Actor } from "@/lib/domain";
import { PageIntro, Body } from "@/components/Content";
export const metadata = {
  title: "Content preview",
  robots: { index: false, follow: false },
};
export default async function Preview({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}) {
  const user = await getSession();
  if (!user) notFound();
  const { collection, id } = await params;
  if (
    ![
      "products",
      "courses",
      "lessons",
      "resources",
      "articles",
      "opportunities",
      "mentors",
      "events",
      "leadership",
      "albums",
      "projects",
      "pages",
    ].includes(collection)
  )
    notFound();
  const payload = await getCMS();
  const doc: any = await payload
    .findByID({
      collection: collection as any,
      id,
      draft: true,
      overrideAccess: false,
      user,
    })
    .catch(() => null);
  if (!doc || (!isStaff(user as Actor) && !owns(user, doc.owner))) notFound();
  return (
    <div className="wrap page-shell">
      <p className="form-feedback">
        Preview · This draft is only visible to authorized editors.
      </p>
      <PageIntro title={doc.title} description={doc.description} />
      {mediaURL(doc.image) && (
        <MediaImage
          className="detail-image"
          image={doc.image}
          sizes="(max-width: 1200px) 100vw, 1200px"
          alt={doc.image?.alt || ""}
        />
      )}
      <Body data={doc.content} />
    </div>
  );
}

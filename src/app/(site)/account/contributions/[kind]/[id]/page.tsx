import { notFound } from "next/navigation";
import { getCMS, requireSession } from "@/lib/payload";
import { owns } from "@/lib/domain";
import { PageIntro } from "@/components/Content";
import { ContributionForm } from "@/components/ContributionForm";
import { richTextPlainText } from "@/lib/richtext";
export const metadata = { title: "Edit your submission" };
export default async function EditContribution({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if (!["products", "resources", "articles"].includes(kind)) notFound();
  const user = await requireSession();
  const payload = await getCMS();
  const doc: any = await payload
    .findByID({
      collection: kind as any,
      id,
      draft: true,
      overrideAccess: false,
      user,
    })
    .catch(() => null);
  if (
    !doc ||
    !owns(user, doc.owner) ||
    !["draft", "changes-requested"].includes(doc.reviewStatus)
  )
    notFound();
  return (
    <>
      <PageIntro
        title="Make it your best."
        description="Update your submission and send it back for review."
      />
      {doc.reviewNotes && <p className="form-feedback">{doc.reviewNotes}</p>}
      <div className="surface">
        <ContributionForm
          initial={{
            id: doc.id,
            kind,
            title: doc.title,
            description:
              kind === "articles"
                ? richTextPlainText(doc.content) || doc.description
                : doc.description,
            category: doc.category,
            resourceType: doc.resourceType,
            url: doc.url,
            price: doc.price,
            file: typeof doc.file === "object" ? doc.file?.id : doc.file,
          }}
        />
      </div>
    </>
  );
}

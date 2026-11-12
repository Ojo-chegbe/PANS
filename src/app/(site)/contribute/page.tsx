import Link from "next/link";
import { getSession } from "@/lib/payload";
import { PageIntro } from "@/components/Content";
import { ActionForm } from "@/components/ActionForm";
import { Input, Textarea } from "@/components/Fields";
import { ContributionForm } from "@/components/ContributionForm";
import { isStaff, type Actor } from "@/lib/domain";
export const metadata = { title: "Contribute to the community" };
export default async function Contribute({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const query = await searchParams;
  const user = await getSession();
  const mentor = query.kind === "mentor";
  const approved =
    !mentor &&
    (user?.roles?.includes("contributor") || isStaff(user as Actor | null));
  return (
    <div className="wrap page-shell">
      <PageIntro
        eyebrow="Build something that lasts"
        title={
          mentor
            ? "Your experience can\nmake a difference."
            : "Share what you know."
        }
        description={
          mentor
            ? "Apply to guide the next generation of PANSites."
            : "Contribute resources, articles, and digital products that help your community grow."
        }
      />
      <div className="two-col">
        <div className="surface">
          {approved ? (
            <ContributionForm />
          ) : (
            <ActionForm
              action="apply"
              extra={{ kind: mentor ? "mentor" : "contributor" }}
              authRequired
              signedIn={Boolean(user)}
              submit={user ? "Send your application" : "Sign in to apply"}
              pending="Sending…"
            >
              <Textarea
                label={
                  mentor
                    ? "Tell us about your experience and how you would like to mentor."
                    : "Tell us what you would like to contribute."
                }
                name="bio"
                required
                minLength={30}
                maxLength={3000}
              />
              <Input
                label="Areas of expertise"
                name="expertise"
                maxLength={300}
              />
              <Input
                label="Current role or position"
                name="position"
                maxLength={200}
              />
            </ActionForm>
          )}
        </div>
        <div>
          <h2 style={{ fontSize: 30 }}>Made by the community.</h2>
          <p className="page-lede">
            Applications and submissions are reviewed by the PANS team. You can
            follow their progress in your account.
          </p>
          <Link className="quiet-link" href="/account/contributions">
            View your applications and submissions
          </Link>
        </div>
      </div>
    </div>
  );
}

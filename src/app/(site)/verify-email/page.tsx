import { VerificationPanel } from "@/components/VerificationPanel";
import { safeNext } from "@/lib/domain";
import { PageIntro } from "@/components/Content";
export const metadata = {
  title: "Verify your email",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default async function Verify({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; next?: string }>;
}) {
  const { token, next } = await searchParams;
  return (
    <div className="auth-shell">
      <div className="narrow">
        <PageIntro
          title="Make it official."
          description="Confirm your email address to activate your PANS account."
        />
        <VerificationPanel token={token} next={safeNext(next)} />
      </div>
    </div>
  );
}

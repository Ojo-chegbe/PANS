import { redirect } from "next/navigation";
import { getSession } from "@/lib/payload";
import { ActionButton } from "@/components/ActionForm";
import { PageIntro } from "@/components/Content";
import Link from "next/link";
export const metadata = {
  title: "Confirm your payment",
  robots: { index: false, follow: false },
};
export default async function PaymentReturn({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const query = await searchParams;
  const reference = query.reference || query.trxref;
  if (!(await getSession()))
    redirect(
      "/sign-in?next=" +
        encodeURIComponent(
          "/payment/return?reference=" + encodeURIComponent(reference || ""),
        ),
    );
  return (
    <div className="auth-shell">
      <div className="narrow">
        <PageIntro
          title="Let's confirm your order."
          description="We check your payment securely before making your purchases available."
        />
        <div className="surface">
          {reference ? (
            <ActionButton
              action="verify-payment"
              data={{ reference }}
              className="btn-primary"
            >
              Check payment status
            </ActionButton>
          ) : (
            <p className="form-note">No payment reference was provided.</p>
          )}
          <div className="form-links">
            <Link href="/account/orders">View your orders</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

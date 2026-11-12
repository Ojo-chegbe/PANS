import { getSession } from "@/lib/payload";
import { PageIntro } from "@/components/Content";
import { Checkout } from "@/components/Cart";
export const metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};
export default async function CheckoutPage() {
  const user = await getSession();
  return (
    <div className="wrap page-shell checkout-layout">
      <div>
        <PageIntro
          eyebrow="Your next chapter"
          title="A little investment.\nA world of possibility."
          description="Review your basket and continue when you are ready."
        />
        <p className="form-note">
          Digital purchases and course access are saved to your account after
          confirmation. For physical products, the PANS team will share
          collection updates.
        </p>
      </div>
      <Checkout
        signedIn={Boolean(user)}
        paymentsReady={Boolean(process.env.PAYSTACK_SECRET_KEY)}
      />
    </div>
  );
}

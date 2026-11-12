import Link from "next/link";
import { ActionForm } from "@/components/ActionForm";
import { Input } from "@/components/Fields";
import { PageIntro } from "@/components/Content";
export const metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};
export default function ForgotPassword() {
  return (
    <div className="auth-shell">
      <div className="narrow">
        <PageIntro
          title="A fresh start."
          description="Enter your account email and we will send you a password reset link."
        />
        <div className="surface">
          <ActionForm
            action="forgot-password"
            submit="Send reset link"
            pending="Sending…"
          >
            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </ActionForm>
        </div>
        <Link className="quiet-link" href="/sign-in">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

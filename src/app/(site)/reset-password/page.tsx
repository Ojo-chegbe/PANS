import Link from "next/link";
import { ActionForm } from "@/components/ActionForm";
import { PasswordInput } from "@/components/PasswordInput";
import { PageIntro } from "@/components/Content";
export const metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <div className="auth-shell">
      <div className="narrow">
        <PageIntro
          title="Choose a new password."
          description="Use a strong password that you have not used elsewhere."
        />
        {token ? (
          <div className="surface">
            <ActionForm
              action="reset-password"
              endpoint="/api/users/reset-password"
              extra={{ token }}
              submit="Save new password"
              confirmPassword
            >
              <PasswordInput
                label="New password"
                name="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={128}
                required
              />
              <PasswordInput
                label="Confirm new password"
                name="passwordConfirmation"
                autoComplete="new-password"
                minLength={12}
                maxLength={128}
                required
              />
              <p className="form-note">
                Changing your password signs you out on every device. You’ll
                sign in again with your new password.
              </p>
            </ActionForm>
            <div className="form-links">
              <Link href="/forgot-password">
                Link expired? Request a new one
              </Link>
            </div>
          </div>
        ) : (
          <div className="surface">
            <p className="form-note">
              This link is incomplete.{" "}
              <Link className="quiet-link" href="/forgot-password">
                Request a new reset link
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

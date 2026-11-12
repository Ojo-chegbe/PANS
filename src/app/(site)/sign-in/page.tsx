import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/payload";
import { safeNext } from "@/lib/domain";
import { ActionForm } from "@/components/ActionForm";
import { Input } from "@/components/Fields";
import { PasswordInput } from "@/components/PasswordInput";
import { PageIntro } from "@/components/Content";
export const metadata = { title: "Sign in" };
export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const query = await searchParams;
  const next = safeNext(query.next);
  if (await getSession()) redirect(next);
  return (
    <div className="auth-shell">
      <div className="narrow">
        <PageIntro
          eyebrow="Your PANS account"
          title="Welcome back."
          description="Pick up where you left off."
        />
        <div className="surface">
          {query.reset === "success" && (
            <p className="form-feedback" role="status">
              Your password has been changed. Sign in with your new password.
            </p>
          )}
          <ActionForm
            action="login"
            endpoint="/api/users/login"
            submit="Sign in"
            pending="Signing in…"
            next={next}
          >
            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            <PasswordInput
              label="Password"
              name="password"
              autoComplete="current-password"
              required
            />
          </ActionForm>
          <div className="form-links">
            <Link href="/forgot-password">Forgot your password?</Link>
            <Link href={"/verify-email?next=" + encodeURIComponent(next)}>
              Resend verification email
            </Link>
          </div>
        </div>
        <p className="form-note">
          New to the Hub?{" "}
          <Link
            className="quiet-link"
            href={"/join?next=" + encodeURIComponent(next)}
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

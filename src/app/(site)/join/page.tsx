import Link from "next/link";
import { ActionForm } from "@/components/ActionForm";
import { Input, Select, levels } from "@/components/Fields";
import { PasswordInput } from "@/components/PasswordInput";
import { PageIntro } from "@/components/Content";
import { safeNext } from "@/lib/domain";
import { emailDeliveryConfigured } from "@/lib/email-config";
export const metadata = { title: "Join the community" };
export default async function Join({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const query = await searchParams;
  return (
    <div className="auth-shell">
      <div className="narrow">
        <PageIntro
          eyebrow="Your next chapter"
          title="You belong here."
          description="One account for your courses, resources, events, and mentorship."
        />
        <div className="surface">
          <ActionForm
            action="register"
            submit="Create your account"
            pending="Creating your account…"
          >
            <Input
              label="Full name"
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={120}
            />
            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            <Select label="Your level" name="level" options={levels} required />
            <PasswordInput
              label="Password"
              name="password"
              minLength={12}
              autoComplete="new-password"
              required
            />
            <p className="form-note">
              Use at least 12 characters.{" "}
              {emailDeliveryConfigured()
                ? "We will email a link to verify your account."
                : "Email delivery is not connected in this preview. The site owner can provide your verification link."}
            </p>
            <label className="check-field">
              <input name="consent" type="checkbox" required />
              <span>
                I have read the{" "}
                <Link className="quiet-link" href="/privacy">
                  privacy information
                </Link>{" "}
                and{" "}
                <Link className="quiet-link" href="/terms">
                  terms
                </Link>
                .
              </span>
            </label>
          </ActionForm>
          <div className="form-links">
            <Link href="/verify-email">
              Didn’t receive your verification email?
            </Link>
          </div>
        </div>
        <p className="form-note">
          Already part of the community?{" "}
          <Link
            className="quiet-link"
            href={"/sign-in?next=" + encodeURIComponent(safeNext(query.next))}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

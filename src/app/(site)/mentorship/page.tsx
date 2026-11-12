import Link from "next/link";
import { getSession } from "@/lib/payload";
import { PageIntro } from "@/components/Content";
import { ActionForm } from "@/components/ActionForm";
import { Input, Textarea, Select, levels } from "@/components/Fields";
export const metadata = { title: "Find a mentor" };
export default async function Mentorship({
  searchParams,
}: {
  searchParams: Promise<{
    level?: string;
    interest?: string;
    name?: string;
    mentor?: string;
  }>;
}) {
  const query = await searchParams;
  const user = await getSession();
  return (
    <div className="wrap page-shell">
      <PageIntro
        eyebrow="Guidance, structured"
        title="Your next step,\nwith support."
        description="Tell us where you are and where you want to go. The PANS team will help connect you with a suitable mentor."
      />
      <div className="two-col">
        <div className="surface">
          <h2 style={{ fontSize: 30, marginBottom: 28 }}>Request a mentor</h2>
          <ActionForm
            action="request-mentor"
            submit={user ? "Send your request" : "Sign in to send your request"}
            pending="Sending your request…"
            extra={query.mentor ? { requestedMentor: query.mentor } : {}}
            authRequired
            signedIn={Boolean(user)}
          >
            <Input
              label="Full name"
              name="displayName"
              autoComplete="name"
              defaultValue={user?.name || query.name || ""}
              readOnly={Boolean(user)}
              required
            />
            <Input
              label="Phone number"
              name="phone"
              type="tel"
              autoComplete="tel"
              defaultValue={user?.phone || ""}
            />
            <Select
              label="Your level"
              name="level"
              options={levels}
              defaultValue={user?.level || query.level || "100L"}
            />
            <Select
              label="Area of interest"
              name="interest"
              defaultValue={query.interest || "Academics"}
              options={[
                "Academics",
                "Clinical Practice",
                "Community Pharmacy",
                "Industry",
                "Entrepreneurship",
                "Technology & Pharma Tech",
                "Research",
                "Leadership",
                "Career Development",
                "International Opportunities",
              ]}
            />
            <Input label="Career interest" name="careerGoal" maxLength={1500} />
            <Select
              label="Preferred mentor"
              name="preferredType"
              options={[
                "No preference",
                "Senior student",
                "Pharmacist",
                "Alumnus",
              ]}
            />
            <Textarea
              label="What would you like help with?"
              name="message"
              required
              minLength={15}
              maxLength={3000}
            />
          </ActionForm>
        </div>
        <div className="col-pad">
          <h3>Guidance that meets you where you are.</h3>
          <p className="form-note">
            Requests are reviewed by the PANS team. We consider your interests,
            level, and mentor availability before making an assignment.
          </p>
          <hr className="page-divider" />
          <h3 style={{ fontSize: 24 }}>Keep track of your request.</h3>
          <p className="form-note">
            Your account will show when your request is received, assigned, and
            accepted. We will also send updates to your email.
          </p>
          <div className="section-actions">
            <Link className="quiet-link" href="/mentors">
              Meet our mentors
            </Link>
          </div>
          <div className="section-actions">
            <Link className="quiet-link" href="/contribute?kind=mentor">
              Apply to become a mentor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { settings, getSession } from "@/lib/payload";
import { PageIntro } from "@/components/Content";
import { ActionForm } from "@/components/ActionForm";
import { Input, Textarea, Select } from "@/components/Fields";
export const metadata = { title: "Contact PANS" };
export default async function Contact() {
  const [site, user] = await Promise.all([settings(), getSession()]);
  return (
    <div className="wrap page-shell">
      <PageIntro
        eyebrow="Let's talk"
        title="We are listening."
        description="A question, an idea, or something you need help with? Send the PANS team a message."
      />
      <div className="two-col contact-grid">
        <div className="surface">
          <ActionForm
            action="contact"
            submit="Send your message"
            pending="Sending…"
          >
            <Input
              label="Full name"
              name="name"
              required
              autoComplete="name"
              defaultValue={user?.name || ""}
            />
            <Input
              label="Email address"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={user?.email || ""}
            />
            <Select
              label="What is this about?"
              name="category"
              options={[
                "General",
                "Technical",
                "Partnership",
                "Mentorship",
                "Digital Store",
                "Event",
              ]}
            />
            <Input
              label="Subject"
              name="subject"
              required
              minLength={3}
              maxLength={200}
            />
            <Textarea
              label="Your message"
              name="message"
              required
              minLength={15}
              maxLength={5000}
            />
            <div className="honeypot" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                name="website"
                id="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
          </ActionForm>
        </div>
        <div className="contact-information">
          <h2 style={{ fontSize: 30 }}>PANS UNIJOS</h2>
          <p>
            Pharmaceutical Association of Nigerian Students
            <br />
            University of Jos Chapter
          </p>
          {site.contactEmail && (
            <p>
              <a className="quiet-link" href={"mailto:" + site.contactEmail}>
                {site.contactEmail}
              </a>
            </p>
          )}
          {site.contactPhone && <p>{site.contactPhone}</p>}
          {site.address && <p>{site.address}</p>}
          <p className="form-note">
            For account access, purchases, or registration issues, include the
            relevant order or event details. Please keep passwords and payment
            card details out of your message.
          </p>
        </div>
      </div>
    </div>
  );
}

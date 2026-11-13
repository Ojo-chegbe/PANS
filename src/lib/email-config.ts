import { isLocalPreview } from "./environment";

/** Server-side email settings shared by the adapter and account pages. */
export function emailDeliveryConfigured() {
  return Boolean(
    (process.env.RESEND_API_KEY?.trim() || process.env.SMTP_HOST?.trim()) &&
    !emailConfigurationError(),
  );
}

/** Validate at the email boundary so an email outage cannot take down pages. */
export function emailConfigurationError(): string | null {
  if (process.env.NODE_ENV !== "production" || isLocalPreview()) return null;
  if (process.env.RESEND_API_KEY?.trim()) {
    if (/@resend\.dev$/i.test(emailSender().address))
      return "Production Resend delivery requires EMAIL_FROM_ADDRESS on a verified domain. The resend.dev sender is for local testing only.";
    return null;
  }
  return process.env.SMTP_HOST?.trim()
    ? null
    : "Transactional email is not configured. Set RESEND_API_KEY and EMAIL_FROM_ADDRESS, or SMTP_HOST.";
}

export function emailSender() {
  return {
    address:
      process.env.EMAIL_FROM_ADDRESS?.trim() ||
      (process.env.RESEND_API_KEY?.trim()
        ? "onboarding@resend.dev"
        : "noreply@pans.local"),
    name: process.env.EMAIL_FROM_NAME?.trim() || "PANS UNIJOS",
  };
}

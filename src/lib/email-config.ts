/** Server-side email settings shared by the adapter and account pages. */
export function emailDeliveryConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() || process.env.SMTP_HOST?.trim(),
  );
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

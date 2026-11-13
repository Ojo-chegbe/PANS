import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import type { EmailAdapter, SendEmailOptions } from "payload";
import { isLocalPreview } from "./environment";
import { emailConfigurationError, emailSender } from "./email-config";

function addresses(value: SendEmailOptions["to"]) {
  if (!value) return undefined;
  return (Array.isArray(value) ? value : [value]).map((item) =>
    typeof item === "string"
      ? item
      : item.name
        ? `${JSON.stringify(item.name)} <${item.address}>`
        : item.address,
  );
}
function content(value: SendEmailOptions["html"]) {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  if (Buffer.isBuffer(value)) return value.toString("utf8");
  throw new Error("Email content must be a string or buffer.");
}

export const emailAdapter: EmailAdapter = ({ payload }) => ({
  name: "pans-transactional-email",
  defaultFromAddress: emailSender().address,
  defaultFromName: emailSender().name,
  sendEmail: async (message) => {
    const configurationError = emailConfigurationError();
    if (configurationError) {
      payload.logger.error(configurationError);
      throw new Error("Email delivery is unavailable. Please try again later.");
    }
    if (process.env.RESEND_API_KEY?.trim()) {
      if (message.attachments?.length)
        throw new Error(
          "Send course downloads as protected links, not email attachments.",
        );
      const sender = emailSender();
      const idempotencyKey = randomUUID();
      let response: Response;
      try {
        response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify({
            from: `${JSON.stringify(sender.name)} <${sender.address}>`,
            to: addresses(message.to),
            cc: addresses(message.cc),
            bcc: addresses(message.bcc),
            reply_to: addresses(message.replyTo),
            subject: message.subject,
            html: content(message.html),
            text: content(message.text),
          }),
          cache: "no-store",
          signal: AbortSignal.timeout(15_000),
        });
      } catch {
        payload.logger.error(
          "Resend could not be reached. Check network access and Resend service status.",
        );
        throw new Error(
          "The email service could not be reached. Please try again.",
        );
      }
      const result = (await response.json().catch(() => null)) as {
        id?: string;
        name?: string;
      } | null;
      if (!response.ok || !result?.id) {
        // Provider messages may contain recipient addresses; log only known codes.
        const code =
          result?.name && /^[a-z_]+$/.test(result.name)
            ? result.name
            : "unknown_error";
        payload.logger.error(
          `Resend rejected an email (HTTP ${response.status}, ${code}). Check API credentials, sender verification, recipient restrictions and sending limits.`,
        );
        throw new Error(
          "Email delivery is unavailable. Please try again later.",
        );
      }
      return { id: result.id };
    }
    if (process.env.SMTP_HOST) {
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_PORT === "465",
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
          : undefined,
      });
      return transport.sendMail(message);
    }
    if (process.env.NODE_ENV === "production" && !isLocalPreview())
      throw new Error("Transactional email is not configured.");
    await mkdir(path.resolve(".data/mail"), { recursive: true });
    await writeFile(
      path.resolve(".data/mail", Date.now() + "-" + randomUUID() + ".json"),
      JSON.stringify(message, null, 2),
    );
    return { accepted: [], rejected: [] };
  },
});

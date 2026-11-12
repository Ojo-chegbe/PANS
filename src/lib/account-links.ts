import { createHmac, timingSafeEqual } from "node:crypto";
import { DomainError } from "./domain";

const DAY = 24 * 60 * 60 * 1000;
const signature = (value: string, secret: string) =>
  createHmac("sha256", secret)
    .update("email-verification:" + value)
    .digest("hex");

export function verificationToken(
  token: string,
  secret: string,
  now = Date.now(),
) {
  const value = `${token}.${now + DAY}`;
  return `${value}.${signature(value, secret)}`;
}

export function readVerificationToken(
  value: string,
  secret: string,
  now = Date.now(),
) {
  const parts = value.split(".");
  const [token, expires, mac] = parts;
  if (
    parts.length !== 3 ||
    !/^[a-f0-9]{40,128}$/.test(token) ||
    !/^\d{13}$/.test(expires) ||
    !/^[a-f0-9]{64}$/.test(mac) ||
    !timingSafeEqual(
      Buffer.from(mac, "hex"),
      Buffer.from(signature(`${token}.${expires}`, secret), "hex"),
    )
  )
    throw new DomainError(
      "This verification link is invalid or has already been used. Try signing in, or request a new link.",
      400,
    );
  if (Number(expires) <= now)
    throw new DomainError(
      "This verification link has expired. Request a new link below.",
      410,
    );
  return token;
}

export function verificationEmail(token: string, secret: string) {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
  const url = `${base}/verify-email?token=${encodeURIComponent(verificationToken(token, secret))}`;
  return `<p>Welcome to PANS UNIJOS.</p><p><a href="${url}">Verify your email address</a></p><p>This link expires in 24 hours. Only the most recent verification link will work.</p><p>If you did not create this account, you can ignore this email.</p>`;
}

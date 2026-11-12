"use client";
import Link from "next/link";
import { useState } from "react";
import { ActionForm } from "./ActionForm";
import { Input } from "./Fields";

export function VerificationPanel({
  token,
  next,
}: {
  token?: string;
  next: string;
}) {
  const [state, setState] = useState<"ready" | "busy" | "verified" | "error">(
    "ready",
  );
  const [message, setMessage] = useState("");
  return (
    <div className="surface verification-panel">
      {state === "verified" ? (
        <div className="verification-result" role="status">
          <h2>You’re all set.</h2>
          <p>{message}</p>
          <Link
            className="btn-primary"
            href={"/sign-in?next=" + encodeURIComponent(next)}
          >
            Continue to sign in
          </Link>
        </div>
      ) : (
        <>
          {token ? (
            <div className="verification-result" aria-busy={state === "busy"}>
              <p>Confirm your email to finish setting up your account.</p>
              <button
                className="btn-primary"
                type="button"
                disabled={state === "busy"}
                onClick={async () => {
                  setState("busy");
                  setMessage("");
                  try {
                    const response = await fetch(
                      "/api/users/verify/" + encodeURIComponent(token),
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: "{}",
                      },
                    );
                    const result = await response.json();
                    if (!response.ok)
                      throw new Error(
                        result.message ||
                          "We could not verify this link. Please try again.",
                      );
                    setMessage(result.message);
                    setState("verified");
                  } catch (error) {
                    setMessage(
                      error instanceof Error
                        ? error.message
                        : "Please try again.",
                    );
                    setState("error");
                  }
                }}
              >
                {state === "busy" ? "Verifying…" : "Verify your email"}
              </button>
              {message && (
                <p className="form-feedback error" role="alert">
                  {message}
                </p>
              )}
            </div>
          ) : (
            <p className="form-note">
              Open the link in your verification email, or request a new one
              below.
            </p>
          )}
          <div className={token ? "verification-resend" : undefined}>
            <h2>{token ? "Need another link?" : "Get a verification link"}</h2>
            <p className="form-note">
              Enter the email you used to register. Use the newest email, and
              check your spam folder.
            </p>
            <ActionForm
              action="resend-verification"
              submit="Send verification link"
              pending="Sending…"
            >
              <Input
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
              />
            </ActionForm>
          </div>
          <div className="form-links">
            <Link href={"/sign-in?next=" + encodeURIComponent(next)}>
              Already verified? Sign in
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

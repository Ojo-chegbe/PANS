"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
export function ActionForm({
  action,
  children,
  submit = "Save changes",
  pending = "Saving…",
  extra = {},
  numbers = [],
  next,
  endpoint,
  authRequired = false,
  signedIn = true,
  className = "hub-form",
  disabled = false,
  confirmPassword = false,
}: {
  action: string;
  children: ReactNode;
  submit?: string;
  pending?: string;
  extra?: Record<string, unknown>;
  numbers?: string[];
  next?: string;
  endpoint?: string;
  authRequired?: boolean;
  signedIn?: boolean;
  className?: string;
  disabled?: boolean;
  confirmPassword?: boolean;
}) {
  const [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(
        "pans-draft:" + action + ":" + pathname,
      );
      if (saved && form.current) {
        const data = JSON.parse(saved);
        for (const [key, value] of Object.entries(data)) {
          const field = form.current.elements.namedItem(key);
          if (
            field instanceof HTMLInputElement ||
            field instanceof HTMLSelectElement ||
            field instanceof HTMLTextAreaElement
          ) {
            if (field instanceof HTMLInputElement && field.type === "checkbox")
              field.checked = Boolean(value);
            else field.value = String(value ?? "");
          }
        }
      }
    } catch {}
    setReady(true);
  }, [action, pathname]);
  async function handle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || busy || disabled) return;
    setBusy(true);
    setMessage("");
    const values: Record<string, unknown> = { ...extra };
    for (const [key, value] of new FormData(event.currentTarget))
      values[key] = value;
    for (const field of Array.from(event.currentTarget.elements)) {
      if (field instanceof HTMLInputElement && field.type === "checkbox")
        values[field.name] = field.checked;
    }
    for (const key of numbers)
      if (values[key] !== undefined) values[key] = Number(values[key]);
    if (confirmPassword && values.password !== values.passwordConfirmation) {
      setError(true);
      setMessage("Your passwords do not match. Please enter them again.");
      setBusy(false);
      return;
    }
    delete values.passwordConfirmation;
    const remember = () => {
      const safe = { ...values };
      delete safe.password;
      delete safe.token;
      try {
        sessionStorage.setItem(
          "pans-draft:" + action + ":" + pathname,
          JSON.stringify(safe),
        );
      } catch {}
    };
    if (authRequired && !signedIn) {
      remember();
      window.location.assign(
        "/sign-in?next=" +
          encodeURIComponent(window.location.pathname + window.location.search),
      );
      return;
    }
    try {
      const response = await fetch(endpoint || "/api/hub/" + action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401 && authRequired) {
        remember();
        window.location.assign(
          "/sign-in?next=" +
            encodeURIComponent(
              window.location.pathname + window.location.search,
            ),
        );
        return;
      }
      if (!response.ok)
        throw new Error(
          data.message ||
            data.errors?.[0]?.message ||
            "We could not complete this request. Please try again.",
        );
      setError(false);
      setMessage(data.message || "Saved.");
      try {
        sessionStorage.removeItem("pans-draft:" + action + ":" + pathname);
      } catch {}
      if (data.redirect || next) {
        window.location.assign(data.redirect || next);
        return;
      }
      router.refresh();
    } catch (error) {
      setError(true);
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      method="post"
      ref={form}
      onSubmit={handle}
      className={className}
      aria-busy={busy || !ready}
    >
      {children}
      {message && (
        <p
          className={"form-feedback" + (error ? " error" : "")}
          role={error ? "alert" : "status"}
        >
          {message}
        </p>
      )}
      <button
        type="submit"
        className="btn-primary"
        disabled={!ready || busy || disabled}
      >
        {busy ? pending : submit}
      </button>
    </form>
  );
}
export function ActionButton({
  action,
  data = {},
  children,
  className = "text-button",
  confirm,
}: {
  action: string;
  data?: Record<string, unknown>;
  children: ReactNode;
  className?: string;
  confirm?: string;
}) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const router = useRouter();
  return (
    <span className="action-control">
      <button
        type="button"
        className={className}
        disabled={busy}
        onClick={async () => {
          if (confirm && !window.confirm(confirm)) return;
          setBusy(true);
          setMessage("");
          try {
            const response = await fetch(
              action.startsWith("/") ? action : "/api/hub/" + action,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              },
            );
            const result = await response.json().catch(() => ({}));
            if (response.status === 401) {
              window.location.assign(
                "/sign-in?next=" + encodeURIComponent(window.location.pathname),
              );
              return;
            }
            if (!response.ok)
              throw new Error(result.message || "Please try again.");
            if (result.redirect) {
              window.location.assign(result.redirect);
              return;
            }
            setMessage(result.message || "Saved.");
            router.refresh();
          } catch (error) {
            setMessage(
              error instanceof Error ? error.message : "Please try again.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Please wait…" : children}
      </button>
      {message && (
        <small className="inline-feedback" role="status">
          {message}
        </small>
      )}
    </span>
  );
}

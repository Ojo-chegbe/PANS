"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** Add visibility control to Payload's existing login input without replacing its form. */
export function LoginPasswordVisibility() {
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const findInput = () => {
      const field = document.querySelector<HTMLInputElement>(
        '.login__form input[name="password"]',
      );
      setInput((previous) => (previous === field ? previous : field));
    };
    findInput();
    const observer = new MutationObserver(findInput);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!input?.parentElement) return;
    const wrapper = input.parentElement;
    wrapper.classList.add("pans-admin-password-control");
    setVisible(false);
    return () => {
      input.type = "password";
      wrapper.classList.remove("pans-admin-password-control");
    };
  }, [input]);

  if (!input?.parentElement) return null;
  return createPortal(
    <button
      type="button"
      className="pans-admin-password-toggle"
      aria-label={visible ? "Hide password" : "Show password"}
      aria-controls={input.id}
      aria-pressed={visible}
      onClick={() => {
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        setVisible(show);
      }}
    >
      {visible ? "Hide" : "Show"}
    </button>,
    input.parentElement,
  );
}

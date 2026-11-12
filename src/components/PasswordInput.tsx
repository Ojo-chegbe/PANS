"use client";

import { useState, type InputHTMLAttributes } from "react";

export function PasswordInput({
  label,
  name,
  id = name,
  disabled,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  name: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="password-field">
        <input
          {...props}
          id={id}
          name={name}
          disabled={disabled}
          type={visible ? "text" : "password"}
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-controls={id}
          disabled={disabled}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

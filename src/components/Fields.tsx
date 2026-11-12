import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
export function Input({
  label,
  name,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} {...props} />
    </div>
  );
}
export function Textarea({
  label,
  name,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  name: string;
}) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <textarea id={name} name={name} rows={5} {...props} />
    </div>
  );
}
export function Select({
  label,
  name,
  options,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  name: string;
  options: (string | { value: string; label: string })[];
}) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name} {...props}>
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          return (
            <option key={value} value={value}>
              {typeof option === "string" ? option : option.label}
            </option>
          );
        })}
      </select>
    </div>
  );
}
export const levels = ["100L", "200L", "300L", "400L", "500L", "Alumni"];

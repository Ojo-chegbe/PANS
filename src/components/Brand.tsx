import Link from "next/link";
export function Mark() {
  return (
    <svg
      className="brand-mark"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 20C14 30 18 36 24 36C30 36 34 30 34 20"
        stroke="#1F6B3A"
        strokeWidth="2.4"
      />
      <ellipse
        cx="24"
        cy="20"
        rx="14"
        ry="4"
        stroke="#1F6B3A"
        strokeWidth="2.4"
      />
      <path
        d="M24 8V16M20 10L28 14"
        stroke="#1F6B3A"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="24" cy="36" r="2.2" fill="#1F6B3A" />
    </svg>
  );
}
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="PANS Digital Hub home">
      <Mark />
      <span className="brand-text">
        PANS<span>Digital Hub</span>
      </span>
    </Link>
  );
}

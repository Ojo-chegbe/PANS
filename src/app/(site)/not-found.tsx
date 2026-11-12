import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wrap page-shell">
      <div className="page-intro">
        <p className="section-tag">Page not found</p>
        <h1>Let's get you back.</h1>
        <p className="page-lede">
          This page may have moved or is no longer available.
        </p>
        <Link className="btn-primary" href="/">
          Back to the Hub
        </Link>
      </div>
    </div>
  );
}

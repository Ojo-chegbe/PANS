"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="wrap page-shell">
      <div className="page-intro">
        <p className="section-tag">Something went wrong</p>
        <h1>Please try again.</h1>
        <p className="page-lede">
          We couldn't load this page. Your saved account activity is still
          there.
        </p>
        <button className="btn-primary" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}

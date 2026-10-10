"use client";

export default function Error({ error, reset }) {
  return (
    <div className="page-shell">
      <div className="content-card error-state">
      <p className="page-kicker">A SMALL DETOUR</p>
      <h2>Something went wrong.</h2>
      <p>{error.message}</p>
      <button
        onClick={() => reset()}
        className="button button-primary"
      >
        Try Again
      </button>
      </div>
    </div>
  );
}
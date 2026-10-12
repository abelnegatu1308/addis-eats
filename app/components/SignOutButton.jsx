"use client";

import { logoutAction } from "../actions/auth";

export default function SignOutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-lg border px-3 py-2 text-sm transition"
        style={{ borderColor: "var(--border)", color: "var(--text)" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        Sign out
      </button>
    </form>
  );
}
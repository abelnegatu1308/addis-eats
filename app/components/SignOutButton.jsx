"use client";

import { logoutAction } from "../actions/auth";

export default function SignOutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-lg border px-3 py-2 text-sm transition hover:bg-gray-100"
      >
        Sign out
      </button>
    </form>
  );
}
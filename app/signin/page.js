import Link from "next/link";
import { loginAction } from "../actions/auth";

export const metadata = {
  title: "Sign in",
  description: "Sign in to manage your Addis Eats orders and saved dishes.",
  robots: { index: false, follow: false },
};

export default async function SignInPage({ searchParams }) {
  const params = await searchParams;

  const error = params?.error;
  const next = params?.next || "/";

  const safeNext =
    next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/";

  return (
    <main className="page-shell">
      <p className="page-kicker">ADDIS EATS · ACCOUNT</p>

      <div className="content-card max-w-xl">
        <h1>Welcome back</h1>

        <p className="mt-2" style={{ color: "var(--text-muted)" }}>
          Sign in to continue to your Addis Eats account.
        </p>

        {error && (
          <div className="mt-6 rounded-lg border p-4" style={{ borderColor: "var(--error-border)", background: "var(--error-bg)", color: "var(--error)" }}>
            {error}
          </div>
        )}

        <form action={loginAction} className="mt-8 space-y-5">
          <input
            type="hidden"
            name="next"
            value={safeNext}
          />

          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-medium"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border px-4 py-3"
              style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text)" }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-medium"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border px-4 py-3"
              style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text)" }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="button button-primary w-full"
          >
            Sign in
          </button>
        </form>

        <Link
          href="/admin/login"
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-lg border px-4 py-3 font-medium transition"
          style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
        >
          Login as admin
        </Link>

        {process.env.NODE_ENV !== "production" && (
          <div className="mt-8 rounded-lg border p-4 text-sm" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
            <p className="font-semibold">Local demo customer</p>
            <p>abel@addiseats.local / abel123</p>
            <hr className="my-4" style={{ borderColor: "var(--border)" }} />
            <p className="font-semibold">Local demo staff</p>
            <p>staff@addiseats.local / staff123</p>
          </div>
        )}

        <Link
          href="/menu"
          className="mt-6 inline-block text-sm underline"
          style={{ color: "var(--text-muted)" }}
        >
          ← Back to menu
        </Link>
      </div>
    </main>
  );
}
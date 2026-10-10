import Link from "next/link";
import { adminLoginAction } from "../../actions/admin-auth";

export const metadata = {
  title: "Staff sign in",
  description: "Sign in to the Addis Eats staff console.",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }) {
  const params = await searchParams;

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <Link href="/menu" className="admin-topbar-brand">
          Addis Eats <span>STAFF</span>
        </Link>
        <p className="admin-eyebrow">TEAM ACCESS</p>
        <h1>Staff sign in</h1>
        <p className="admin-subtitle">
          Sign in with the staff account configured for this Addis Eats project.
        </p>
        {params?.error && (
          <p className="admin-login-error" role="alert">
            Invalid email or password.
          </p>
        )}
        <form action={adminLoginAction} className="admin-login-form">
          <label>
            Staff email
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              required
              maxLength={256}
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="admin-primary-button">
            Sign in to dashboard <span aria-hidden="true">↗</span>
          </button>
        </form>
        <Link href="/menu" className="admin-text-link">
          ← Return to Addis Eats
        </Link>
      </section>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";

import { createUserAction } from "@/app/actions/users";
import { getSession, isStaff } from "@/lib/session";

export const metadata = {
  title: "Create user account",
  description: "Create a customer or staff account for Addis Eats.",
  robots: { index: false, follow: false },
};

export default async function NewAdminUserPage({ searchParams }) {
  const params = await searchParams;
  const session = await getSession();

  if (!session) redirect("/admin/login");
  if (!isStaff(session)) redirect("/");

  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">ACCESS CONTROL</p>
          <h1>Create user</h1>
          <p className="admin-subtitle">Add a customer or staff account that can sign in to Addis Eats.</p>
        </div>
        <Link href="/admin/users" className="admin-secondary-button">
          ← Users
        </Link>
      </div>

      <section className="admin-panel">
        {params?.error && <p className="admin-error-banner" role="alert">{params.error}</p>}

        <form action={createUserAction} className="admin-user-form">
          <div className="admin-user-form-grid">
            <label>
              Full name
              <input name="name" type="text" required minLength={2} maxLength={100} />
            </label>

            <label>
              Email address
              <input name="email" type="email" required maxLength={200} />
            </label>

            <label>
              Password
              <input name="password" type="password" required minLength={8} maxLength={128} />
            </label>

            <label>
              Confirm password
              <input name="confirmPassword" type="password" required minLength={8} maxLength={128} />
            </label>

            <label>
              Role
              <select name="role" defaultValue="customer">
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
              </select>
            </label>

            <label>
              Account status
              <select name="active" defaultValue="true">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-primary-button">
              Create account
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

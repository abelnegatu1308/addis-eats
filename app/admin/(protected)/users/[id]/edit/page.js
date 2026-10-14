import Link from "next/link";
import { redirect } from "next/navigation";

import { updateUserAction } from "@/app/actions/users";
import { getSession, isStaff } from "@/lib/session";
import { getUserById } from "@/lib/users";

export const metadata = {
  title: "Edit user account",
  description: "Update a user account in Addis Eats.",
  robots: { index: false, follow: false },
};

export default async function EditAdminUserPage({ params, searchParams }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!isStaff(session)) redirect("/");

  const resolvedParams = await params;
  const query = await searchParams;
  const user = await getUserById(resolvedParams.id);

  if (!user) {
    redirect("/admin/users?error=User+not+found.");
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">ACCESS CONTROL</p>
          <h1>Edit user</h1>
          <p className="admin-subtitle">Update account details and access settings.</p>
        </div>
        <Link href="/admin/users" className="admin-secondary-button">
          ← Users
        </Link>
      </div>

      {query?.error && <p className="admin-error-banner" role="alert">{query.error}</p>}

      <section className="admin-panel">
        <form action={updateUserAction} className="admin-user-form">
          <input type="hidden" name="userId" value={user.id} />

          <div className="admin-user-form-grid">
            <label>
              Full name
              <input name="name" type="text" required minLength={2} maxLength={100} defaultValue={user.name} />
            </label>

            <label>
              Email address
              <input name="email" type="email" required maxLength={200} defaultValue={user.email} />
            </label>

            <label>
              Role
              <select name="role" defaultValue={user.role}>
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
              </select>
            </label>

            <label>
              Account status
              <select name="active" defaultValue={String(user.active)}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-primary-button">
              Save changes
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

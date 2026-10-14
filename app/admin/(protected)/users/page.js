import Link from "next/link";
import { redirect } from "next/navigation";

import { toggleUserStatusAction } from "@/app/actions/users";
import { getSession, isStaff } from "@/lib/session";
import { listUsers } from "@/lib/users";

export const metadata = {
  title: "User management",
  description: "Create and manage Addis Eats customer and staff accounts.",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage({ searchParams }) {
  const params = await searchParams;
  const session = await getSession();

  if (!session) redirect("/admin/login");
  if (!isStaff(session)) redirect("/");

  const users = await listUsers({
    search: params?.search ?? "",
    role: params?.role ?? "all",
    active: params?.active ?? "all",
  });

  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">ACCESS CONTROL</p>
          <h1>User accounts</h1>
          <p className="admin-subtitle">
            Manage Addis Eats customer and staff accounts from one place.
          </p>
        </div>

        <Link href="/admin/users/new" className="admin-primary-button">
          Create user <span aria-hidden="true">↗</span>
        </Link>
      </div>

      {params?.success && (
        <p className="admin-success-banner" role="status">{params.success}</p>
      )}
      {params?.error && (
        <p className="admin-error-banner" role="alert">{params.error}</p>
      )}

      <section className="admin-panel admin-user-panel">
        <div className="admin-panel-heading admin-user-toolbar">
          <div>
            <p className="admin-eyebrow">FILTERS</p>
            <h2>Find users</h2>
          </div>
        </div>

        <form className="admin-user-filters" method="get">
          <label>
            Search
            <input name="search" defaultValue={params?.search ?? ""} placeholder="Name or email" />
          </label>

          <label>
            Role
            <select name="role" defaultValue={params?.role ?? "all"}>
              <option value="all">All roles</option>
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
            </select>
          </label>

          <label>
            Status
            <select name="active" defaultValue={params?.active ?? "all"}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <button type="submit" className="admin-secondary-button">
            Apply filters
          </button>
        </form>
      </section>

      <section className="admin-panel admin-user-panel">
        <div className="admin-panel-heading" style={{ padding: "22px 22px 0" }}>
          <div>
            <p className="admin-eyebrow">REGISTERED ACCOUNTS</p>
            <h2>{users.length} user{users.length === 1 ? "" : "s"}</h2>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="admin-empty-state" style={{ padding: "0 22px 22px" }}>
            <strong>No matching users</strong>
            <p>Adjust the filters or create a new account.</p>
          </div>
        ) : (
          <div className="admin-table-scroll" style={{ padding: "0 22px 22px" }}>
            <table className="admin-table admin-user-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Created</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className="admin-badge admin-badge-role">{user.role}</span></td>
                    <td>
                      <span className={`admin-badge ${user.active ? "admin-badge-success" : "admin-badge-muted"}`}>
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString("en-ET", { dateStyle: "medium" })}</td>
                    <td>
                      <div className="admin-user-actions">
                        <Link href={`/admin/users/${user.id}/edit`} className="admin-text-link">
                          Edit
                        </Link>

                        <form action={toggleUserStatusAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="active" value={String(!user.active)} />
                          <button type="submit" className="admin-ghost-button">
                            {user.active ? "Deactivate" : "Activate"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

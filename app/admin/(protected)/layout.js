import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/session";
import AdminNavigation from "../AdminNavigation";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  if (!isStaff(session)) {
    redirect("/");
  }

  return (
    <div className="admin-shell">
      <AdminNavigation />
      <div className="admin-main">
        <header className="admin-topbar">
          <Link href="/admin" className="admin-topbar-brand">
            Addis Eats <span>OPERATIONS</span>
          </Link>
          <div className="admin-account">
            <span className="admin-account-avatar" aria-hidden="true">
              {session.name.slice(0, 1).toUpperCase()}
            </span>
            <span>
              <strong>{session.name}</strong>
              <small>{session.email}</small>
            </span>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}

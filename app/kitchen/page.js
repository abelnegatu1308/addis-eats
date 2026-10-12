import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kitchen dashboard",
  description: "View kitchen updates for the Addis Eats staff.",
  robots: { index: false, follow: false },
};

export default async function KitchenPage() {
  const session = await getSession();

  // User is not signed in
  if (!session) {
    redirect("/signin?next=/kitchen");
  }

  // User is signed in but is not staff
  if (session.role !== "staff") {
    redirect("/");
  }

  return (
    <main className="page-shell">
      <p className="page-kicker">ADDIS EATS · STAFF</p>

      <div className="content-card">
        <h1>Kitchen</h1>

        <p className="mt-2" style={{ color: "var(--text-muted)" }}>
          Welcome, {session.name}.
        </p>

        <div className="mt-8 rounded-xl border p-6" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
          <h2 className="text-xl font-semibold">
            Kitchen Dashboard
          </h2>

          <p className="mt-2" style={{ color: "var(--text-muted)" }}>
            This area is restricted to Addis Eats staff.
          </p>
        </div>
      </div>
    </main>
  );
}
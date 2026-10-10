import Link from "next/link";
import DishForm from "../../../DishForm";

export const metadata = {
  title: "Add a dish",
  description: "Add an item to the Addis Eats menu.",
};

export default async function NewAdminDishPage({ searchParams }) {
  const params = await searchParams;
  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">CATALOG OPERATIONS</p>
          <h1>Add a dish</h1>
          <p className="admin-subtitle">New dishes are available to customers by default.</p>
        </div>
        <Link href="/admin/menu" className="admin-secondary-button">← Menu</Link>
      </div>
      <section className="admin-panel">
        <DishForm error={params?.error} />
      </section>
    </div>
  );
}

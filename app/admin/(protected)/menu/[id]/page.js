import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteDishButton from "../../../DeleteDishButton";
import DishForm from "../../../DishForm";
import { deleteDishAction } from "../../../../actions/admin-menu";
import { getAdminDishes } from "@/app/menu/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit dish",
  description: "Update an Addis Eats menu item.",
};

export default async function EditAdminDishPage({ params, searchParams }) {
  const { id } = await params;
  const [dishes, query] = await Promise.all([
    getAdminDishes(),
    searchParams,
  ]);
  const dish = dishes.find((item) => item.id === id);
  if (!dish) notFound();

  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">CATALOG OPERATIONS · {dish.category.toUpperCase()}</p>
          <h1>Edit {dish.name}</h1>
          <p className="admin-subtitle">
            Dish ID <code>{dish.id}</code> stays fixed so existing order history remains consistent.
          </p>
        </div>
        <Link href="/admin/menu" className="admin-secondary-button">← Menu</Link>
      </div>
      <section className="admin-panel">
        <DishForm dish={dish} error={query?.error} />
        <form action={deleteDishAction} className="admin-delete-dish-form">
          <input type="hidden" name="id" value={dish.id} />
          <p>Deleting this dish removes it from the catalog. Previous orders keep their saved item details.</p>
          <DeleteDishButton />
        </form>
      </section>
    </div>
  );
}

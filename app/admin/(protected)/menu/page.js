import Image from "next/image";
import Link from "next/link";
import { getAdminDishes } from "@/app/menu/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Menu management",
  description: "Manage Addis Eats dishes and availability.",
};

export default async function AdminMenuPage({ searchParams }) {
  const params = await searchParams;
  const dishes = await getAdminDishes();

  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">CATALOG OPERATIONS</p>
          <h1>Menu</h1>
          <p className="admin-subtitle">
            Create, update, and remove dishes from the customer menu.
          </p>
        </div>
        <Link href="/admin/menu/new" className="admin-primary-button">
          Add a dish <span aria-hidden="true">+</span>
        </Link>
      </div>
      {params?.error && (
        <p className="admin-login-error" role="alert">{params.error}</p>
      )}
      <section className="admin-panel" aria-label="Menu dishes">
        {dishes.length ? (
          <div className="admin-menu-list">
            {dishes.map((dish) => (
              <article className="admin-menu-row" key={dish.id}>
                <Image
                  src={dish.image}
                  alt=""
                  width={96}
                  height={72}
                  sizes="96px"
                />
                <div className="admin-menu-row-copy">
                  <h2>{dish.name}</h2>
                  <p>{dish.category.replaceAll("-", " ")} · {dish.price} ETB</p>
                </div>
                <span className={`admin-availability ${dish.available ? "is-available" : ""}`}>
                  {dish.available ? "Available" : "Unavailable"}
                </span>
                <Link
                  href={`/admin/menu/${encodeURIComponent(dish.id)}`}
                  className="admin-secondary-button"
                  aria-label={`Edit ${dish.name}`}
                >
                  Edit
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-empty-state">
            <strong>No menu items yet</strong>
            <p>Create a dish to add it to the customer menu.</p>
          </div>
        )}
      </section>
    </div>
  );
}

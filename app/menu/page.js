import { getDishes } from "./data";
import DishList from "./DishList";

export const revalidate = 3600;

export const metadata = {
  title: "Ethiopian food menu",
  description:
    "Browse Addis Eats favorites, from traditional kitfo and doro wat to comforting plant-based shiro.",
};

export default async function MenuPage() {
  const dishes = await getDishes();

  return (
    <main className="page-shell">
      <p className="page-kicker">THE ADDIS TABLE · 01</p>
      <div className="menu-intro">
        <h1 className="page-title">Our menu</h1>
        <p>Recipes passed down, spices ground fresh, and every plate made to be shared.</p>
      </div>
      <DishList dishes={dishes} />
    </main>
  );
}
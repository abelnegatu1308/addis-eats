import FilterShell from "./CategoryBar";
import { getDishes } from "./data";

export default async function MenuLayout({ children }) {
  const dishes = await getDishes();
  const categories = [...new Set(dishes.map((dish) => dish.category))].map(
    (category) => ({
      category,
      count: dishes.filter((dish) => dish.category === category).length,
    }),
  );

  return (
    <FilterShell categories={categories}>{children}</FilterShell>
  );
}
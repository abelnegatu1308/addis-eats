import { getDishes } from "../../menu/data";

const PAGE_SIZE = 100;

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const search = (params.get("search") ?? "").trim().toLocaleLowerCase();
  const category = params.get("category") ?? "all";
  const requestedPage = Number.parseInt(params.get("page") ?? "1", 10);
  const page = Number.isSafeInteger(requestedPage)
    ? Math.max(1, Math.min(requestedPage, 100))
    : 1;
  const allDishes = await getDishes();
  const filtered = allDishes.filter((dish) => {
    const matchesCategory = category === "all" || dish.category === category;
    const searchableText =
      `${dish.name} ${dish.description} ${dish.category}`.toLocaleLowerCase();
    return matchesCategory && searchableText.includes(search);
  });
  const start = (page - 1) * PAGE_SIZE;

  return Response.json({
    dishes: filtered.slice(start, start + PAGE_SIZE),
    page,
    hasNextPage: start + PAGE_SIZE < filtered.length,
    total: filtered.length,
  });
}
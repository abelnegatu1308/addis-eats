import { getDishes } from "./menu/data";
import { absoluteUrl } from "@/lib/site-url";

export default async function sitemap() {
  const dishes = await getDishes();

  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/menu"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...dishes.map((dish) => ({
      url: absoluteUrl(`/menu/${dish.id}`),
      changeFrequency: "monthly",
      priority: 0.8,
    })),
  ];
}

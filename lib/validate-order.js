import { getDishes } from "../app/menu/data.js";
import { orderSchema } from "./schema.js";

export async function validateOrder(input) {
  const result = orderSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const catalog = new Map((await getDishes()).map((dish) => [dish.id, dish]));
  const items = [];
  for (const submittedItem of result.data.items) {
    const dish = catalog.get(submittedItem.id);
    if (!dish) {
      return {
        success: false,
        fieldErrors: { items: ["One or more selected dishes are unavailable."] },
      };
    }
    items.push({ ...dish, qty: submittedItem.qty });
  }

  return {
    success: true,
    data: {
      ...result.data,
      items,
      total: items.reduce((sum, item) => sum + item.price * item.qty, 0),
    },
  };
}

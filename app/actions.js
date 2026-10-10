"use server";

import { revalidatePath } from "next/cache";
import { cancelOrderForSession, createOrder } from "../lib/orders";
import { getSession } from "../lib/session";
import { validateOrder } from "../lib/validate-order";

export async function placeOrder(_previousState, formData) {
  const session = await getSession();
  if (!session) {
    return {
      status: "unauthorized",
      message: "Sign in to place an order.",
      fieldErrors: {},
    };
  }

  let cartItems = [];
  try {
    const rawItems = formData.get("items");
    cartItems = rawItems ? JSON.parse(rawItems) : [];
  } catch {
    cartItems = [];
  }

  const totalValue = Number(formData.get("total") ?? 0);

  const result = await validateOrder({
    name: formData.get("name"),
    phone: formData.get("phone"),
    area: formData.get("area"),
    notes: formData.get("notes") ?? "",
    items: cartItems,
    total: Number.isFinite(totalValue) ? totalValue : 0,
  });

  if (!result.success) {
    return {
      status: "invalid",
      message: "Check the highlighted fields and try again.",
      fieldErrors: result.fieldErrors,
    };
  }

  const order = await createOrder(session.id, result.data);

  revalidatePath("/checkout");
  revalidatePath("/cart");
  revalidatePath("/orders");
  revalidatePath("/admin");
  return {
    status: "success",
    message: `Order ${order.id} has been placed.`,
    fieldErrors: {},
    orderId: order.id,
  };
}

export async function cancelOrder(orderId) {
  const session = await getSession();
  const result = await cancelOrderForSession(session?.id, orderId);
  if (result.status !== "success") return result;
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  return result;
}
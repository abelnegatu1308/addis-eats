import { z } from "zod";

export const orderItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  qty: z.number().int().positive().max(50, "Quantity cannot exceed 50 per dish."),
  image: z.string().optional(),
});

export const orderSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100, "Name must be 100 characters or fewer."),
  phone: z.string().trim().regex(/^\+?\d[\d\s-]{7,14}\d$/, "Enter a valid TeleBirr phone number."),
  area: z.string().trim().min(1, "Enter your delivery area.").max(120, "Delivery area must be 120 characters or fewer."),
  notes: z.string().trim().max(500, "Notes must be 500 characters or fewer.").optional().default(""),
  items: z.array(orderItemSchema).min(1, "Add at least one dish before placing an order."),
  total: z.number().nonnegative("Order total must be valid."),
});
"use server";

import { existsSync } from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createDish,
  deleteDish,
  updateDish,
} from "@/app/menu/data";
import { getSession, isStaff } from "@/lib/session";

const dishFields = z.object({
  name: z.string().trim().min(2).max(100),
  category: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  price: z.coerce.number().int().min(0).max(1000000),
  image: z.string().trim().regex(/^\/images\/[A-Za-z0-9._-]+\.(?:webp|jpe?g|png)$/i),
  description: z.string().trim().min(5).max(1000),
  ingredients: z.string().trim().min(1).max(1000),
  prepTime: z.string().trim().min(1).max(80),
  available: z.boolean(),
});

async function requireStaff() {
  const session = await getSession();
  if (!isStaff(session)) {
    redirect("/admin/login");
  }
}

function readDishForm(formData) {
  return dishFields.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    price: formData.get("price"),
    image: formData.get("image"),
    description: formData.get("description"),
    ingredients: formData.get("ingredients"),
    prepTime: formData.get("prepTime"),
    available: formData.get("available") === "on",
  });
}

function imageExists(image) {
  const imageRoot = path.resolve(process.cwd(), "public", "images");
  const imagePath = path.resolve(process.cwd(), "public", image.slice(1));
  return imagePath.startsWith(`${imageRoot}${path.sep}`) && existsSync(imagePath);
}

function dishIdFromName(name) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function invalidateMenu(id) {
  revalidatePath("/menu");
  revalidatePath("/admin/menu");
  revalidatePath("/admin");
  if (id) {
    revalidatePath(`/menu/${id}`);
    revalidatePath(`/admin/menu/${id}`);
  }
}

export async function createDishAction(formData) {
  await requireStaff();
  const result = readDishForm(formData);
  if (!result.success) {
    redirect("/admin/menu/new?error=Check%20the%20dish%20fields%20and%20try%20again.");
  }
  if (!imageExists(result.data.image)) {
    redirect("/admin/menu/new?error=Choose%20an%20existing%20local%20menu%20image.");
  }

  const id = dishIdFromName(result.data.name);
  if (!id) {
    redirect("/admin/menu/new?error=Dish%20name%20must%20include%20English%20letters%20or%20numbers.");
  }

  const created = await createDish({ ...result.data, id });
  if (created.status === "conflict") {
    redirect("/admin/menu/new?error=A%20dish%20with%20that%20name%20already%20exists.");
  }
  invalidateMenu(id);
  redirect("/admin/menu");
}

export async function updateDishAction(formData) {
  await requireStaff();
  const id = formData.get("id")?.toString() ?? "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    redirect("/admin/menu?error=Invalid%20dish%20identifier.");
  }
  const result = readDishForm(formData);
  if (!result.success) {
    redirect(`/admin/menu/${encodeURIComponent(id)}?error=Check%20the%20dish%20fields%20and%20try%20again.`);
  }
  if (!imageExists(result.data.image)) {
    redirect(`/admin/menu/${encodeURIComponent(id)}?error=Choose%20an%20existing%20local%20menu%20image.`);
  }

  const updated = await updateDish(id, { ...result.data, id });
  if (!updated) {
    redirect("/admin/menu?error=Dish%20not%20found.");
  }
  invalidateMenu(id);
  redirect("/admin/menu");
}

export async function deleteDishAction(formData) {
  await requireStaff();
  const id = formData.get("id")?.toString() ?? "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    redirect("/admin/menu?error=Invalid%20dish%20identifier.");
  }
  const deleted = await deleteDish(id);
  if (!deleted) {
    redirect("/admin/menu?error=Dish%20not%20found.");
  }
  invalidateMenu(id);
  redirect("/admin/menu");
}

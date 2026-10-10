"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/lib/session";

export async function adminLoginAction(formData) {
  const email = formData.get("email")?.toString().trim().slice(0, 254) ?? "";
  const password = formData.get("password")?.toString() ?? "";

  if (!email || !password || password.length > 256) {
    redirect("/admin/login?error=Invalid%20email%20or%20password.");
  }

  const result = await signIn(email, password, "staff");
  if (!result.success) {
    redirect("/admin/login?error=Invalid%20email%20or%20password.");
  }

  redirect("/admin");
}

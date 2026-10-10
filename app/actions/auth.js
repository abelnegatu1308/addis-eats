"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/session";

function safeNext(value) {
  if (!value || !value.startsWith("/")) {
    return "/";
  }

  if (value.startsWith("//")) {
    return "/";
  }

  return value;
}

export async function loginAction(formData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const next = safeNext(formData.get("next")?.toString());

  if (!email || !password) {
    redirect(
      `/signin?error=${encodeURIComponent(
        "Email and password are required."
      )}&next=${encodeURIComponent(next)}`
    );
  }

  const result = await signIn(email, password);

  if (!result.success) {
    redirect(
      `/signin?error=${encodeURIComponent(
        result.error
      )}&next=${encodeURIComponent(next)}`
    );
  }

  redirect(next);
}

export async function logoutAction() {
  await signOut();

  redirect("/signin");
}
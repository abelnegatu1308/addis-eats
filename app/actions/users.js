"use server";

import { redirect } from "next/navigation";

import { getSession, isStaff } from "@/lib/session";
import {
  createUserAccount,
  setUserStatus,
  updateUserAccount,
} from "@/lib/users";

async function requireStaffSession() {
  const session = await getSession();
  if (!session || !isStaff(session)) {
    redirect("/admin/login");
  }
  return session;
}

function redirectWithMessage(pathname, message, nextPath = null) {
  const query = new URLSearchParams({ error: message });
  if (nextPath) {
    query.set("next", nextPath);
  }
  redirect(`${pathname}?${query.toString()}`);
}

export async function createUserAction(formData) {
  await requireStaffSession();

  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";
  const role = formData.get("role") === "staff" ? "staff" : "customer";
  const active = formData.get("active") === "true" || formData.get("active") === "on";

  if (!name || !email || !password || !confirmPassword) {
    redirectWithMessage("/admin/users/new", "Please complete every field.");
  }

  if (password !== confirmPassword) {
    redirectWithMessage("/admin/users/new", "Passwords do not match.");
  }

  const result = await createUserAccount({
    name,
    email,
    password,
    role,
    active,
  });

  if (result.status !== "success") {
    redirectWithMessage("/admin/users/new", result.message || "Unable to create the account.");
  }

  redirect("/admin/users?success=User+created+successfully.");
}

export async function updateUserAction(formData) {
  await requireStaffSession();

  const userId = formData.get("userId")?.toString() ?? "";
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const role = formData.get("role") === "staff" ? "staff" : "customer";
  const active = formData.get("active") === "true" || formData.get("active") === "on";

  if (!userId) {
    redirect("/admin/users");
  }

  const result = await updateUserAccount(userId, {
    name,
    email,
    role,
    active,
  });

  if (result.status !== "success") {
    redirect(`/admin/users/${userId}/edit?error=${encodeURIComponent(result.message || "Unable to update this user.")}`);
  }

  redirect("/admin/users?success=User+updated+successfully.");
}

export async function toggleUserStatusAction(formData) {
  await requireStaffSession();

  const userId = formData.get("userId")?.toString() ?? "";
  const nextState = String(formData.get("active") ?? "false") === "true";

  if (!userId) {
    redirect("/admin/users");
  }

  const result = await setUserStatus(userId, nextState);
  if (result.status !== "success") {
    redirect(`/admin/users?error=${encodeURIComponent(result.message || "Unable to change account status.")}`);
  }

  const message = nextState ? "Account+activated." : "Account+deactivated.";
  redirect(`/admin/users?success=${encodeURIComponent(message)}`);
}

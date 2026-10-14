import "server-only";

import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";

import { getDatabase } from "./db.js";

const storeKey = Symbol.for("addis-eats.users");
const userStore = globalThis[storeKey] ?? new Map();
globalThis[storeKey] = userStore;

export function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function isAllowedRole(role) {
  return role === "customer" || role === "staff";
}

export function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const { passwordHash, password_hash, ...rest } = user;
  return {
    ...rest,
    id: rest.id,
    name: rest.name,
    email: rest.email,
    role: rest.role,
    active: rest.active ?? true,
    createdAt: rest.createdAt ?? rest.created_at,
    updatedAt: rest.updatedAt ?? rest.updated_at,
  };
}

export async function getUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return null;
  }

  const sql = getDatabase();
  if (sql) {
    const [row] = await sql`
      SELECT * FROM addis_eats_users
      WHERE lower(trim(email)) = ${normalizedEmail}
      LIMIT 1
    `;

    if (!row) {
      return null;
    }

    return {
      ...row,
      passwordHash: row.password_hash,
    };
  }

  for (const user of userStore.values()) {
    if (normalizeEmail(user.email) === normalizedEmail) {
      return { ...user, passwordHash: user.passwordHash };
    }
  }

  return null;
}

export async function getUserById(id) {
  if (!id) {
    return null;
  }

  const sql = getDatabase();
  if (sql) {
    const [row] = await sql`
      SELECT * FROM addis_eats_users
      WHERE id = ${id}::uuid
      LIMIT 1
    `;

    if (!row) {
      return null;
    }

    return {
      ...row,
      passwordHash: row.password_hash,
    };
  }

  for (const user of userStore.values()) {
    if (user.id === id) {
      return { ...user, passwordHash: user.passwordHash };
    }
  }

  return null;
}

export async function listUsers({ search = "", role = "all", active = "all" } = {}) {
  const searchTerm = String(search ?? "").trim().toLowerCase();
  const sql = getDatabase();

  if (sql) {
    const rows = await sql`
      SELECT * FROM addis_eats_users
      WHERE (
        ${searchTerm === ""} OR
        lower(name) LIKE ${`%${searchTerm}%`} OR
        lower(email) LIKE ${`%${searchTerm}%`}
      )
      AND (${role === "all"} OR role = ${role})
      AND (${active === "all"} OR active = ${active === "active"})
      ORDER BY created_at DESC
    `;

    return rows.map((row) => sanitizeUser({ ...row, passwordHash: row.password_hash }));
  }

  return [...userStore.values()]
    .filter((user) => {
      const matchesSearch = !searchTerm ||
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm);
      const matchesRole = role === "all" || user.role === role;
      const matchesStatus = active === "all" || (active === "active" ? user.active : !user.active);
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .map((user) => sanitizeUser({ ...user, passwordHash: user.passwordHash }));
}

export async function createUserAccount({ name, email, password, role = "customer", active = true }) {
  const trimmedName = String(name ?? "").trim();
  const normalizedEmail = normalizeEmail(email);

  if (!trimmedName || trimmedName.length > 100) {
    return { status: "invalid", message: "Enter a valid full name." };
  }
  if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return { status: "invalid", message: "Use a valid email address." };
  }
  if (!password || password.length < 8 || password.length > 128) {
    return { status: "invalid", message: "Use a password between 8 and 128 characters." };
  }
  if (!isAllowedRole(role)) {
    return { status: "invalid", message: "Choose a valid role." };
  }

  const existingUser = await getUserByEmail(normalizedEmail);
  if (existingUser) {
    return { status: "duplicate", message: "An account with this email already exists." };
  }

  const user = {
    id: randomUUID(),
    name: trimmedName,
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12),
    role,
    active: Boolean(active),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sql = getDatabase();
  if (sql) {
    const [row] = await sql`
      INSERT INTO addis_eats_users
        (id, name, email, password_hash, role, active, created_at, updated_at)
      VALUES
        (${user.id}::uuid, ${user.name}, ${user.email}, ${user.passwordHash}, ${user.role}, ${user.active}, ${user.createdAt}::timestamptz, ${user.updatedAt}::timestamptz)
      RETURNING *
    `;
    return { status: "success", user: sanitizeUser({ ...row, passwordHash: row.password_hash }) };
  }

  userStore.set(normalizedEmail, user);
  return { status: "success", user: sanitizeUser({ ...user, passwordHash: user.passwordHash }) };
}

export async function updateUserAccount(id, updates) {
  const targetUser = await getUserById(id);
  if (!targetUser) {
    return { status: "not-found", message: "User not found." };
  }

  const nextName = String(updates?.name ?? targetUser.name).trim();
  const nextEmail = normalizeEmail(updates?.email ?? targetUser.email);
  const nextRole = updates?.role ?? targetUser.role;
  const nextActive = updates?.active ?? targetUser.active;

  if (!nextName || nextName.length > 100) {
    return { status: "invalid", message: "Enter a valid full name." };
  }
  if (!nextEmail || !/^\S+@\S+\.\S+$/.test(nextEmail)) {
    return { status: "invalid", message: "Use a valid email address." };
  }
  if (!isAllowedRole(nextRole)) {
    return { status: "invalid", message: "Choose a valid role." };
  }

  const duplicateUser = await getUserByEmail(nextEmail);
  if (duplicateUser && duplicateUser.id !== id) {
    return { status: "duplicate", message: "Another user already uses this email." };
  }

  const sql = getDatabase();
  if (sql) {
    const [row] = await sql`
      UPDATE addis_eats_users
      SET name = ${nextName},
          email = ${nextEmail},
          role = ${nextRole},
          active = ${Boolean(nextActive)},
          updated_at = now()
      WHERE id = ${id}::uuid
      RETURNING *
    `;

    if (!row) {
      return { status: "not-found", message: "User not found." };
    }

    return { status: "success", user: sanitizeUser({ ...row, passwordHash: row.password_hash }) };
  }

  const updatedUser = {
    ...targetUser,
    name: nextName,
    email: nextEmail,
    role: nextRole,
    active: Boolean(nextActive),
    updatedAt: new Date().toISOString(),
  };
  userStore.delete(normalizeEmail(targetUser.email));
  userStore.set(normalizeEmail(nextEmail), updatedUser);

  return { status: "success", user: sanitizeUser({ ...updatedUser, passwordHash: updatedUser.passwordHash }) };
}

export async function setUserStatus(id, active) {
  return updateUserAccount(id, { active: Boolean(active) });
}

export async function deleteUserAccount(id) {
  const sql = getDatabase();
  if (sql) {
    const [row] = await sql`
      DELETE FROM addis_eats_users
      WHERE id = ${id}::uuid
      RETURNING *
    `;
    return row ? { status: "success" } : { status: "not-found", message: "User not found." };
  }

  const user = await getUserById(id);
  if (!user) {
    return { status: "not-found", message: "User not found." };
  }

  userStore.delete(normalizeEmail(user.email));
  return { status: "success" };
}

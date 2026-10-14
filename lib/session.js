import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { getUserByEmail, normalizeEmail } from "./users.js";

const SESSION_COOKIE = "addis-eats-session";

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET ||
    (process.env.NODE_ENV === "production"
      ? ""
      : "development-only-secret-change-me-32");
  if (secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }
  return secret;
}

function getUsers() {
  const users = process.env.NODE_ENV === "production"
    ? [
      {
        id: "customer",
        email: process.env.CUSTOMER_EMAIL,
        password: process.env.CUSTOMER_PASSWORD,
        name: "Addis Eats Customer",
        role: "customer",
      },
      {
        id: "staff",
        email: process.env.STAFF_EMAIL,
        password: process.env.STAFF_PASSWORD,
        name: "Addis Eats Staff",
        role: "staff",
      },
    ]
    : [
      {
        id: "user-abel",
        email: "abel@addiseats.local",
        password: "abel123",
        name: "Abel",
        role: "customer",
      },
      {
        id: "user-staff",
        email: "staff@addiseats.local",
        password: "staff123",
        name: "Addis Eats Staff",
        role: "staff",
      },
    ];

  if (users.some(({ email, password }) => !email || !password)) {
    throw new Error(
      "CUSTOMER_EMAIL, CUSTOMER_PASSWORD, STAFF_EMAIL, and STAFF_PASSWORD must be configured in production."
    );
  }
  return users;
}

async function findDatabaseUser(email, requiredRole, password) {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  if (!user.active) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash ?? "");
  if (!passwordMatches) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

function sign(value) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("hex");
}

function createSessionValue(user) {
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  });

  const encoded = Buffer.from(payload).toString("base64url");
  const signature = sign(encoded);

  return `${encoded}.${signature}`;
}

function verifySessionValue(value) {
  if (!value) {
    return null;
  }

  const [encoded, signature] = value.split(".");

  if (!encoded || !signature) {
    return null;
  }

  const expectedSignature = sign(encoded);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    );

    if (
      typeof payload.id !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      !["customer", "staff"].includes(payload.role) ||
      !Number.isFinite(payload.exp) ||
      payload.exp <= Date.now()
    ) {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  if (!sessionCookie?.value) {
    return null;
  }

  return verifySessionValue(sessionCookie.value);
}

export async function signIn(email, password, requiredRole) {
  const normalizedEmail = normalizeEmail(email);
  const suppliedPassword = Buffer.from(password ?? "");

  const user = getUsers().find((candidate) => {
    if (normalizeEmail(candidate.email) !== normalizedEmail) {
      return false;
    }
    if (requiredRole && candidate.role !== requiredRole) {
      return false;
    }
    const expectedPassword = Buffer.from(candidate.password ?? "");
    return expectedPassword.length === suppliedPassword.length &&
      crypto.timingSafeEqual(expectedPassword, suppliedPassword);
  }) ?? await findDatabaseUser(normalizedEmail, requiredRole, password ?? "");

  if (!user) {
    return {
      success: false,
      error: "Invalid email or password.",
    };
  }

  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE,
    value: createSessionValue(user),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export async function signOut() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);
}

export function isStaff(session) {
  return session?.role === "staff";
}
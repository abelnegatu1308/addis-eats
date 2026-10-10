import test from "node:test";
import assert from "node:assert/strict";
import { getDatabase } from "./db.js";
import {
  cancelOrderForSession,
  createOrder,
  getOrder,
  getOrderForOwner,
  updateOrderStatusForStaff,
} from "./orders.js";

test("production does not silently fall back without a database", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDatabaseUrl = process.env.DATABASE_URL;
  process.env.NODE_ENV = "production";
  delete process.env.DATABASE_URL;

  try {
    assert.throws(getDatabase, /DATABASE_URL must be configured/);
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
  }
});

test("cancellation rejects requests without a session", async () => {
  const order = await createOrder("owner-session", { name: "Abebe" });
  assert.equal((await cancelOrderForSession(undefined, order.id)).status, "unauthorized");
  assert.equal((await getOrder(order.id)).status, "pending");
});

test("cancellation rejects a different session from the order owner", async () => {
  const order = await createOrder("owner-session", { name: "Abebe" });
  assert.equal(
    (await cancelOrderForSession("attacker-session", order.id)).status,
    "forbidden",
  );
  assert.equal((await getOrder(order.id)).status, "pending");
});

test("owner can cancel a pending order once", async () => {
  const order = await createOrder("owner-session", { name: "Abebe" });
  assert.equal((await cancelOrderForSession("owner-session", order.id)).status, "success");
  assert.equal((await cancelOrderForSession("owner-session", order.id)).status, "conflict");
});

test("order lookup does not return another account's record", async () => {
  const order = await createOrder("owner-account", { name: "Abebe" });
  assert.equal(await getOrderForOwner(order.id, "attacker-account"), null);
  assert.equal((await getOrderForOwner(order.id, "owner-account")).id, order.id);
});

test("staff status transitions reject invalid and terminal transitions", async () => {
  const order = await createOrder("owner-account", { name: "Abebe" });
  assert.equal((await updateOrderStatusForStaff(order.id, "delivered")).status, "conflict");
  assert.equal((await updateOrderStatusForStaff(order.id, "preparing")).status, "success");
  assert.equal((await updateOrderStatusForStaff(order.id, "delivered")).status, "conflict");
});

test("invalid order identifiers are rejected without exposing another record", async () => {
  assert.equal(await getOrderForOwner("not-an-uuid", "owner-account"), null);
  assert.equal(
    (await updateOrderStatusForStaff("not-an-uuid", "preparing")).status,
    "not-found",
  );
});
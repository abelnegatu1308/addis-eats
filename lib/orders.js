import "server-only";

import { randomUUID } from "node:crypto";
import { getDatabase } from "./db.js";

const storeKey = Symbol.for("addis-eats.orders");
const orderStore = globalThis[storeKey] ?? new Map();
globalThis[storeKey] = orderStore;

const orderIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function fromDatabaseRow(row) {
  const order = {
    id: row.id,
    ownerId: row.owner_id,
    status: row.status,
    name: row.name,
    phone: row.phone,
    area: row.area,
    notes: row.notes ?? "",
    items: typeof row.items === "string" ? JSON.parse(row.items) : row.items,
    total: Number(row.total),
    createdAt: new Date(row.created_at).toISOString(),
  };

  if (row.cancelled_at) {
    order.cancelledAt = new Date(row.cancelled_at).toISOString();
  }

  return order;
}

export async function createOrder(ownerId, details) {
  const order = {
    ...details,
    id: randomUUID(),
    ownerId,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const sql = getDatabase();

  if (!sql) {
    orderStore.set(order.id, order);
    return order;
  }

  const [row] = await sql`
    INSERT INTO addis_eats_orders
      (id, owner_id, status, name, phone, area, notes, items, total, created_at)
    VALUES
      (${order.id}::uuid, ${ownerId}, ${order.status}, ${order.name},
       ${order.phone}, ${order.area}, ${order.notes ?? ""},
       ${JSON.stringify(order.items ?? [])}::jsonb, ${order.total ?? 0},
       ${order.createdAt}::timestamptz)
    RETURNING *
  `;

  return fromDatabaseRow(row);
}

export async function getOrder(id) {
  if (!orderIdPattern.test(id)) {
    return null;
  }

  const sql = getDatabase();
  if (!sql) {
    return orderStore.get(id) ?? null;
  }

  const [row] = await sql`
    SELECT * FROM addis_eats_orders WHERE id = ${id}::uuid
  `;
  return row ? fromDatabaseRow(row) : null;
}

export async function getOrderForOwner(id, ownerId) {
  if (!orderIdPattern.test(id)) {
    return null;
  }

  const sql = getDatabase();
  if (sql) {
    const [row] = await sql`
      SELECT * FROM addis_eats_orders
      WHERE id = ${id}::uuid AND owner_id = ${ownerId}
    `;
    return row ? toPublicOrder(fromDatabaseRow(row)) : null;
  }

  const order = orderStore.get(id) ?? null;
  return order?.ownerId === ownerId ? toPublicOrder(order) : null;
}

export async function getAllOrders() {
  const sql = getDatabase();
  const orders = sql
    ? (await sql`SELECT * FROM addis_eats_orders ORDER BY created_at DESC`)
      .map(fromDatabaseRow)
    : [...orderStore.values()];

  return orders.map(toPublicOrder);
}

export async function getOrderingAccountCount() {
  const sql = getDatabase();
  if (sql) {
    const [row] = await sql`
      SELECT count(DISTINCT owner_id) AS total
      FROM addis_eats_orders
    `;
    return Number(row.total);
  }

  return new Set(
    [...orderStore.values()].map((order) => order.ownerId).filter(Boolean),
  ).size;
}

export async function getOrdersForOwner(ownerId) {
  const sql = getDatabase();
  const orders = sql
    ? (
        await sql`
          SELECT * FROM addis_eats_orders
          WHERE owner_id = ${ownerId}
          ORDER BY created_at DESC
        `
      ).map(fromDatabaseRow)
    : [...orderStore.values()].filter((order) => order.ownerId === ownerId);

  return orders.map(toPublicOrder);
}

const transitions = {
  pending: ["preparing", "cancelled"],
  preparing: ["delivering", "cancelled"],
  delivering: ["delivered"],
  delivered: [],
  cancelled: [],
};

export async function updateOrderStatusForStaff(orderId, status) {
  if (!orderIdPattern.test(orderId)) {
    return { status: "not-found", message: "Order not found." };
  }

  const sql = getDatabase();
  if (!sql) {
    const order = orderStore.get(orderId);
    if (!order) {
      return { status: "not-found", message: "Order not found." };
    }

    if (!transitions[order.status]?.includes(status)) {
      return {
        status: "conflict",
        message: `Cannot change an order from ${order.status} to ${status}.`,
      };
    }

    order.status = status;
    if (status === "cancelled") {
      order.cancelledAt = new Date().toISOString();
    }
    return { status: "success", order: toPublicOrder(order) };
  }

  const [updatedRow] = await sql`
    UPDATE addis_eats_orders
    SET status = ${status},
        cancelled_at = CASE
          WHEN ${status} = 'cancelled' THEN now()
          ELSE cancelled_at
        END
    WHERE id = ${orderId}::uuid
      AND (
        (status = 'pending' AND ${status} IN ('preparing', 'cancelled'))
        OR (status = 'preparing' AND ${status} IN ('delivering', 'cancelled'))
        OR (status = 'delivering' AND ${status} = 'delivered')
      )
    RETURNING *
  `;

  if (updatedRow) {
    return {
      status: "success",
      order: toPublicOrder(fromDatabaseRow(updatedRow)),
    };
  }

  const order = await getOrder(orderId);
  if (!order) {
    return { status: "not-found", message: "Order not found." };
  }

  return {
    status: "conflict",
    message: `Cannot change an order from ${order.status} to ${status}.`,
  };
}

export async function cancelOrderForSession(sessionId, orderId) {
  if (!sessionId) {
    return { status: "unauthorized", message: "A checkout session is required." };
  }

  if (!orderIdPattern.test(orderId)) {
    return { status: "not-found", message: "Order not found." };
  }

  const sql = getDatabase();
  if (!sql) {
    const order = orderStore.get(orderId);
    if (!order) {
      return { status: "not-found", message: "Order not found." };
    }
    if (order.ownerId !== sessionId) {
      return { status: "forbidden", message: "You cannot cancel this order." };
    }
    if (order.status !== "pending") {
      return { status: "conflict", message: "Only pending orders can be cancelled." };
    }

    order.status = "cancelled";
    order.cancelledAt = new Date().toISOString();
    return { status: "success", message: "Order cancelled." };
  }

  const [cancelledRow] = await sql`
    UPDATE addis_eats_orders
    SET status = 'cancelled', cancelled_at = now()
    WHERE id = ${orderId}::uuid
      AND owner_id = ${sessionId}
      AND status = 'pending'
    RETURNING id
  `;

  if (cancelledRow) {
    return { status: "success", message: "Order cancelled." };
  }

  const order = await getOrder(orderId);
  if (!order) {
    return { status: "not-found", message: "Order not found." };
  }
  if (order.ownerId !== sessionId) {
    return { status: "forbidden", message: "You cannot cancel this order." };
  }

  return { status: "conflict", message: "Only pending orders can be cancelled." };
}

export function toPublicOrder({ ownerId, ...order }) {
  return {
    ...order,
    items: Array.isArray(order.items) ? order.items : [],
    total: Number(order.total ?? 0),
  };
}

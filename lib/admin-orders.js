import "server-only";

import { getDatabase } from "./db.js";
import { getAllOrders } from "./orders.js";

const PAGE_SIZE = 20;
const ORDER_STATUSES = [
  "pending",
  "preparing",
  "delivering",
  "delivered",
  "cancelled",
];

export async function getAdminOrders({ page = 1, status = "all", search = "" }) {
  const safePage = Number.isSafeInteger(page) ? Math.max(1, page) : 1;
  const safeStatus = ORDER_STATUSES.includes(status) ? status : "all";
  const safeSearch = search.trim().slice(0, 100);
  const sql = getDatabase();
  let total;
  let orders;
  let resolvedPage = safePage;
  let statusCounts;

  if (!sql) {
    const allOrders = await getAllOrders();
    statusCounts = Object.fromEntries([
      ["pending", 0],
      ["preparing", 0],
      ["delivering", 0],
    ]);
    for (const order of allOrders) {
      if (Object.hasOwn(statusCounts, order.status)) {
        statusCounts[order.status] += 1;
      }
    }
    const filtered = allOrders
      .filter((order) => safeStatus === "all" || order.status === safeStatus)
      .filter((order) => {
        if (!safeSearch) return true;
        const searchable = `${order.id} ${order.name} ${order.phone}`.toLowerCase();
        return searchable.includes(safeSearch.toLowerCase());
      })
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
    total = filtered.length;
    resolvedPage = Math.min(safePage, Math.max(1, Math.ceil(total / PAGE_SIZE)));
    orders = filtered.slice(
      (resolvedPage - 1) * PAGE_SIZE,
      resolvedPage * PAGE_SIZE,
    );
  } else {
    const [statusRow] = await sql`
      SELECT
        count(*) FILTER (WHERE status = 'pending') AS pending,
        count(*) FILTER (WHERE status = 'preparing') AS preparing,
        count(*) FILTER (WHERE status = 'delivering') AS delivering
      FROM addis_eats_orders
    `;
    statusCounts = {
      pending: Number(statusRow.pending),
      preparing: Number(statusRow.preparing),
      delivering: Number(statusRow.delivering),
    };
    const [countRow] = await sql`
      SELECT count(*) AS total
      FROM addis_eats_orders
      WHERE (${safeStatus} = 'all' OR status = ${safeStatus})
        AND (
          ${safeSearch} = ''
          OR name ILIKE ${`%${safeSearch}%`}
          OR phone ILIKE ${`%${safeSearch}%`}
          OR id::text ILIKE ${`%${safeSearch}%`}
        )
    `;
    const rows = await sql`
      SELECT *
      FROM addis_eats_orders
      WHERE (${safeStatus} = 'all' OR status = ${safeStatus})
        AND (
          ${safeSearch} = ''
          OR name ILIKE ${`%${safeSearch}%`}
          OR phone ILIKE ${`%${safeSearch}%`}
          OR id::text ILIKE ${`%${safeSearch}%`}
        )
      ORDER BY created_at DESC
      LIMIT ${PAGE_SIZE}
        OFFSET ${(resolvedPage - 1) * PAGE_SIZE}
    `;
    total = Number(countRow.total);
    resolvedPage = Math.min(safePage, Math.max(1, Math.ceil(total / PAGE_SIZE)));
    orders = rows.map((row) => ({
      id: row.id,
      status: row.status,
      name: row.name,
      phone: row.phone,
      area: row.area,
      notes: row.notes ?? "",
      items: Array.isArray(row.items) ? row.items : JSON.parse(row.items),
      total: Number(row.total),
      createdAt: new Date(row.created_at).toISOString(),
    }));
  }

  return {
    orders,
    page: resolvedPage,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
    statusCounts,
  };
}

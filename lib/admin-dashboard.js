import "server-only";

import { getDatabase } from "./db.js";
import { getAllOrders, getOrderingAccountCount } from "./orders.js";

const BUSINESS_TIME_ZONE = "Africa/Addis_Ababa";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function businessDate(value) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function emptyMetrics() {
  return {
    totalOrders: 0,
    ordersToday: 0,
    todayRevenue: 0,
    revenue: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    orderingAccounts: 0,
    averageOrderValue: 0,
  };
}

function getMemoryDashboard(orders, orderingAccounts) {
  const today = businessDate(new Date());
  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.now() - (6 - index) * DAY_IN_MS);
    return businessDate(date);
  });
  const completed = orders.filter((order) => order.status === "delivered");
  const todayOrders = orders.filter(
    (order) => businessDate(new Date(order.createdAt)) === today,
  );
  const metrics = {
    ...emptyMetrics(),
    totalOrders: orders.length,
    ordersToday: todayOrders.length,
    todayRevenue: todayOrders
      .filter((order) => order.status === "delivered")
      .reduce((sum, order) => sum + order.total, 0),
    revenue: completed.reduce((sum, order) => sum + order.total, 0),
    pendingOrders: orders.filter((order) => order.status === "pending").length,
    inProgressOrders: orders.filter((order) =>
      ["preparing", "delivering"].includes(order.status),
    ).length,
    completedOrders: completed.length,
    cancelledOrders: orders.filter((order) => order.status === "cancelled").length,
    orderingAccounts,
    averageOrderValue: completed.length
      ? Math.round(completed.reduce((sum, order) => sum + order.total, 0) / completed.length)
      : 0,
  };

  const dailyOrders = dates.map((date) => {
    const matchingOrders = orders.filter(
      (order) => businessDate(new Date(order.createdAt)) === date,
    );
    return {
      date,
      orders: matchingOrders.length,
      revenue: matchingOrders
        .filter((order) => order.status === "delivered")
        .reduce((sum, order) => sum + order.total, 0),
    };
  });

  const dishTotals = new Map();
  for (const order of completed) {
    for (const item of order.items) {
      const current = dishTotals.get(item.id) ?? {
        id: item.id,
        name: item.name,
        unitsSold: 0,
        revenue: 0,
      };
      current.unitsSold += item.qty;
      current.revenue += item.price * item.qty;
      dishTotals.set(item.id, current);
    }
  }

  return {
    source: "memory",
    metrics,
    dailyOrders,
    topDishes: [...dishTotals.values()]
      .sort((left, right) => right.unitsSold - left.unitsSold)
      .slice(0, 5),
    recentOrders: [...orders]
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
      .slice(0, 6),
  };
}

function toMetrics(row) {
  return {
    totalOrders: Number(row.total_orders),
    ordersToday: Number(row.orders_today),
    todayRevenue: Number(row.today_revenue),
    revenue: Number(row.revenue),
    pendingOrders: Number(row.pending_orders),
    inProgressOrders: Number(row.in_progress_orders),
    completedOrders: Number(row.completed_orders),
    cancelledOrders: Number(row.cancelled_orders),
    orderingAccounts: Number(row.ordering_accounts),
    averageOrderValue: Number(row.average_order_value),
  };
}

export async function getAdminDashboardData() {
  const sql = getDatabase();
  if (!sql) {
    const [orders, orderingAccounts] = await Promise.all([
      getAllOrders(),
      getOrderingAccountCount(),
    ]);
    return getMemoryDashboard(orders, orderingAccounts);
  }

  const [metricsRow] = await sql`
    WITH business_clock AS (
      SELECT
        (now() AT TIME ZONE 'Africa/Addis_Ababa')::date AS today,
        ((now() AT TIME ZONE 'Africa/Addis_Ababa')::date)::timestamp
          AT TIME ZONE 'Africa/Addis_Ababa' AS today_start
    )
    SELECT
      count(*) AS total_orders,
      count(*) FILTER (WHERE orders.created_at >= business_clock.today_start)
        AS orders_today,
      coalesce(sum(orders.total) FILTER (
        WHERE orders.status = 'delivered'
          AND orders.created_at >= business_clock.today_start
      ), 0) AS today_revenue,
      coalesce(sum(orders.total) FILTER (WHERE orders.status = 'delivered'), 0)
        AS revenue,
      count(*) FILTER (WHERE orders.status = 'pending') AS pending_orders,
      count(*) FILTER (WHERE orders.status IN ('preparing', 'delivering'))
        AS in_progress_orders,
      count(*) FILTER (WHERE orders.status = 'delivered') AS completed_orders,
      count(*) FILTER (WHERE orders.status = 'cancelled') AS cancelled_orders,
      count(DISTINCT orders.owner_id) AS ordering_accounts,
      coalesce(round(avg(orders.total) FILTER (WHERE orders.status = 'delivered')), 0)
        AS average_order_value
    FROM addis_eats_orders AS orders
    CROSS JOIN business_clock
  `;

  const dailyRows = await sql`
    WITH days AS (
      SELECT generate_series(
        (now() AT TIME ZONE 'Africa/Addis_Ababa')::date - 6,
        (now() AT TIME ZONE 'Africa/Addis_Ababa')::date,
        interval '1 day'
      )::date AS day
    )
    SELECT
      days.day::text AS date,
      count(orders.id) AS orders,
      coalesce(sum(orders.total) FILTER (WHERE orders.status = 'delivered'), 0)
        AS revenue
    FROM days
    LEFT JOIN addis_eats_orders AS orders
      ON orders.created_at >= days.day::timestamp AT TIME ZONE 'Africa/Addis_Ababa'
      AND orders.created_at < (days.day + 1)::timestamp AT TIME ZONE 'Africa/Addis_Ababa'
    GROUP BY days.day
    ORDER BY days.day
  `;

  const recentRows = await sql`
    SELECT * FROM addis_eats_orders
    ORDER BY created_at DESC
    LIMIT 6
  `;

  const topDishRows = await sql`
    SELECT
      item->>'id' AS id,
      item->>'name' AS name,
      sum((item->>'qty')::integer) AS units_sold,
      sum((item->>'price')::numeric * (item->>'qty')::integer) AS revenue
    FROM addis_eats_orders AS orders
    CROSS JOIN LATERAL jsonb_array_elements(orders.items) AS item
    WHERE orders.status = 'delivered'
    GROUP BY item->>'id', item->>'name'
    ORDER BY units_sold DESC, revenue DESC
    LIMIT 5
  `;

  return {
    source: "database",
    metrics: toMetrics(metricsRow),
    dailyOrders: dailyRows.map((row) => ({
      date: row.date,
      orders: Number(row.orders),
      revenue: Number(row.revenue),
    })),
    topDishes: topDishRows.map((row) => ({
      id: row.id,
      name: row.name,
      unitsSold: Number(row.units_sold),
      revenue: Number(row.revenue),
    })),
    recentOrders: recentRows.map((row) => ({
      id: row.id,
      status: row.status,
      name: row.name,
      area: row.area,
      total: Number(row.total),
      createdAt: new Date(row.created_at).toISOString(),
      items: Array.isArray(row.items) ? row.items : JSON.parse(row.items),
    })),
  };
}

import test from "node:test";
import assert from "node:assert/strict";
import { getAdminOrders } from "./admin-orders.js";
import { getAdminDashboardData } from "./admin-dashboard.js";
import { createOrder, updateOrderStatusForStaff } from "./orders.js";

test("admin dashboard reports real development orders and excludes cancellations from sales", async () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalNodeEnv = process.env.NODE_ENV;
  delete process.env.DATABASE_URL;
  process.env.NODE_ENV = "test";

  try {
    const orderDetails = {
      name: "Dashboard Test",
      phone: "09110000000",
      area: "Bole",
      items: [{ id: "kitfo", name: "Kitfo", price: 100, qty: 2 }],
      total: 200,
    };
    const delivered = await createOrder("dashboard-customer-1", orderDetails);
    for (const status of ["preparing", "delivering", "delivered"]) {
      const updated = await updateOrderStatusForStaff(delivered.id, status);
      assert.equal(updated.status, "success");
    }
    await createOrder("dashboard-customer-2", {
      ...orderDetails,
      name: "Pending Customer",
      total: 150,
    });
    const cancelled = await createOrder("dashboard-customer-3", {
      ...orderDetails,
      name: "Cancelled Customer",
      total: 300,
    });
    const cancellation = await updateOrderStatusForStaff(cancelled.id, "cancelled");
    assert.equal(cancellation.status, "success");

    const dashboard = await getAdminDashboardData();
    assert.equal(dashboard.source, "memory");
    assert.equal(dashboard.metrics.totalOrders, 3);
    assert.equal(dashboard.metrics.ordersToday, 3);
    assert.equal(dashboard.metrics.revenue, 200);
    assert.equal(dashboard.metrics.todayRevenue, 200);
    assert.equal(dashboard.metrics.averageOrderValue, 200);
    assert.equal(dashboard.metrics.pendingOrders, 1);
    assert.equal(dashboard.metrics.cancelledOrders, 1);
    assert.equal(dashboard.metrics.orderingAccounts, 3);
    assert.deepEqual(dashboard.topDishes[0], {
      id: "kitfo",
      name: "Kitfo",
      unitsSold: 2,
      revenue: 200,
    });

    const filteredOrders = await getAdminOrders({
      page: 1,
      status: "pending",
      search: "Pending Customer",
    });
    assert.equal(filteredOrders.total, 1);
    assert.equal(filteredOrders.orders[0].name, "Pending Customer");
  } finally {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  }
});

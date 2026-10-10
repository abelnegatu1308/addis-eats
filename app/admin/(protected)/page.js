import Link from "next/link";
import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { getSession, isStaff } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin dashboard",
  description: "Order and sales overview for the Addis Eats team.",
};

const birr = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("en-ET");

function MetricCard({ label, value, detail, tone = "default" }) {
  return (
    <article className={`admin-metric admin-metric-${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function formatDay(date) {
  return new Intl.DateTimeFormat("en-ET", {
    timeZone: "Africa/Addis_Ababa",
    weekday: "short",
  }).format(new Date(`${date}T12:00:00+03:00`));
}

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!isStaff(session)) redirect("/");
  const dashboard = await getAdminDashboardData();
  const { metrics } = dashboard;
  const maxOrders = Math.max(...dashboard.dailyOrders.map((day) => day.orders), 1);
  const maxDailyRevenue = Math.max(...dashboard.dailyOrders.map((day) => day.revenue), 1);

  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">ADDIS EATS · OPERATIONS</p>
          <h1>Dashboard</h1>
          <p className="admin-subtitle">
            A live view of orders and completed sales.
          </p>
        </div>
        <Link href="/admin/orders" className="admin-primary-button">
          Manage orders <span aria-hidden="true">↗</span>
        </Link>
      </div>

      {dashboard.source === "memory" && (
        <p className="admin-dev-notice" role="status">
          Development data store: dashboard figures are held in this app process
          and are not durable. Configure <code>DATABASE_URL</code> for persistent
          orders.
        </p>
      )}

      <section className="admin-metrics" aria-label="Order and sales metrics">
        <MetricCard
          label="Delivered sales"
          value={birr.format(metrics.revenue)}
          detail="Delivered order totals; cancellations excluded"
          tone="green"
        />
        <MetricCard
          label="Sales from today's delivered orders"
          value={birr.format(metrics.todayRevenue)}
          detail="Orders placed today and now delivered"
        />
        <MetricCard
          label="Orders today"
          value={number.format(metrics.ordersToday)}
          detail={`${number.format(metrics.totalOrders)} total orders`}
        />
        <MetricCard
          label="Awaiting action"
          value={number.format(metrics.pendingOrders)}
          detail="Pending orders"
          tone={metrics.pendingOrders ? "gold" : "default"}
        />
        <MetricCard
          label="In progress"
          value={number.format(metrics.inProgressOrders)}
          detail="Preparing or delivering"
        />
        <MetricCard
          label="Average delivered order"
          value={birr.format(metrics.averageOrderValue)}
          detail={`${number.format(metrics.completedOrders)} delivered orders`}
        />
        <MetricCard
          label="Ordering accounts"
          value={number.format(metrics.orderingAccounts)}
          detail="Unique accounts with an order"
        />
        <MetricCard
          label="Cancelled orders"
          value={number.format(metrics.cancelledOrders)}
          detail="Excluded from delivered sales"
          tone="muted"
        />
      </section>

      <div className="admin-dashboard-columns">
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-eyebrow">LAST 7 DAYS</p>
              <h2>Revenue &amp; order activity</h2>
            </div>
            <div className="admin-chart-legends">
              <span className="admin-panel-legend">
                <i aria-hidden="true" /> Orders
              </span>
              <span className="admin-panel-legend">
                <i className="admin-legend-revenue" aria-hidden="true" /> Sales
              </span>
            </div>
          </div>
          {dashboard.dailyOrders.some((day) => day.orders > 0) ? (
            <div
              className="admin-chart"
              role="img"
              aria-label={`Orders and delivered sales in the last seven days: ${dashboard.dailyOrders.map((day) => `${formatDay(day.date)} ${day.orders} orders, ${birr.format(day.revenue)} sales`).join(", ")}`}
            >
              {dashboard.dailyOrders.map((day) => (
                <div className="admin-chart-column" key={day.date}>
                  <strong>{number.format(day.orders)}</strong>
                  <div className="admin-chart-track">
                    <span
                      style={{ height: `${Math.max((day.orders / maxOrders) * 100, day.orders ? 8 : 0)}%` }}
                    />
                    <span
                      className="admin-chart-revenue"
                      style={{ height: `${Math.max((day.revenue / maxDailyRevenue) * 100, day.revenue ? 8 : 0)}%` }}
                    />
                  </div>
                  <small>{formatDay(day.date)}</small>
                  <small className="admin-chart-revenue-label">
                    {birr.format(day.revenue)}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <strong>No orders in this period</strong>
              <p>Order activity will appear here when customers place orders.</p>
            </div>
          )}
          <p className="admin-chart-footnote">
            Bars show order count and delivered-order totals for each Ethiopia business day.
          </p>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-eyebrow">COMPLETED ORDERS</p>
              <h2>Popular dishes</h2>
            </div>
          </div>
          {dashboard.topDishes.length ? (
            <ol className="admin-top-dishes">
              {dashboard.topDishes.map((dish, index) => (
                <li key={dish.id}>
                  <span className="admin-rank">{String(index + 1).padStart(2, "0")}</span>
                  <span className="admin-dish-name">{dish.name}</span>
                  <span className="admin-dish-sales">
                    {number.format(dish.unitsSold)} sold
                    <small>{birr.format(dish.revenue)}</small>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="admin-empty-state">
              <strong>No completed orders yet</strong>
              <p>Dish sales are based on delivered orders only.</p>
            </div>
          )}
          <p className="admin-chart-footnote">
            Units and item revenue are calculated from delivered order items.
          </p>
        </section>
      </div>

      <section className="admin-panel admin-recent-panel">
        <div className="admin-panel-heading">
          <div>
            <p className="admin-eyebrow">LATEST ACTIVITY</p>
            <h2>Recent orders</h2>
          </div>
          <Link href="/admin/orders" className="admin-text-link">
            View all orders ↗
          </Link>
        </div>
        {dashboard.recentOrders.length ? (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Date · Addis Ababa</th>
                  <th scope="col">Items</th>
                  <th scope="col">Total</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td>{order.name}</td>
                    <td>
                      {new Intl.DateTimeFormat("en-ET", {
                        timeZone: "Africa/Addis_Ababa",
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(order.createdAt))}
                    </td>
                    <td>{order.items.reduce((sum, item) => sum + item.qty, 0)}</td>
                    <td>{birr.format(order.total)}</td>
                    <td>
                      <span className={`admin-status admin-status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-state">
            <strong>No orders yet</strong>
            <p>New customer orders will show up here.</p>
          </div>
        )}
      </section>
      <p className="admin-accounting-note">
        Sales and average order value include delivered orders only. The current
        order schema does not track payment settlement, refunds, discounts, or
        delivery fees separately; these figures are not profit or reconciled
        payment revenue.
      </p>
    </div>
  );
}

import Link from "next/link";
import OrderStatusControl from "../../OrderStatusControl";
import { getAdminOrders } from "@/lib/admin-orders";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order management",
  description: "Review and update Addis Eats customer orders.",
};

const birr = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 0,
});

const statuses = ["all", "pending", "preparing", "delivering", "delivered", "cancelled"];

function pageHref(page, status, search) {
  const params = new URLSearchParams({ page: String(page) });
  if (status !== "all") params.set("status", status);
  if (search) params.set("search", search);
  return `/admin/orders?${params.toString()}`;
}

export default async function AdminOrdersPage({ searchParams }) {
  const params = await searchParams;
  const status = statuses.includes(params?.status) ? params.status : "all";
  const search = typeof params?.search === "string" ? params.search.slice(0, 100) : "";
  const requestedPage = Number.parseInt(params?.page ?? "1", 10);
  const page = Number.isSafeInteger(requestedPage) ? Math.max(1, requestedPage) : 1;
  const result = await getAdminOrders({ page, status, search });

  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">ORDER OPERATIONS</p>
          <h1>Orders</h1>
          <p className="admin-subtitle">
            {result.total} {result.total === 1 ? "order" : "orders"} · update
            fulfillment status from the current workflow.
          </p>
        </div>
        <Link href="/admin" className="admin-secondary-button">
          ← Dashboard
        </Link>
      </div>

      <nav className="admin-order-stage-cards" aria-label="Orders by active status">
        {[
          ["pending", "Pending"],
          ["preparing", "Preparing"],
          ["delivering", "Delivering"],
        ].map(([value, label]) => (
          <Link
            key={value}
            href={pageHref(1, value, "")}
            className={`admin-order-stage admin-order-stage-${value}`}
            aria-current={status === value ? "page" : undefined}
          >
            <span>{label}</span>
            <strong>{result.statusCounts[value]}</strong>
          </Link>
        ))}
      </nav>

      <section className="admin-panel" aria-label="Order filters and results">
        <form className="admin-order-filters" action="/admin/orders">
          <label>
            Search orders
            <input
              type="search"
              name="search"
              defaultValue={search}
              maxLength={100}
              placeholder="Order ID, name, or phone"
            />
          </label>
          <label>
            Status
            <select name="status" defaultValue={status}>
              {statuses.map((value) => (
                <option value={value} key={value}>
                  {value === "all" ? "All statuses" : value}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="admin-primary-button">
            Apply filters
          </button>
        </form>

        {result.orders.length ? (
          <div className="admin-order-records">
            {result.orders.map((order) => (
              <article className="admin-order-record" key={order.id}>
                <div className="admin-order-record-head">
                  <div>
                    <p className="admin-eyebrow">
                      ORDER · {order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <h2>{order.name}</h2>
                    <p>{order.area} · {order.phone}</p>
                    <p>
                      {new Intl.DateTimeFormat("en-ET", {
                        timeZone: "Africa/Addis_Ababa",
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(order.createdAt))}
                    </p>
                  </div>
                  <span className={`admin-status admin-status-${order.status}`}>
                    {order.status}
                  </span>
                </div>
                <div>
                  <h3>Items</h3>
                  <ul className="admin-order-item-list">
                    {order.items.map((item) => (
                      <li key={`${order.id}-${item.id}`}>
                        <strong>{item.qty}×</strong> {item.name} ·{" "}
                        {birr.format(item.price)} each
                      </li>
                    ))}
                  </ul>
                </div>
                {order.notes && <p className="admin-order-note">Notes: {order.notes}</p>}
                <div className="admin-order-record-footer">
                  <strong>Total: {birr.format(order.total)}</strong>
                  <OrderStatusControl orderId={order.id} status={order.status} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-empty-state">
            <strong>No matching orders</strong>
            <p>Try another status or search term.</p>
          </div>
        )}

        {result.pageCount > 1 && (
          <nav className="admin-pagination" aria-label="Order pages">
            {result.page > 1 ? (
              <Link href={pageHref(result.page - 1, status, search)}>
                ← Previous
              </Link>
            ) : (
              <span aria-disabled="true">← Previous</span>
            )}
            <span>
              Page {result.page} of {result.pageCount}
            </span>
            {result.page < result.pageCount ? (
              <Link href={pageHref(result.page + 1, status, search)}>
                Next →
              </Link>
            ) : (
              <span aria-disabled="true">Next →</span>
            )}
          </nav>
        )}
      </section>
    </div>
  );
}

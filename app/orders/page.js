import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getOrdersForOwner } from "@/lib/orders";
import CancelOrderButton from "./CancelOrderButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your orders",
  description: "Check the status and details of your Addis Eats orders.",
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const session = await getSession();

  if (!session) {
    redirect("/signin?next=/orders");
  }

  // IMPORTANT:
  // Never return every order and filter it in the browser.
  //
  // The query itself is scoped to the authenticated
  // user's ID.
  const orders = await getOrdersForOwner(session.id);

  return (
    <main className="page-shell">
      <p className="page-kicker">
        ADDIS EATS · YOUR ORDERS
      </p>

      <div className="content-card">
        <h1>Your orders</h1>

        <p className="mt-2 text-gray-600">
          Orders belonging to {session.email}
        </p>

        {orders.length === 0 ? (
          <div className="mt-8 rounded-lg bg-gray-50 p-6">
            <p>You have not placed any orders yet.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-xl border p-5"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">
                    {order.id}
                  </h2>

                  <span className={`order-status order-status-${order.status}`}>
                    {order.status}
                  </span>
                </div>

                <ul className="mt-4 space-y-2">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.name} × {item.qty}
                    </li>
                  ))}
                </ul>

                <p className="mt-4 font-semibold">
                  Total: {order.total} ETB
                </p>
                <Link className="mt-4 inline-block underline" href={`/orders/${order.id}`}>
                  Track this order
                </Link>
                {order.status === "pending" && (
                  <CancelOrderButton orderId={order.id} />
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
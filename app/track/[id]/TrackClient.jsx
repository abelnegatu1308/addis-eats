"use client";

import dynamic from "next/dynamic";

import { formatCurrency, formatDateTime, formatStatusLabel, getEstimatedDeliveryLabel } from "@/lib/format";

const DeliveryMap = dynamic(() => import("./DeliveryMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center rounded-3xl border" style={{ minHeight: 420, borderColor: "var(--border)", background: "var(--surface-2)", color: "var(--text-muted)" }}>
      Loading map…
    </div>
  ),
});

const DeliveryStatus = dynamic(() => import("./DeliveryStatus"), {
  ssr: false,
  loading: () => (
    <div className="rounded-3xl border p-6" style={{ borderColor: "var(--border)", background: "var(--surface-2)", color: "var(--text-muted)" }}>
      Connecting to live delivery updates…
    </div>
  ),
});

export default function TrackClient({ orderId, order, destination, courierLocation, lastUpdated }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
          Addis Eats · delivery tracking
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Delivery for {order.id}</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="space-y-6">
          <DeliveryMap
            courierLocation={courierLocation}
            destination={destination}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <h2 className="text-lg font-bold">Delivery details</h2>
              <dl className="mt-4 space-y-4">
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
                    Delivery destination
                  </dt>
                  <dd className="mt-1 text-base font-medium">{order.area || "Address unavailable"}</dd>
                </div>

                <div>
                  <dt className="text-xs uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
                    Courier location
                  </dt>
                  <dd className="mt-1 text-base font-medium">
                    {order.status === "cancelled" ? "Unavailable" : `Near ${order.area || "Addis Ababa"}`}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
                    Estimated arrival
                  </dt>
                  <dd className="mt-1 text-base font-medium">{getEstimatedDeliveryLabel(order.status)}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <h2 className="text-lg font-bold">Order summary</h2>
              <ul className="mt-4 space-y-3">
                {(order.items ?? []).map((item) => (
                  <li key={`${order.id}-${item.id}`} className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      {item.name} × {item.qty}
                    </span>
                    <span>{formatCurrency((Number(item.price) || 0) * Number(item.qty || 1))}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total ?? 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <DeliveryStatus
            orderId={orderId}
            initialStatus={{
              status: order.status,
              lastUpdated,
              message: getEstimatedDeliveryLabel(order.status),
            }}
          />

          <section className="rounded-3xl border p-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <p className="text-sm uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
              Order details
            </p>

            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-xs uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
                  Order number
                </dt>
                <dd className="mt-1 text-lg font-semibold">{order.id}</dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
                  Status
                </dt>
                <dd className="mt-1 text-lg font-semibold capitalize">{formatStatusLabel(order.status)}</dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
                  Placed on
                </dt>
                <dd className="mt-1 text-lg font-semibold">{formatDateTime(order.createdAt)}</dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
                  Delivery area
                </dt>
                <dd className="mt-1 text-lg font-semibold">{order.area || "Address unavailable"}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </main>
  );
}

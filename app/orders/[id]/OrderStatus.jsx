"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import CancelOrderButton from "../CancelOrderButton";

export default function OrderStatus({
  orderId,
  fallbackData,
}) {
  const { data, error, isValidating } = useSWR(
    `/api/orders?id=${orderId}`,
    fetcher,
    {
      fallbackData: { order: fallbackData },
      refreshInterval: (currentData) => {
        const status = currentData?.order?.status;
        return status === "delivered" || status === "cancelled" ? 0 : 5000;
      },
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      revalidateOnFocus: false,
    }
  );

  if (error) {
    return (
      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--error-border)", background: "var(--error-bg)" }}>
        <h2 className="text-lg font-semibold" style={{ color: "var(--error)" }}>
          Unable to load order
        </h2>

        <p className="mt-2 text-sm" style={{ color: "var(--error)" }}>
          Please try again later.
        </p>
      </div>
    );
  }

  const order = data?.order;
  if (!order) {
    return null;
  }

  return (
    <section className="rounded-2xl border p-6 shadow-sm" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Order Status
          </p>

          <h2 className="mt-2 text-2xl font-bold capitalize">
            {order.status}
          </h2>
        </div>

        {isValidating && (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Updating...
          </span>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Order ID
          </p>

          <p className="mt-1 font-medium">
            {data.id || data.orderId || orderId}
          </p>
        </div>

        {order.total !== undefined && (
          <div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Total
            </p>

            <p className="mt-1 font-bold">{order.total} ETB</p>
          </div>
        )}
      </div>
      {order.status === "pending" && (
        <div className="mt-6">
          <p className="mb-3 text-sm" style={{ color: "var(--text-muted)" }}>
            You can cancel this order while it is still pending.
          </p>
          <CancelOrderButton orderId={orderId} />
        </div>
      )}
    </section>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import { formatDateTime, formatStatusLabel } from "@/lib/format";

const terminalStates = new Set(["delivered", "cancelled"]);

const statusMessages = {
  pending: "We’ve received your order and are waiting for the kitchen to confirm it.",
  preparing: "Your food is being prepared and the courier will be assigned soon.",
  delivering: "Your order is on the way and the courier is heading to your address.",
  delivered: "Your delivery has been completed. Enjoy your meal.",
  cancelled: "This order was cancelled and no further delivery updates will be sent.",
};

export default function DeliveryStatus({ orderId, initialStatus = {} }) {
  const [status, setStatus] = useState(initialStatus.status ?? "pending");
  const [lastUpdated, setLastUpdated] = useState(
    initialStatus.lastUpdated ?? new Date().toISOString(),
  );
  const [connectionState, setConnectionState] = useState("connecting");
  const sourceRef = useRef(null);

  useEffect(() => {
    if (!orderId) {
      return undefined;
    }

    const source = new EventSource(`/api/orders/${orderId}/stream`, {
      withCredentials: true,
    });

    sourceRef.current = source;

    source.onopen = () => {
      setConnectionState("live");
    };

    source.addEventListener("order-status", (event) => {
      try {
        const payload = JSON.parse(event.data ?? "{}");
        if (!payload?.status) {
          return;
        }

        setStatus(payload.status);
        setLastUpdated(payload.updatedAt ?? new Date().toISOString());
        setConnectionState("live");
      } catch {
        setConnectionState("disconnected");
      }
    });

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data ?? "{}");
        if (!payload?.status) {
          return;
        }

        setStatus(payload.status);
        setLastUpdated(payload.updatedAt ?? new Date().toISOString());
        setConnectionState("live");
      } catch {
        setConnectionState("disconnected");
      }
    };

    source.onerror = () => {
      setConnectionState(
        source.readyState === EventSource.CONNECTING ? "reconnecting" : "disconnected",
      );
    };

    return () => {
      source.close();
      sourceRef.current = null;
    };
  }, [orderId]);

  useEffect(() => {
    if (terminalStates.has(status) && sourceRef.current) {
      sourceRef.current.close();
      setConnectionState("delivered");
    }
  }, [status]);

  const connectionLabel = {
    connecting: "Connecting",
    live: "Live",
    reconnecting: "Reconnecting",
    disconnected: "Disconnected",
    delivered: "Delivered",
  }[connectionState] ?? "Connecting";

  return (
    <section
      className="rounded-3xl border p-6 shadow-sm"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
            Live delivery status
          </p>
          <h2 className="mt-2 text-2xl font-bold capitalize">{formatStatusLabel(status)}</h2>
        </div>

        <span
          className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]"
          style={{
            borderColor: connectionState === "live" ? "var(--success-border)" : "var(--border)",
            background: connectionState === "live" ? "var(--success-bg)" : "var(--surface-2)",
            color: connectionState === "live" ? "var(--success)" : "var(--text-muted)",
          }}
        >
          {connectionLabel}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6" style={{ color: "var(--text-muted)" }}>
        {statusMessages[status] ?? statusMessages.pending}
      </p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
            Current status
          </dt>
          <dd className="mt-1 text-base font-semibold capitalize">{formatStatusLabel(status)}</dd>
        </div>

        <div>
          <dt className="text-xs uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
            Last updated
          </dt>
          <dd className="mt-1 text-base font-semibold">{formatDateTime(lastUpdated)}</dd>
        </div>
      </dl>
    </section>
  );
}

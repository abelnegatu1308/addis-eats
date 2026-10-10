"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const nextStatus = {
  pending: "preparing",
  preparing: "delivering",
  delivering: "delivered",
};

export default function OrderStatusControl({ orderId, status }) {
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const next = nextStatus[status];

  async function advanceStatus() {
    setIsPending(true);
    setMessage("");
    try {
      const response = await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error?.message ?? "Order status update failed.");
      }
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div>
      {next && (
        <button
          type="button"
          className="button button-primary"
          onClick={advanceStatus}
          disabled={isPending}
        >
          {isPending ? "Updating..." : `Mark ${next}`}
        </button>
      )}
      {message && <p className="mt-2 text-sm text-red-600" role="alert">{message}</p>}
    </div>
  );
}

"use client";

import { downloadCsv } from "@/lib/csv";
import { formatDateTime } from "@/lib/format";

const headers = [
  "orderId",
  "placedAt",
  "status",
  "total",
  "deliveryArea",
  "phone",
  "items",
];

export default function ExportOrdersCsv({ orders }) {
  const handleExport = () => {
    const rows = (orders ?? []).map((order) => ({
      orderId: order.id,
      placedAt: formatDateTime(order.createdAt),
      status: order.status,
      total: Number(order.total ?? 0),
      deliveryArea: order.area ?? "",
      phone: order.phone ?? "",
      items: (order.items ?? []).map((item) => `${item.name} x${item.qty}`).join(" | "),
    }));

    downloadCsv("addis-eats-orders.csv", rows, headers);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition hover:opacity-90"
      style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
    >
      Export CSV
    </button>
  );
}

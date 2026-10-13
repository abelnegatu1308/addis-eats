export function formatCurrency(value, currency = "ETB") {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return `${currency} 0`;
  }

  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(value, fallback = "N/A") {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatStatusLabel(status) {
  const normalized = String(status ?? "unknown").trim();
  if (!normalized) {
    return "Unknown";
  }

  return normalized
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getEstimatedDeliveryLabel(status) {
  switch (status) {
    case "pending":
      return "Estimated: 15–30 minutes after confirmation";
    case "preparing":
      return "Estimated: 20–35 minutes";
    case "delivering":
      return "Estimated: 10–20 minutes away";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return "Estimated delivery time unavailable";
  }
}

export function formatOrderNumber(value) {
  return typeof value === "string" ? value.slice(0, 8) : "Order";
}

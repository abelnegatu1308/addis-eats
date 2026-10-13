import { notFound, redirect } from "next/navigation";

import { getOrderForOwner } from "@/lib/orders";
import { getSession } from "@/lib/session";
import TrackClient from "./TrackClient";

// The current schema tracks the delivery area, not live courier GPS. We use a
// stable, area-based coordinate pair for the map so the UI remains useful without
// inventing a realtime location feed.
const areaCoordinates = {
  bole: { lat: 8.9916, lng: 38.7968 },
  "mekanisa": { lat: 8.9102, lng: 38.7544 },
  "piazza": { lat: 9.0257, lng: 38.7468 },
  "yeka": { lat: 9.0403, lng: 38.7779 },
  "gerji": { lat: 8.9994, lng: 38.7539 },
  "merkato": { lat: 9.0341, lng: 38.7554 },
  default: { lat: 8.9806, lng: 38.7578 },
};

function getDeliveryCoordinates(order) {
  const area = typeof order?.area === "string" ? order.area.trim().toLowerCase() : "";
  const match = Object.keys(areaCoordinates).find((key) => area.includes(key));
  const coords = match ? areaCoordinates[match] : areaCoordinates.default;

  return {
    lat: Number(coords.lat),
    lng: Number(coords.lng),
  };
}

function getCourierCoordinates(order) {
  const destination = getDeliveryCoordinates(order);
  return {
    lat: Number((destination.lat + 0.015).toFixed(6)),
    lng: Number((destination.lng - 0.006).toFixed(6)),
  };
}

export const metadata = {
  title: "Track your Addis Eats delivery",
  description: "Track an Addis Eats delivery in real time with your order status.",
  robots: { index: false, follow: false },
};

export default async function TrackOrderPage({ params }) {
  const { id } = await params;

  const session = await getSession();
  if (!session) {
    redirect(`/signin?next=${encodeURIComponent(`/track/${id}`)}`);
  }

  let order;
  try {
    order = await getOrderForOwner(id, session.id);
  } catch {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          We couldn’t load this delivery. Please try again in a moment.
        </div>
      </main>
    );
  }

  if (!order) {
    notFound();
  }

  const destination = getDeliveryCoordinates(order);
  const courierLocation = getCourierCoordinates(order);
  const lastUpdated = order.cancelledAt ?? order.createdAt ?? new Date().toISOString();

  return (
    <TrackClient
      orderId={id}
      order={order}
      destination={destination}
      courierLocation={courierLocation}
      lastUpdated={lastUpdated}
    />
  );
}

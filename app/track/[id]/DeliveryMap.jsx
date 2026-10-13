"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function isValidCoordinates(value) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const lat = Number(value.lat);
  const lng = Number(value.lng);

  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function buildMarker(lat, lng, color, label) {
  return L.circleMarker([lat, lng], {
    radius: 11,
    color,
    fillColor: color,
    fillOpacity: 0.9,
    weight: 2,
  }).bindPopup(label);
}

export default function DeliveryMap({ courierLocation, destination }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const [hasMap, setHasMap] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !isValidCoordinates(destination)) {
      return undefined;
    }

    const map = L.map(containerRef.current, {
      scrollWheelZoom: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const courierPoint = isValidCoordinates(courierLocation) ? courierLocation : { lat: destination.lat + 0.01, lng: destination.lng + 0.01 };
    const destinationPoint = destination;

    const courierMarker = buildMarker(courierPoint.lat, courierPoint.lng, "#f97316", "Courier");
    const destinationMarker = buildMarker(destinationPoint.lat, destinationPoint.lng, "#16a34a", "Delivery destination");

    courierMarker.addTo(map);
    destinationMarker.addTo(map);

    const bounds = L.latLngBounds([
      [courierPoint.lat, courierPoint.lng],
      [destinationPoint.lat, destinationPoint.lng],
    ]);

    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
    mapRef.current = map;
    setHasMap(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [courierLocation, destination]);

  return (
    <div
      className="overflow-hidden rounded-3xl border"
      style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
    >
      {!hasMap ? (
        <div className="flex items-center justify-center" style={{ minHeight: 420, color: "var(--text-muted)" }}>
          Loading map…
        </div>
      ) : null}
      <div
        ref={containerRef}
        aria-label="Delivery map showing courier and destination"
        role="application"
        style={{ width: "100%", minHeight: 420, height: 420 }}
      />
    </div>
  );
}

import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getDish } from "../data";

export const alt = "Addis Eats Ethiopian dish";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }) {
  const { id } = await params;
  const dish = await getDish(id);
  if (!dish) notFound();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 84px",
          background: "#f5f1e9",
          color: "#20221d",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#9b3825", fontSize: 22, letterSpacing: 5 }}>
            ADDIS EATS · ETHIOPIAN TABLE
          </span>
          <span style={{ color: "#77766d", fontSize: 20 }}>
            {dish.category.toUpperCase()}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 94, lineHeight: 1 }}>{dish.name}</div>
          <div style={{ maxWidth: 970, color: "#57574f", fontSize: 30, lineHeight: 1.35 }}>
            {dish.description}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "2px solid #ddd8cd",
            paddingTop: 24,
            color: "#9b3825",
            fontSize: 24,
          }}
        >
          <span>{dish.price} ETB</span>
          <span>Made for sharing · Addis Ababa</span>
        </div>
      </div>
    ),
    size,
  );
}

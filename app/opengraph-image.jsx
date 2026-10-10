import { ImageResponse } from "next/og";

export const alt = "Addis Eats — a table worth gathering around";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: "#9b3825",
              color: "#fff",
              fontSize: 19,
            }}
          >
            AE
          </div>
          <span style={{ color: "#9b3825", fontSize: 22, letterSpacing: 5 }}>
            ADDIS EATS
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ color: "#9b3825", fontSize: 22, letterSpacing: 5 }}>
            A TASTE OF HOME · ADDIS ABABA
          </div>
          <div style={{ maxWidth: 980, fontSize: 76, lineHeight: 1.08 }}>
            A table worth gathering around.
          </div>
        </div>
        <div style={{ color: "#77766d", fontSize: 22 }}>
          Slow-cooked wot · bright spices · food made for sharing
        </div>
      </div>
    ),
    size,
  );
}

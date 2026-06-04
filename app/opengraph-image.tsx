import { ImageResponse } from "next/og";

import { SITE_DESCRIPTION, SITE_NAME } from "../lib/seo";

export const runtime = "edge";

export const alt = `${SITE_NAME} social preview`;
export const size = {
  width: 1200,
  height: 630,
};
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
          backgroundColor: "#F8FAFC",
          color: "#0F172A",
          fontFamily: "Inter, Arial, sans-serif",
          padding: "64px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              width: "116px",
              height: "116px",
              borderRadius: "28px",
              backgroundColor: "#0F5D46",
              border: "8px solid #0F172A",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingLeft: "26px",
              boxSizing: "border-box",
            }}
          >
            <div style={{ width: "58px", height: "10px", borderRadius: "999px", backgroundColor: "#FFFFFF", marginBottom: "12px" }} />
            <div style={{ width: "44px", height: "10px", borderRadius: "999px", backgroundColor: "#FFFFFF", marginBottom: "12px" }} />
            <div style={{ width: "34px", height: "10px", borderRadius: "999px", backgroundColor: "#FFFFFF" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-0.03em" }}>{SITE_NAME}</div>
            <div style={{ fontSize: "24px", fontWeight: 500, color: "#334155", marginTop: "10px" }}>
              Calm form software for everyday teams.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "860px" }}>
          <div style={{ fontSize: "64px", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.05em" }}>
            Build. Share. Review.
          </div>
          <div style={{ fontSize: "28px", lineHeight: 1.35, color: "#334155" }}>{SITE_DESCRIPTION}</div>
        </div>

        <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
          {["Marketing", "Templates", "Documentation", "Blog"].map((label) => (
            <div
              key={label}
              style={{
                borderRadius: "18px",
                border: "8px solid #0F172A",
                backgroundColor: "#FFFFFF",
                padding: "18px 28px",
                fontSize: "26px",
                fontWeight: 700,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}

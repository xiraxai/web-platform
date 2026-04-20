import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "XiraX AI — Soluciones de IA end-to-end";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
          color: "#f5f5f5",
          backgroundImage:
            "radial-gradient(ellipse 60% 40% at 80% 20%, rgba(16,185,129,0.25), transparent)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: "28px",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "#0a0a0a",
              borderRadius: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #10b981",
              color: "#10b981",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            X
          </div>
          <span>
            XiraX<span style={{ color: "#10b981" }}> AI</span>
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "76px",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: "900px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Soluciones de IA</span>
            <span style={{ color: "#a1a1aa" }}>end-to-end,</span>
            <span>entregadas en semanas.</span>
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "#a1a1aa",
              maxWidth: "800px",
            }}
          >
            Analizamos, diseñamos, construimos. Sin agencias intermedias.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "20px",
            color: "#71717a",
            borderTop: "1px solid #27272a",
            paddingTop: "24px",
          }}
        >
          <span>xiraxai.com</span>
          <span>contacto@xiraxai.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

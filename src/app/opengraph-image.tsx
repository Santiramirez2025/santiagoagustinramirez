import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Santiago Ramírez · Desarrollo de apps, coaching y marketing digital";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px 100px",
          background: "linear-gradient(135deg, #050507 0%, #0a0a1a 50%, #050507 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, transparent, #7C3AED, #A78BFA, transparent)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 800,
              color: "white",
            }}
          >
            SR
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: "white" }}>
              Santiago Ramírez
            </span>
            <span style={{ fontSize: 14, color: "#A78BFA", fontWeight: 500 }}>
              Dev · Coach · Marketing
            </span>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "white",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            maxWidth: 800,
          }}
        >
          Tu negocio necesita{" "}
          <span style={{ color: "#A78BFA" }}>un sistema que trabaje por vos</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 22,
            color: "#71717A",
            marginTop: 24,
            lineHeight: 1.5,
            maxWidth: 600,
          }}
        >
          Apps · E-commerce · Marketplaces · Sistemas a medida
        </div>

        {/* Bottom stats */}
        <div
          style={{
            display: "flex",
            gap: 48,
            marginTop: 48,
            paddingTop: 32,
            borderTop: "1px solid rgba(124,58,237,0.2)",
          }}
        >
          {[
            { value: "15 días", label: "Entrega" },
            { value: "48hs", label: "Demo gratis" },
            { value: "USD 900+", label: "Desde" },
          ].map((stat) => (
            <div key={stat.label} style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: "white" }}>
                {stat.value}
              </span>
              <span style={{ fontSize: 14, color: "#52525B", fontWeight: 500 }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 80,
            fontSize: 16,
            color: "#3F3F46",
            fontWeight: 500,
          }}
        >
          santiagoagustinramirez.com
        </div>
      </div>
    ),
    { ...size }
  );
}

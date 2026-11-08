import { ImageResponse } from "next/og";

export const alt = "George Ngugi — Software Engineer, Mobile Developer & Creative Designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0A0B0A", color: "#F6F5F1", padding: 72 }}>
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, color: "#B4FF39" }}>KOSHE.EXE — NAIROBI, KENYA</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 108, lineHeight: 1, fontWeight: 700, letterSpacing: -4 }}>George Ngugi</div>
          <div style={{ marginTop: 24, fontSize: 38, color: "#8B8F8A" }}>I design. I build. I bring digital ideas to life.</div>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 24, letterSpacing: 3, color: "#F6F5F1" }}>
          <span>SOFTWARE ENGINEERING</span><span style={{ color: "#B4FF39" }}>/</span><span>MOBILE</span><span style={{ color: "#B4FF39" }}>/</span><span>CREATIVE DESIGN</span>
        </div>
      </div>
    ),
    size
  );
}

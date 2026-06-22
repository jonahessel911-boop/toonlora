import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #5340FF 0%, #2A114B 100%)",
          borderRadius: 36,
        }}
      >
        <span style={{ fontSize: 96, color: "white" }}>✦</span>
      </div>
    ),
    { ...size }
  );
}

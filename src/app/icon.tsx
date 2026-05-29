import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d9488",
          borderRadius: 7,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 4 28 13.2V26a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V13.2L16 4Z"
            fill="white"
            fillOpacity="0.2"
            stroke="white"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path
            d="m11.5 17.2 3.2 3.2 6-6.4"
            stroke="white"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}

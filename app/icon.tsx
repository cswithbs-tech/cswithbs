import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d0d0d", // Match site background
        borderRadius: "20%", // Soft square for favicon
        color: "#ffffff",
      }}
    >
      <svg
        width="350"
        height="350"
        viewBox="0 0 24 24"
        fill="#ebaf9fff"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z" />
      </svg>
    </div>,
    // ImageResponse options
    {
      ...size,
    },
  );
}

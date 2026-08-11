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
    (
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
          width="300"
          height="300"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <text 
            x="50" 
            y="65" 
            fontSize="42" 
            fontWeight="bold" 
            fill="#00ff9d" 
            fontFamily="monospace" 
            textAnchor="middle"
          >
            &lt;CS/&gt;
          </text>
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}

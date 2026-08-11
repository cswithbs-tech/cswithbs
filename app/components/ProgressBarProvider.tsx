"use client";

import NextTopLoader from "nextjs-toploader";

export default function ProgressBarProvider() {
  return (
    <NextTopLoader
      height={3}
      color="#e2bdacff" // Matching the accent color
      showSpinner={false}
      shadow="0 0 10px #00FF9D,0 0 5px #00FF9D"
    />
  );
}

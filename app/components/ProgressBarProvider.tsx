"use client";

import NextTopLoader from "nextjs-toploader";

export default function ProgressBarProvider() {
  return (
    <NextTopLoader
      height={3}
      color="#E2C6B9"
      showSpinner={false}
      shadow="0 0 10px #E2C6B9,0 0 5px #E2C6B9"
    />
  );
}

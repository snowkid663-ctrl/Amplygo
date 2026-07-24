"use client";

import { useState } from "react";

/**
 * AmplyGo brand logo. Renders /logo.png if it exists in /public, otherwise
 * falls back to the "AmplyGo" wordmark. Drop your logo at public/logo.png
 * (any web image works if you keep that filename) and it appears everywhere.
 */
export default function BrandLogo({ height = 24 }: { height?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span style={{ fontSize: 18, fontWeight: 700, color: "white", letterSpacing: "-0.01em" }}>AmplyGo</span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="AmplyGo"
      style={{ height, width: "auto", display: "block", maxWidth: "100%" }}
      onError={() => setFailed(true)}
    />
  );
}

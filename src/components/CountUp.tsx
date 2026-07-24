"use client";

import { useEffect, useState } from "react";

/** Animates a number from 0 up to `to` on mount (respects reduced motion). */
export default function CountUp({
  to,
  duration = 1500,
  format,
  prefix = "",
  suffix = "",
}: {
  to: number;
  duration?: number;
  format?: (n: number) => string;
  prefix?: string;
  suffix?: string;
}) {
  const [val, setVal] = useState(0);
  const fmt = format ?? ((n: number) => Math.round(n).toLocaleString("en-US"));

  useEffect(() => {
    const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVal(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);

  return (
    <span suppressHydrationWarning>
      {prefix}
      {fmt(val)}
      {suffix}
    </span>
  );
}

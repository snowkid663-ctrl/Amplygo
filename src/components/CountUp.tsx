"use client";

import { useEffect, useRef, useState } from "react";
import { formatCents } from "@/lib/money";
import type { Currency } from "@/lib/types";

/** Animates a number from 0 up to `to`, on mount or when scrolled into view. */
export default function CountUp({
  to,
  duration = 1500,
  format,
  decimals,
  currency,
  prefix = "",
  suffix = "",
  startOnView = false,
}: {
  to: number;
  duration?: number;
  format?: (n: number) => string;
  decimals?: number;
  currency?: Currency;
  prefix?: string;
  suffix?: string;
  startOnView?: boolean;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const fmt =
    format ??
    (currency
      ? (n: number) => formatCents(Math.round(n), currency)
      : typeof decimals === "number"
      ? (n: number) => n.toFixed(decimals)
      : (n: number) => Math.round(n).toLocaleString("en-US"));

  useEffect(() => {
    const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVal(to);
      return;
    }
    let raf = 0;
    const run = () => {
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(to * eased);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (!startOnView || typeof IntersectionObserver === "undefined") {
      run();
      return () => cancelAnimationFrame(raf);
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration, startOnView]);

  return (
    <span ref={ref} suppressHydrationWarning>
      {prefix}
      {fmt(val)}
      {suffix}
    </span>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Lightweight top progress bar (NProgress-style). Gives instant feedback the
 * moment an internal link is clicked, so navigation never feels frozen while
 * the server renders the next route. No dependencies.
 */
export default function NavProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Route (or query) actually changed → finish and hide.
  useEffect(() => {
    clearTimers();
    setWidth(100);
    const t = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 220);
    timers.current.push(t);
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Start the bar as soon as an internal link is clicked.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      const target = a.getAttribute("target");
      if (!href || !href.startsWith("/") || target === "_blank") return;
      if (href === pathname || href.startsWith(pathname + "?")) return;

      clearTimers();
      setVisible(true);
      setWidth(12);
      // Creep toward ~85% while the next route renders.
      timers.current.push(setTimeout(() => setWidth(40), 120));
      timers.current.push(setTimeout(() => setWidth(66), 340));
      timers.current.push(setTimeout(() => setWidth(85), 800));
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: 2.5,
        width: `${width}%`,
        background: "linear-gradient(90deg, var(--accent-1), var(--accent-2))",
        boxShadow: "0 0 10px 1px oklch(72% 0.2 165 / 0.6)",
        opacity: visible ? 1 : 0,
        transition: "width .3s ease, opacity .25s ease",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
}

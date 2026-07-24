"use client";

import { useEffect } from "react";

/**
 * Global pointer tracker: for any `.spot-card` under the cursor, writes the
 * local mouse position into CSS vars (--mx/--my) so a radial glow can follow.
 * One passive listener for the whole page.
 */
export default function CardSpotlight() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest?.(".spot-card") as HTMLElement | null;
      if (!target) return;
      const r = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${e.clientX - r.left}px`);
      target.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}

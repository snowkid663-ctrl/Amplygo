"use client";

import { useEffect, useRef } from "react";

/**
 * Cinematic network field — a near-black sky where a few nodes glow like stars.
 * Depth via z (far = dim/small, near = bright + glow), faint organic curved
 * links, and a cursor that makes nearby nodes "ignite" then fade slowly, like
 * information travelling through the network. Pure canvas. Reduced-motion aware.
 */
export default function NetworkBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const g = cvs.getContext("2d");
    if (!g) return;

    const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;

    type Node = { x: number; y: number; vx: number; vy: number; z: number; energy: number };
    let nodes: Node[] = [];
    const mouse = { x: -9999, y: -9999 };
    const LINK = 170;
    const MINT = "180, 255, 214"; // near-white mint

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cvs!.clientWidth;
      h = cvs!.clientHeight;
      cvs!.width = Math.floor(w * dpr);
      cvs!.height = Math.floor(h * dpr);
      g!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(64, Math.round((w * h) / 30000)); // few stars, not a mesh
      nodes = Array.from({ length: count }, () => {
        const z = Math.random(); // depth 0 (far) .. 1 (near)
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * (0.06 + z * 0.14),
          vy: (Math.random() - 0.5) * (0.06 + z * 0.14),
          z,
          energy: 0,
        };
      });
    }

    function frame() {
      g!.clearRect(0, 0, w, h);
      g!.lineCap = "round";

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -30) n.x = w + 30;
        if (n.x > w + 30) n.x = -30;
        if (n.y < -30) n.y = h + 30;
        if (n.y > h + 30) n.y = -30;
        // cursor ignites nearby nodes; energy then decays for a slow fade
        const md = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        if (md < 210) n.energy = Math.max(n.energy, 1 - md / 210);
        n.energy *= 0.94;
      }

      // faint, organic (curved) links — only between nearer-plane nodes
      g!.shadowBlur = 0;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d >= LINK) continue;
          const boost = Math.max(a.energy, b.energy);
          const base = (1 - d / LINK) * 0.05 * ((a.z + b.z) / 2);
          const o = base + boost * 0.35;
          if (o < 0.015) continue;
          const mx = (a.x + b.x) / 2 + (dy / d) * d * 0.12;
          const my = (a.y + b.y) / 2 - (dx / d) * d * 0.12;
          g!.strokeStyle = `rgba(${MINT}, ${o})`;
          g!.lineWidth = 0.6 + boost * 0.8;
          g!.beginPath();
          g!.moveTo(a.x, a.y);
          g!.quadraticCurveTo(mx, my, b.x, b.y);
          g!.stroke();
        }
      }

      // nodes as stars
      for (const n of nodes) {
        const r = 0.5 + n.z * 1.7 + n.energy * 1.4;
        const coreA = 0.18 + n.z * 0.4 + n.energy * 0.55;
        const glow = (n.z > 0.66 ? 6 + n.z * 10 : 0) + n.energy * 26;
        g!.shadowBlur = glow;
        g!.shadowColor = `rgba(${MINT}, ${Math.min(0.9, 0.4 + n.energy)})`;
        g!.fillStyle = `rgba(255, 255, 255, ${Math.min(1, coreA)})`;
        g!.beginPath();
        g!.arc(n.x, n.y, r, 0, Math.PI * 2);
        g!.fill();
      }
      g!.shadowBlur = 0;
    }

    let raf = 0;
    const loop = () => {
      frame();
      raf = requestAnimationFrame(loop);
    };

    build();
    if (reduce) frame();
    else loop();

    const onResize = () => build();
    const onMove = (e: PointerEvent) => {
      const rect = cvs!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
    };
  }, []);

  return (
    <div className="network-bg" aria-hidden="true">
      <canvas ref={ref} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}

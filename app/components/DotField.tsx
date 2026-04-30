"use client";

import { useEffect, useRef } from "react";

type Dot = {
  x: number;
  y: number;
  baseAlpha: number;
  phase: number;
  speed: number;
};

const DOT_COUNT = 70;
const ACCENT_RGB = "16, 185, 129";

export function DotField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let dots: Dot[] = [];
    let raf: number | null = null;
    let running = !reduced;

    const seedDots = () => {
      dots = Array.from({ length: DOT_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        baseAlpha: 0.15 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.8,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedDots();
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      for (const d of dots) {
        ctx.fillStyle = `rgba(${ACCENT_RGB}, ${d.baseAlpha})`;
        ctx.fillRect(d.x, d.y, 1.5, 1.5);
      }
    };

    const drawAnimated = (t: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      const time = t / 1000;
      for (const d of dots) {
        const pulse = 0.5 + 0.5 * Math.sin(d.phase + time * d.speed);
        const alpha = d.baseAlpha * (0.35 + pulse * 0.65);
        ctx.fillStyle = `rgba(${ACCENT_RGB}, ${alpha})`;
        ctx.fillRect(d.x, d.y, 1.5, 1.5);
      }
      raf = requestAnimationFrame(drawAnimated);
    };

    resize();
    if (reduced) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(drawAnimated);
    }

    const onResize = () => {
      resize();
      if (reduced) drawStatic();
    };
    const onVisibility = () => {
      const visible = document.visibilityState === "visible";
      if (visible && !running && !reduced) {
        running = true;
        raf = requestAnimationFrame(drawAnimated);
      } else if (!visible && running) {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = null;
      }
    };

    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
}

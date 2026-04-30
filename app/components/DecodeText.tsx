"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*<>/\\";
const TICK_MS = 35;
const REVEAL_DELAY_MS = 22;

type Props = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "span";
};

export function DecodeText({ text, className, as: Tag = "h1" }: Props) {
  const [display, setDisplay] = useState(text);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const chars = text.split("");
    const revealed = chars.map((c) => c === " " || c === "\n");
    let interval: ReturnType<typeof setInterval> | null = null;
    let revealTimer: ReturnType<typeof setInterval> | null = null;
    let revealIndex = 0;

    const render = () => {
      const out = chars
        .map((c, i) =>
          revealed[i]
            ? c
            : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        )
        .join("");
      setDisplay(out);
    };

    const cleanup = () => {
      if (interval) clearInterval(interval);
      if (revealTimer) clearInterval(revealTimer);
    };

    requestAnimationFrame(() => {
      render();
      interval = setInterval(render, TICK_MS);
      revealTimer = setInterval(() => {
        while (revealIndex < chars.length && revealed[revealIndex]) {
          revealIndex++;
        }
        if (revealIndex >= chars.length) {
          cleanup();
          setDisplay(text);
          return;
        }
        revealed[revealIndex] = true;
        revealIndex++;
      }, REVEAL_DELAY_MS);
    });

    return cleanup;
  }, [text]);

  const decoding = display !== text;

  return (
    <Tag
      className={className}
      aria-label={text}
      data-decoding={decoding || undefined}
    >
      <span aria-hidden="true">{display}</span>
    </Tag>
  );
}

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * An original, geometric hacker skull-mask rendered as inline SVG.
 * Inspired by glitch/anonymous hacker aesthetics — not a reproduction of any
 * trademarked emblem. Animated with flicker, RGB-split glitch, a scan sweep and
 * a slow breathe. All motion collapses under prefers-reduced-motion.
 */

// The skull is drawn once and reused for the RGB-split glitch layers.
function SkullPaths() {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {/* cranium + jaw silhouette */}
      <path d="M60 96 C60 46 100 24 150 24 C200 24 240 46 240 96 C240 130 224 150 214 164 L214 196 C214 210 202 220 188 220 L182 220 L176 236 L150 244 L124 236 L118 220 L112 220 C98 220 86 210 86 196 L86 164 C76 150 60 130 60 96 Z" />
      {/* left eye socket (angular, techy) */}
      <path d="M96 108 L132 100 L138 122 L128 150 L104 150 L92 128 Z" fill="currentColor" fillOpacity={0.16} />
      {/* right eye socket */}
      <path d="M204 108 L168 100 L162 122 L172 150 L196 150 L208 128 Z" fill="currentColor" fillOpacity={0.16} />
      {/* pupils */}
      <rect x="108" y="120" width="14" height="14" fill="currentColor" />
      <rect x="178" y="120" width="14" height="14" fill="currentColor" />
      {/* nasal cavity */}
      <path d="M150 150 L140 176 L150 184 L160 176 Z" fill="currentColor" fillOpacity={0.2} />
      {/* teeth grid */}
      <g strokeWidth={1.8}>
        <line x1="120" y1="198" x2="180" y2="198" />
        <line x1="128" y1="198" x2="128" y2="220" />
        <line x1="140" y1="198" x2="140" y2="222" />
        <line x1="150" y1="198" x2="150" y2="224" />
        <line x1="160" y1="198" x2="160" y2="222" />
        <line x1="172" y1="198" x2="172" y2="220" />
      </g>
      {/* circuit traces across the brow — the "digital" signature */}
      <g strokeWidth={1.4} strokeOpacity={0.7}>
        <path d="M60 84 L96 84 L104 74" />
        <path d="M240 84 L204 84 L196 74" />
        <path d="M150 24 L150 42 M138 34 L162 34" />
        <circle cx="104" cy="74" r="2.4" fill="currentColor" />
        <circle cx="196" cy="74" r="2.4" fill="currentColor" />
      </g>
    </g>
  );
}

export function GlitchMask({ className }: { className?: string }) {
  // Occasional heavier glitch burst, purely decorative.
  const [burst, setBurst] = useState(false);
  useEffect(() => {
    let alive = true;
    const loop = () => {
      const wait = 2600 + Math.random() * 4200;
      window.setTimeout(() => {
        if (!alive) return;
        setBurst(true);
        window.setTimeout(() => alive && setBurst(false), 180);
        loop();
      }, wait);
    };
    loop();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className={cn("relative select-none", className)} aria-hidden="true">
      <div className="mask-breathe">
        <div className="relative mask-flicker">
          {/* RGB split layers */}
          <svg viewBox="0 0 300 260" className={cn("absolute inset-0 glitch-layer glitch-r", burst && "opacity-90")}>
            <SkullPaths />
          </svg>
          <svg viewBox="0 0 300 260" className={cn("absolute inset-0 glitch-layer glitch-b", burst && "opacity-90")} style={{ animationDelay: "-1.1s" }}>
            <SkullPaths />
          </svg>
          {/* main phosphor layer */}
          <svg viewBox="0 0 300 260" className="relative block w-full text-phosphor">
            <SkullPaths />
          </svg>
          {/* scan sweep */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="mask-scan h-6 w-full bg-gradient-to-b from-transparent via-phosphor/25 to-transparent" />
          </div>
        </div>
      </div>
      {/* faint reflection */}
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-full bg-phosphor/5 blur-2xl" />
    </div>
  );
}

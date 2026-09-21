"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/*
 * Full-bleed ASCII scene behind the hero.
 *  - Background: a wall of hex bytes (process memory) whose brightness drifts,
 *    with the occasional random bit flip.
 *  - Foreground: an ASCII hacker skull-mask, drawn straight into the character
 *    grid with the donut.c luminance ramp. It wobbles, flickers, gets swept by a
 *    scanline and torn by periodic glitch bursts. Eyes, nose and teeth are cut
 *    out so the dark memory shows through them.
 *  - Pointer: moving over the field overwrites nearby bytes with 0x41 ("A"),
 *    the classic overflow payload, shown in amber until it settles.
 * Rows are drawn as whole strings per brightness bucket. Pauses off-screen and
 * in hidden tabs, and draws a single still frame under reduced motion.
 */

const LUMINANCE = ".,-~:;=!*#$@";
const HEX = "0123456789abcdef";
const LUM_CODES = Array.from(LUMINANCE, (c) => c.charCodeAt(0));
const HEX_CODES = Array.from(HEX, (c) => c.charCodeAt(0));

const BONE = "182,242,196"; // phosphor-tinted bone, matches the green palette
const AMBER = "255,176,0";
// Buckets: 0-2 memory by brightness, 3-6 mask by luminance, 7-8 overwritten bytes.
const STYLES = [
  `rgba(${BONE},0.07)`,
  `rgba(${BONE},0.13)`,
  `rgba(${BONE},0.22)`,
  `rgba(${BONE},0.40)`,
  `rgba(${BONE},0.62)`,
  `rgba(${BONE},0.85)`,
  `rgba(${BONE},1)`,
  `rgba(${AMBER},1)`,
  `rgba(${AMBER},0.5)`,
];
const BUCKETS = STYLES.length;

const INTRO_MS = 1400;
const OVERWRITE_MS = 1400;
const FRAME_MS = 33;
const STILL_T = 2600;

type AsciiFieldProps = {
  className?: string;
  onFrame?: (frame: number) => void;
};

// A small pseudo-random hash, stable per integer.
function hash(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

export function AsciiField({ className, onFrame }: AsciiFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onFrameRef = useRef(onFrame);

  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let cellW = 8;
    let cellH = 16;
    let bytesPerRow = 0;
    let bytes = new Uint8Array(0);
    let level = new Uint8Array(0);
    let hit = new Float32Array(0);
    let lum = new Int8Array(0);
    let reveal = new Float32Array(0);
    let codes: Uint16Array[] = [];
    const used = new Uint8Array(BUCKETS);
    let raf = 0;
    let last = 0;
    let frame = 0;
    let inView = true;
    let disposed = false;

    // Glitch-burst state.
    let glitchUntil = 0;
    let glitchNext = 900;
    let glitchRow0 = 0;
    let glitchRow1 = 0;
    let glitchOff = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const fontSize = width < 640 ? 10 : width < 1024 ? 11 : 13;
      ctx.font = `${fontSize}px ${getComputedStyle(canvas).fontFamily}`;
      ctx.textBaseline = "top";
      cellW = ctx.measureText("0").width || fontSize * 0.6;
      cellH = Math.round(fontSize * 1.3);
      cols = Math.ceil(width / cellW);
      rows = Math.ceil(height / cellH);
      bytesPerRow = Math.ceil(cols / 3);

      const cells = cols * rows;
      const nBytes = bytesPerRow * rows;
      bytes = new Uint8Array(nBytes);
      for (let i = 0; i < nBytes; i++) bytes[i] = (Math.random() * 256) | 0;
      level = new Uint8Array(nBytes);
      hit = new Float32Array(nBytes).fill(-1e9);
      lum = new Int8Array(cells);
      reveal = new Float32Array(cells);
      for (let i = 0; i < cells; i++) reveal[i] = hash(i);
      codes = Array.from({ length: BUCKETS }, () => new Uint16Array(cols));
    };

    // Fill lum[] with the skull-mask luminance (0..11), -1 elsewhere.
    const stampMask = (t: number) => {
      lum.fill(-1);
      const ts = t * 0.001;
      const wide = width >= 1024;

      const halfH = Math.min(height * 0.4, wide ? width * 0.3 : width * 0.62);
      const halfW = halfH * 0.82;
      const mx = wide ? width * 0.31 : width * 0.5;
      const my = wide ? height * 0.52 : height * 0.34;

      // wobble + breathe make it feel alive without a full spin
      const ang = 0.06 * Math.sin(ts * 0.7);
      const cA = Math.cos(ang);
      const sA = Math.sin(ang);
      const br = 1 + 0.025 * Math.sin(ts * 1.1);
      const lx = Math.cos(ts * 0.6);
      const ly = 0.35 + 0.5 * Math.sin(ts * 0.6);
      const sv = 1 - 2 * ((ts * 0.18) % 1); // scanline height in [-1,1]
      const glitching = t < glitchUntil;

      const cMin = Math.max(0, Math.floor((mx - halfW) / cellW));
      const cMax = Math.min(cols - 1, Math.ceil((mx + halfW) / cellW));
      const rMin = Math.max(0, Math.floor((my - halfH) / cellH));
      const rMax = Math.min(rows - 1, Math.ceil((my + halfH) / cellH));

      for (let r = rMin; r <= rMax; r++) {
        const cy = r * cellH + cellH * 0.5;
        const rowOff = glitching && r >= glitchRow0 && r <= glitchRow1 ? glitchOff : 0;
        const flick = 0.88 + 0.12 * Math.sin(ts * 11 + r * 0.7);
        for (let c = cMin; c <= cMax; c++) {
          const cx = c * cellW + cellW * 0.5;
          let u = (cx - mx) / halfW + rowOff;
          let v = -(cy - my) / halfH;
          // rotate then breathe
          const ru = (u * cA + v * sA) / br;
          const rv = (-u * sA + v * cA) / br;
          u = ru;
          v = rv;

          const he = (u / 0.86) ** 2 + ((v - 0.16) / 0.74) ** 2;
          const je = (u / 0.62) ** 2 + ((v + 0.52) / 0.52) ** 2;
          const inHead = he <= 1;
          const inJaw = je <= 1;
          if (!inHead && !inJaw) continue;
          const d = Math.min(inHead ? 1 - he : 9, inJaw ? 1 - je : 9); // ~0 at rim

          // eyes (slanted, hollow)
          const elu = u + 0.34;
          const elv = v - 0.3;
          const eL = ((elu * 0.877 + elv * 0.479) / 0.27) ** 2 + ((-elu * 0.479 + elv * 0.877) / 0.2) ** 2;
          const eru = u - 0.34;
          const erv = v - 0.3;
          const eR = ((eru * 0.877 - erv * 0.479) / 0.27) ** 2 + ((eru * 0.479 + erv * 0.877) / 0.2) ** 2;
          const inEye = eL <= 1 || eR <= 1;

          // nose: triangle pointing up
          const noseW = 0.14 * ((0.14 - v) / 0.32);
          const inNose = v > -0.18 && v < 0.14 && Math.abs(u) < noseW;

          // teeth: gaps between vertical bars + a mid gum line
          let gap = false;
          if (inJaw && v < -0.32 && v > -0.9) {
            const ff = u * 3.0;
            const frac = ff - Math.floor(ff);
            gap = frac < 0.16 || frac > 0.84 || Math.abs(v + 0.58) < 0.028;
          }

          if (inEye || inNose || gap) continue; // hollow features

          const shade = 0.5 + 0.42 * (u * lx * 0.55 + v * ly * 0.55);
          const rim = d < 0.13 ? 0.55 : 0;
          const scan = Math.abs(v - sv) < 0.05 ? 0.6 : 0;
          let L = (shade + rim + scan) * flick;
          if (glitching && r >= glitchRow0 && r <= glitchRow1) L += 0.15;
          if (L < 0) L = 0;
          else if (L > 1) L = 1;
          lum[r * cols + c] = (L * 11) | 0;
        }
      }
    };

    const draw = (now: number) => {
      if (!cols || !rows) return;
      const t = now - start;
      const progress = reduce ? 1 : Math.min(1, t / INTRO_MS);
      const wide = width >= 1024;
      const ts = t * 0.001;

      // schedule glitch bursts
      if (!reduce && t > glitchNext) {
        glitchUntil = t + 90 + Math.random() * 160;
        glitchNext = t + 1800 + Math.random() * 4200;
        glitchRow0 = (rows * Math.random()) | 0;
        glitchRow1 = Math.min(rows - 1, glitchRow0 + 1 + ((Math.random() * 5) | 0));
        glitchOff = (Math.random() - 0.5) * 0.5;
      }

      // Memory brightness: three slow interfering waves.
      for (let r = 0; r < rows; r++) {
        for (let b = 0; b < bytesPerRow; b++) {
          const x = b * 3;
          const val = Math.sin(x * 0.045 + ts * 0.7) + Math.sin(r * 0.21 - ts * 0.5) + Math.sin((x * 0.5 + r) * 0.07 + ts * 0.35);
          level[r * bytesPerRow + b] = val > 1.6 ? 2 : val > 0.6 ? 1 : 0;
        }
      }
      if (!reduce) {
        const flips = Math.max(1, (bytes.length * 0.003) | 0);
        for (let i = 0; i < flips; i++) bytes[(Math.random() * bytes.length) | 0] = (Math.random() * 256) | 0;
      }

      stampMask(t);

      ctx.clearRect(0, 0, width, height);
      const maskAlpha = wide ? 1 : 0.6;
      for (let r = 0; r < rows; r++) {
        used.fill(0);
        for (let b = 0; b < BUCKETS; b++) codes[b].fill(32);
        const rowBase = r * cols;
        for (let c = 0; c < cols; c++) {
          const i = rowBase + c;
          if (reveal[i] > progress) continue;
          const l = lum[i];
          if (l >= 0) {
            const maskBucket = 3 + ((l / 3) | 0);
            codes[maskBucket][c] = LUM_CODES[l];
            used[maskBucket] = 1;
            continue;
          }
          const pos = c % 3;
          if (pos === 2) continue;
          const bi = r * bytesPerRow + ((c / 3) | 0);
          const age = t - hit[bi];
          let bucket: number = level[bi];
          let value = bytes[bi];
          if (age < OVERWRITE_MS) {
            bucket = age < OVERWRITE_MS * 0.45 ? 7 : 8;
            value = 0x41;
          }
          codes[bucket][c] = HEX_CODES[pos === 0 ? value >> 4 : value & 15];
          used[bucket] = 1;
        }
        const y = r * cellH + 2;
        for (let b = 0; b < BUCKETS; b++) {
          if (!used[b]) continue;
          ctx.globalAlpha = b >= 3 && b <= 6 ? maskAlpha : 1;
          ctx.fillStyle = STYLES[b];
          ctx.fillText(String.fromCharCode(...codes[b]), 0, y);
        }
      }
      ctx.globalAlpha = 1;
    };

    const overwrite = (clientX: number, clientY: number) => {
      if (reduce || !cols) return;
      const rect = canvas.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      if (px < 0 || py < 0 || px > rect.width || py > rect.height) return;
      const c0 = px / cellW;
      const r0 = py / cellH;
      const t = performance.now() - start;
      const rMin = Math.max(0, Math.floor(r0 - 2));
      const rMax = Math.min(rows - 1, Math.ceil(r0 + 2));
      const bMin = Math.max(0, Math.floor((c0 - 7) / 3));
      const bMax = Math.min(bytesPerRow - 1, Math.ceil((c0 + 7) / 3));
      for (let r = rMin; r <= rMax; r++) {
        for (let b = bMin; b <= bMax; b++) {
          const dx = (b * 3 + 1 - c0) / 7;
          const dy = (r + 0.5 - r0) / 2.2;
          if (dx * dx + dy * dy > 1) continue;
          const bi = r * bytesPerRow + b;
          hit[bi] = t;
          bytes[bi] = 0x41;
        }
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;
      draw(now);
      frame += 1;
      onFrameRef.current?.(frame);
    };
    const play = () => {
      if (!raf && !reduce && inView && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const pause = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const still = () => {
      if (reduce) draw(start + STILL_T);
    };

    const onPointer = (e: PointerEvent) => overwrite(e.clientX, e.clientY);
    const onVisibility = () => (document.hidden ? pause() : play());

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      still();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) play();
      else pause();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.fonts?.ready.then(() => {
      if (disposed) return;
      resize();
      still();
    });

    if (reduce) {
      still();
      onFrameRef.current?.(0);
    } else {
      play();
    }

    return () => {
      disposed = true;
      pause();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={cn("block h-full w-full font-mono", className)} />;
}

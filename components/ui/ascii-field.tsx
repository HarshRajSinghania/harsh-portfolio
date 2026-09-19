"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/*
 * Full-bleed ASCII scene behind the hero.
 *  - Background: a wall of hex bytes (process memory) whose brightness drifts,
 *    with the occasional random bit flip.
 *  - Foreground: a spinning torus lit with the luminance ramp from donut.c.
 *  - Pointer: moving over the field overwrites nearby bytes with 0x41 ("A"),
 *    the classic overflow payload, shown in amber until it settles.
 * Rows are drawn as whole strings per brightness bucket (a few hundred fillText
 * calls per frame instead of thousands). Pauses off-screen and in hidden tabs,
 * and draws a single still frame when the visitor prefers reduced motion.
 */

const LUMINANCE = ".,-~:;=!*#$@";
const HEX = "0123456789abcdef";
const LUM_CODES = Array.from(LUMINANCE, (c) => c.charCodeAt(0));
const HEX_CODES = Array.from(HEX, (c) => c.charCodeAt(0));

const BONE = "236,233,226";
const AMBER = "255,176,0";
// Buckets: 0-2 memory by brightness, 3-6 torus by luminance, 7-8 overwritten bytes.
const STYLES = [
  `rgba(${BONE},0.07)`,
  `rgba(${BONE},0.13)`,
  `rgba(${BONE},0.22)`,
  `rgba(${BONE},0.34)`,
  `rgba(${BONE},0.55)`,
  `rgba(${BONE},0.78)`,
  `rgba(${BONE},1)`,
  `rgba(${AMBER},1)`,
  `rgba(${AMBER},0.5)`,
];
const BUCKETS = STYLES.length;

const R1 = 1;
const R2 = 2;
const K2 = 5;
const THETA_STEPS = 96;
const PHI_STEPS = 300;
const COS_T = new Float32Array(THETA_STEPS);
const SIN_T = new Float32Array(THETA_STEPS);
const COS_P = new Float32Array(PHI_STEPS);
const SIN_P = new Float32Array(PHI_STEPS);
for (let i = 0; i < THETA_STEPS; i++) {
  const a = (i / THETA_STEPS) * Math.PI * 2;
  COS_T[i] = Math.cos(a);
  SIN_T[i] = Math.sin(a);
}
for (let j = 0; j < PHI_STEPS; j++) {
  const a = (j / PHI_STEPS) * Math.PI * 2;
  COS_P[j] = Math.cos(a);
  SIN_P[j] = Math.sin(a);
}

const INTRO_MS = 1400;
const OVERWRITE_MS = 1400;
const FRAME_MS = 33;
const STILL_T = 2600;

type AsciiFieldProps = {
  className?: string;
  onFrame?: (frame: number) => void;
};

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
    let zbuf = new Float32Array(0);
    let lum = new Int8Array(0);
    let reveal = new Float32Array(0);
    let codes: Uint16Array[] = [];
    const used = new Uint8Array(BUCKETS);
    let raf = 0;
    let last = 0;
    let frame = 0;
    let inView = true;
    let disposed = false;

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
      zbuf = new Float32Array(cells);
      lum = new Int8Array(cells);
      reveal = new Float32Array(cells);
      for (let i = 0; i < cells; i++) {
        const s = Math.sin(i * 12.9898) * 43758.5453;
        reveal[i] = s - Math.floor(s);
      }
      codes = Array.from({ length: BUCKETS }, () => new Uint16Array(cols));
    };

    const draw = (now: number) => {
      if (!cols || !rows) return;
      const t = now - start;
      const progress = reduce ? 1 : Math.min(1, t / INTRO_MS);
      const wide = width >= 1024;
      const ts = t * 0.001;

      // Memory brightness: three slow interfering waves.
      for (let r = 0; r < rows; r++) {
        for (let b = 0; b < bytesPerRow; b++) {
          const x = b * 3;
          const v = Math.sin(x * 0.045 + ts * 0.7) + Math.sin(r * 0.21 - ts * 0.5) + Math.sin((x * 0.5 + r) * 0.07 + ts * 0.35);
          level[r * bytesPerRow + b] = v > 1.6 ? 2 : v > 0.6 ? 1 : 0;
        }
      }
      if (!reduce) {
        const flips = Math.max(1, (bytes.length * 0.003) | 0);
        for (let i = 0; i < flips; i++) bytes[(Math.random() * bytes.length) | 0] = (Math.random() * 256) | 0;
      }

      // Torus, after donut.c: rotate, project, keep the nearest point per cell.
      zbuf.fill(0);
      lum.fill(-1);
      const A = 1 + t * 0.00045;
      const B = 0.4 + t * 0.00022;
      const cA = Math.cos(A);
      const sA = Math.sin(A);
      const cB = Math.cos(B);
      const sB = Math.sin(B);
      const aspect = cellW / cellH;
      const ox = wide ? cols * 0.28 : cols * 0.5;
      const oy = wide ? rows * 0.5 : rows * 0.3;
      const diameter = Math.min(wide ? cols * 0.44 : cols * 0.86, (wide ? rows * 0.76 : rows * 0.42) / aspect);
      const k1x = (diameter * 0.92 * K2) / (2 * (R1 + R2));
      const k1y = k1x * aspect;

      for (let i = 0; i < THETA_STEPS; i++) {
        const ct = COS_T[i];
        const st = SIN_T[i];
        const circleX = R2 + R1 * ct;
        const circleY = R1 * st;
        for (let j = 0; j < PHI_STEPS; j++) {
          const cp = COS_P[j];
          const sp = SIN_P[j];
          const x = circleX * (cB * cp + sA * sB * sp) - circleY * cA * sB;
          const y = circleX * (sB * cp - sA * cB * sp) + circleY * cA * cB;
          const ooz = 1 / (K2 + cA * circleX * sp + circleY * sA);
          const xp = Math.floor(ox + k1x * ooz * x);
          const yp = Math.floor(oy - k1y * ooz * y);
          if (xp < 0 || xp >= cols || yp < 0 || yp >= rows) continue;
          const idx = yp * cols + xp;
          if (ooz <= zbuf[idx]) continue;
          zbuf[idx] = ooz;
          const L = cp * ct * sB - cA * ct * sp - sA * st + cB * (cA * st - ct * sA * sp);
          lum[idx] = L > 0 ? Math.min(11, (L * 8) | 0) : 0;
        }
      }

      ctx.clearRect(0, 0, width, height);
      const torusAlpha = wide ? 1 : 0.55;
      for (let r = 0; r < rows; r++) {
        used.fill(0);
        for (let b = 0; b < BUCKETS; b++) codes[b].fill(32);
        const rowBase = r * cols;
        for (let c = 0; c < cols; c++) {
          const i = rowBase + c;
          if (reveal[i] > progress) continue;
          const l = lum[i];
          if (l >= 0) {
            const torusBucket = 3 + ((l / 3) | 0);
            codes[torusBucket][c] = LUM_CODES[l];
            used[torusBucket] = 1;
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
          ctx.globalAlpha = b >= 3 && b <= 6 ? torusAlpha : 1;
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
    // Re-measure once the web font is in, so glyph cells line up exactly.
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

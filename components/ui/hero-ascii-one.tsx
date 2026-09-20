"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowDown, Download } from "lucide-react";
import { AsciiField } from "@/components/ui/ascii-field";
import { GlitchMask } from "@/components/ui/glitch-mask";
import { ScrambleText } from "@/components/ui/scramble-text";
import { cves, profile, severityCounts } from "@/lib/data";
import { ditherClass } from "@/lib/severity";
import { cn } from "@/lib/utils";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.35 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] } },
};

const METER = [6, 10, 4, 12, 8, 14, 5, 9];

const buttonClass =
  "group relative inline-flex items-center justify-center gap-2 border border-bone px-5 py-2.5 text-xs text-bone transition-colors duration-200 hover:border-phosphor hover:bg-phosphor hover:text-void lg:px-6 lg:text-sm";

function useIstClock() {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

function CornerTicks() {
  return (
    <>
      <span aria-hidden="true" className="absolute -left-1 -top-1 hidden size-2 border-l border-t border-phosphor opacity-0 transition-opacity group-hover:opacity-100 lg:block" />
      <span aria-hidden="true" className="absolute -bottom-1 -right-1 hidden size-2 border-b border-r border-phosphor opacity-0 transition-opacity group-hover:opacity-100 lg:block" />
    </>
  );
}

export default function HeroAsciiOne() {
  const frameEl = useRef<HTMLSpanElement>(null);
  const clock = useIstClock();
  const onFrame = useCallback((n: number) => {
    if (frameEl.current) frameEl.current.textContent = String(n).padStart(6, "0");
  }, []);

  const severityLabel = `${cves.length} CVEs: ${severityCounts.critical} critical, ${severityCounts.high} high, ${severityCounts.medium} medium`;

  return (
    <section id="top" aria-labelledby="hero-title" className="relative min-h-[100svh] overflow-hidden bg-void pt-14">
      <div className="absolute inset-0">
        <AsciiField onFrame={onFrame} />
      </div>

      {/* Legibility scrims behind the copy */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-[62%] bg-linear-to-l from-void via-void/85 to-transparent lg:block" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-linear-to-t from-void via-void/85 to-transparent lg:hidden" />

      {/* Frame corners */}
      <span aria-hidden="true" className="absolute left-0 top-14 z-20 size-8 border-l-2 border-t-2 border-bone/30 lg:size-12" />
      <span aria-hidden="true" className="absolute right-0 top-14 z-20 size-8 border-r-2 border-t-2 border-bone/30 lg:size-12" />
      <span aria-hidden="true" className="absolute bottom-10 left-0 z-20 size-8 border-b-2 border-l-2 border-bone/30 lg:size-12" />
      <span aria-hidden="true" className="absolute bottom-10 right-0 z-20 size-8 border-b-2 border-r-2 border-bone/30 lg:size-12" />

      <div className="relative z-10 flex min-h-[calc(100svh-3.5rem)] items-end justify-end pb-24 lg:items-center lg:justify-between lg:pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-64 -translate-x-1/2 -translate-y-[58%] opacity-30 sm:w-80 lg:relative lg:left-auto lg:top-auto lg:z-10 lg:w-[38%] lg:max-w-md lg:translate-x-0 lg:translate-y-0 lg:pl-16 lg:opacity-100"
        >
          <GlitchMask />
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="w-full px-6 lg:w-1/2 lg:px-16 lg:pr-[8%]">
          <div className="relative max-w-xl lg:ml-auto">
            <motion.div variants={item} className="mb-4 flex items-center gap-2 text-[11px] text-bone/60">
              <span className="h-px w-8 bg-bone/60" />
              <span>vulnerability researcher</span>
              <span className="h-px flex-1 bg-bone/60" />
            </motion.div>

            <motion.h1
              id="hero-title"
              variants={item}
              className="relative font-display text-[length:clamp(2.9rem,6.5vw,6.5rem)] leading-[0.86] text-bone"
            >
              <span aria-hidden="true" className="dither-half absolute -right-3 bottom-2 top-2 hidden w-1 text-bone/40 lg:block" />
              <ScrambleText text="HARSH RAJ" />
              <br />
              <ScrambleText text="SINGHANIA" />
            </motion.h1>

            {/* One mark per CVE, textured by severity */}
            <motion.div variants={item} className="mt-5 flex items-center gap-1" role="img" aria-label={severityLabel} title={severityLabel}>
              {cves.map((c) => (
                <span key={c.id} className={cn("size-2.5 text-bone", ditherClass[c.severity])} />
              ))}
              <span className="ml-2 text-[10px] text-bone/55">{cves.length} CVEs by severity</span>
            </motion.div>

            <motion.p variants={item} className="mt-5 max-w-[52ch] text-sm leading-relaxed text-bone/75 lg:text-base">
              I hunt memory-corruption and access-control bugs in open-source software, prove them with sanitizers and
              working proofs of concept, and see them through coordinated disclosure. Eleven CVEs so far, three rated
              critical.
            </motion.p>

            <motion.div variants={item} className="mt-7 flex flex-col gap-3 sm:flex-row lg:gap-4">
              <a href="#disclosures" className={buttonClass}>
                <CornerTicks />
                See the {cves.length} CVEs
                <ArrowDown aria-hidden="true" className="size-3.5" />
              </a>
              <a href={profile.cv} download className={buttonClass}>
                <CornerTicks />
                Download CV
                <Download aria-hidden="true" className="size-3.5" />
              </a>
            </motion.div>

            <motion.div variants={item} className="mt-7 hidden items-center gap-2 text-[9px] text-bone/40 lg:flex">
              <span title="0x0B = 11">0x0B</span>
              <span className="h-px flex-1 bg-bone/30" />
              <span>COORDINATED.DISCLOSURE</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Status bar */}
      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-bone/20 bg-void/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[88rem] items-center justify-between px-4 py-2.5 text-[9px] text-bone/50 lg:px-8 lg:text-[10px]">
          <div className="flex items-center gap-3 lg:gap-6">
            <span className="hidden lg:inline">SYSTEM.ACTIVE</span>
            <span className="lg:hidden">SYS.ACT</span>
            <div aria-hidden="true" className="hidden h-3.5 items-end gap-1 lg:flex">
              {METER.map((h, i) => (
                <span key={i} className="meter-bar w-1 bg-bone/30" style={{ height: `${h}px`, animationDelay: `${i * 0.13}s` }} />
              ))}
            </div>
            <span>IST {clock}</span>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <span className="hidden lg:inline">◐ RENDERING</span>
            <div aria-hidden="true" className="flex gap-1">
              <span className="size-1 animate-pulse rounded-full bg-bone/60" />
              <span className="size-1 animate-pulse rounded-full bg-bone/40 [animation-delay:0.2s]" />
              <span className="size-1 animate-pulse rounded-full bg-bone/20 [animation-delay:0.4s]" />
            </div>
            <span>
              FRAME: <span ref={frameEl}>000000</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

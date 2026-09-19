"use client";

import { motion } from "framer-motion";
import type { Severity } from "@/lib/data";
import { ditherClass } from "@/lib/severity";
import { cn } from "@/lib/utils";

// Ten one-point segments filled to the CVSS score, textured by severity.
export function CvssBar({ score, severity, className }: { score: number | null; severity: Severity; className?: string }) {
  const pct = score === null ? 0 : Math.min(100, score * 10);
  return (
    <span aria-hidden="true" className={cn("relative inline-block h-3 w-[72px] shrink-0 bg-bone/[0.08] text-bone", className)}>
      <motion.span
        className={cn("absolute inset-y-0 left-0", ditherClass[severity])}
        initial={{ width: "0%" }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
      />
      <span className="cvss-ticks absolute inset-0" />
    </span>
  );
}

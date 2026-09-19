"use client";

import { motion, type Variants } from "framer-motion";
import { Section } from "@/components/section";
import { ExtLink } from "@/components/ui/ext-link";
import { log } from "@/lib/data";

// The one place lines arrive in sequence, because that is what a log does.
const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const line: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
};

export function Log() {
  return (
    <Section id="log" title="log" meta="newest first">
      <motion.ol
        variants={list}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="border-b border-bone/15"
      >
        {log.map((entry, i) => (
          <motion.li
            key={`${entry.when}-${entry.title}`}
            variants={line}
            className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 gap-y-1 border-t border-bone/15 py-4 md:grid-cols-[6rem_4.5rem_minmax(0,1fr)] md:gap-x-6"
          >
            <span className="flex items-center gap-2 text-xs leading-6 tabular-nums text-bone/55">
              {i === 0 ? (
                <span aria-hidden="true" className="size-1.5 animate-pulse bg-phosphor motion-reduce:animate-none" />
              ) : null}
              {entry.when}
            </span>
            <span className="text-xs leading-6 text-bone/40">[{entry.tag}]</span>
            <div className="col-span-2 md:col-span-1">
              <p className="leading-6 text-bone">
                {entry.title}
                {entry.where ? <span className="text-bone/55"> · {entry.where}</span> : null}
              </p>
              {entry.note ? <p className="mt-1.5 max-w-[68ch] text-sm leading-relaxed text-bone/60">{entry.note}</p> : null}
              {entry.href ? (
                <ExtLink href={entry.href} className="mt-1.5 text-xs">
                  {entry.hrefLabel ?? "Link"}
                </ExtLink>
              ) : null}
            </div>
          </motion.li>
        ))}
      </motion.ol>
    </Section>
  );
}

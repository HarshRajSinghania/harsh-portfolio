"use client";

import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

type SectionProps = {
  id: string;
  title: string;
  meta?: ReactNode;
  children: ReactNode;
};

const ease = [0.2, 0.8, 0.2, 1] as const;

const heading: Variants = {
  hidden: { opacity: 0, x: -18, skewX: 6 },
  show: { opacity: 1, x: 0, skewX: 0, transition: { duration: 0.55, ease } },
};

const metaVar: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, delay: 0.15, ease } },
};

const body: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1, ease } },
};

// Every section heading is the path you'd cd into: ~/disclosures, ~/lab, ...
export function Section({ id, title, meta: metaNode, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-14 border-t border-bone/15">
      <div className="mx-auto max-w-[88rem] px-4 py-20 lg:px-8 lg:py-28">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="mb-10 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2"
        >
          <motion.h2
            variants={heading}
            id={`${id}-title`}
            className="font-display text-5xl leading-none text-bone md:text-6xl"
          >
            <span aria-hidden="true" className="text-phosphor">~/</span>
            {title}
            <span aria-hidden="true" className="ml-1 inline-block w-[0.55ch] animate-pulse text-phosphor motion-reduce:animate-none">_</span>
          </motion.h2>
          {metaNode ? (
            <motion.div variants={metaVar} className="text-xs text-bone/55">
              {metaNode}
            </motion.div>
          ) : null}
        </motion.div>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={body}>
          {children}
        </motion.div>
      </div>
    </section>
  );
}

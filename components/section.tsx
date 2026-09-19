import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  title: string;
  meta?: ReactNode;
  children: ReactNode;
};

// Every section heading is the path you'd cd into: ~/disclosures, ~/lab, ...
export function Section({ id, title, meta, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-14 border-t border-bone/15">
      <div className="mx-auto max-w-[88rem] px-4 py-20 lg:px-8 lg:py-28">
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h2 id={`${id}-title`} className="font-display text-5xl leading-none text-bone md:text-6xl">
            ~/{title}
          </h2>
          {meta ? <div className="text-xs text-bone/55">{meta}</div> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

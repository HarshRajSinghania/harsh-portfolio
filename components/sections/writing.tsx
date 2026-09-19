import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/section";
import { ExtLink } from "@/components/ui/ext-link";
import { articles, profile } from "@/lib/data";

export function Writing() {
  return (
    <Section id="writing" title="writing" meta={<ExtLink href={profile.medium}>All posts on Medium</ExtLink>}>
      <p className="mb-10 max-w-[60ch] leading-relaxed text-bone/70">
        First-person write-ups: how the bugs were found and fixed, what the malware was hiding, and how the labs are built.
      </p>
      <ol className="border-b border-bone/15">
        {articles.map((a, i) => (
          <li key={a.href} className="border-t border-bone/15">
            <a
              href={a.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 py-6 transition-colors hover:bg-bone/[0.03] md:grid-cols-[3.5rem_minmax(0,1fr)_14rem_1.25rem] md:px-2"
            >
              <span aria-hidden="true" className="text-xs tabular-nums text-bone/35">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-2xl leading-tight text-bone transition-colors group-hover:text-phosphor md:text-4xl">
                {a.title}
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 self-center text-bone/40 transition-colors group-hover:text-phosphor md:order-last"
              />
              <span className="col-start-2 text-xs text-bone/50 md:col-start-auto md:text-right">{a.topic}</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ol>
    </Section>
  );
}

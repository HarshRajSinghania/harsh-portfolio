import { Section } from "@/components/section";
import { ExtLink } from "@/components/ui/ext-link";
import { furtherPrs, projects, upstream, type Contribution } from "@/lib/data";
import { cn } from "@/lib/utils";

const statusTone: Record<Contribution["status"], string> = {
  merged: "text-phosphor",
  "in review": "text-bone/70",
  submitted: "text-bone/70",
  credited: "text-bone/70",
};

export function Lab() {
  return (
    <Section id="lab" title="lab" meta={`${projects.length} builds · ${upstream.length} upstream contributions`}>
      <div className="border-b border-bone/15">
        {projects.map((p) => (
          <article key={p.name} className="grid gap-5 border-t border-bone/15 py-10 lg:grid-cols-12 lg:gap-10">
            <header className="lg:col-span-4">
              <h3 className="font-display text-4xl leading-none text-bone">
                <span aria-hidden="true" className="text-bone/35">
                  ./
                </span>
                {p.name}
              </h3>
              <p className="mt-3 text-sm text-bone/55">{p.kind}</p>
            </header>
            <div className="space-y-5 lg:col-span-8">
              <p className="max-w-[64ch] leading-relaxed text-bone/85">{p.summary}</p>
              <p className="text-xs leading-6 text-bone/55">
                <span className="text-bone/35">stack: </span>
                {p.stack.join(" · ")}
              </p>
              {p.href ? <ExtLink href={p.href}>{p.hrefLabel ?? "Open"}</ExtLink> : null}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-20">
        <h3 className="text-sm text-bone">upstream</h3>
        <p className="mb-5 mt-1 text-xs text-bone/45">
          <span aria-hidden="true">$ </span>git log --author=harsh --oneline
        </p>
        <ul className="border-b border-bone/15">
          {upstream.map((c) => (
            <li
              key={c.repo}
              className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 gap-y-1 border-t border-bone/15 py-4 md:grid-cols-[6.5rem_16rem_minmax(0,1fr)]"
            >
              <span className={cn("text-xs leading-6", statusTone[c.status])}>[{c.status}]</span>
              <span className="text-sm leading-6 text-bone">{c.repo}</span>
              <span className="col-start-2 text-sm leading-6 text-bone/65 md:col-start-3">
                {c.note}{" "}
                {c.href ? (
                  <ExtLink href={c.href} className="text-xs">
                    {c.hrefLabel ?? "Link"}
                  </ExtLink>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-bone/50">{furtherPrs}</p>
      </div>
    </Section>
  );
}

"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Section } from "@/components/section";
import { CvssBar } from "@/components/ui/cvss-bar";
import { ExtLink } from "@/components/ui/ext-link";
import { cves, embargoed, severityCounts, type Cve, type Severity } from "@/lib/data";
import { ditherClass } from "@/lib/severity";
import { cn } from "@/lib/utils";

type Filter = "all" | Severity;

const FILTERS: { key: Filter; label: string; count: number }[] = [
  { key: "all", label: "all", count: cves.length },
  { key: "critical", label: "critical", count: severityCounts.critical },
  { key: "high", label: "high", count: severityCounts.high },
  { key: "medium", label: "medium", count: severityCounts.medium },
];

// id | target | kind | score | toggle. On phones the score moves up beside the id.
const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 md:grid-cols-[10.5rem_minmax(0,1fr)_minmax(0,1.3fr)_9.5rem_1rem]";

const ease = [0.2, 0.8, 0.2, 1] as const;

function Swatch({ severity }: { severity: Severity }) {
  return <span aria-hidden="true" className={cn("inline-block size-2.5 shrink-0 text-current", ditherClass[severity])} />;
}

function Score({ cve }: { cve: Cve }) {
  return (
    <span className="flex items-center gap-3 text-bone">
      <CvssBar score={cve.score} severity={cve.severity} />
      <span className="w-7 text-right text-sm tabular-nums">{cve.score ?? "n/a"}</span>
      <span className="hidden text-[11px] text-bone/50 lg:inline">{cve.severity}</span>
      <span className="sr-only">
        {cve.score === null ? `no CVSS score published, rated ${cve.severity}` : `CVSS ${cve.cvss} score ${cve.score}, ${cve.severity}`}
      </span>
    </span>
  );
}

function Row({ cve, open, onToggle }: { cve: Cve; open: boolean; onToggle: () => void }) {
  const panelId = `${cve.id}-detail`;
  return (
    <li className="border-t border-bone/15">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className={cn(ROW_GRID, "group w-full py-4 text-left transition-colors hover:bg-bone/[0.03] md:px-2")}
        >
          <span className={cn("order-1 text-sm tabular-nums transition-colors group-hover:text-phosphor", open ? "text-phosphor" : "text-bone")}>
            {cve.id}
          </span>
          <span className="order-2 md:order-4">
            <Score cve={cve} />
          </span>
          <span className="order-3 col-span-2 text-bone md:order-2 md:col-span-1">{cve.target}</span>
          <span className="order-4 col-span-2 text-sm text-bone/60 md:order-3 md:col-span-1">{cve.kind}</span>
          <Plus
            aria-hidden="true"
            className={cn("order-5 hidden size-4 self-center text-bone/50 transition-transform duration-300 md:block", open && "rotate-45 text-phosphor")}
          />
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            className="overflow-hidden"
          >
            <div className="grid gap-6 pb-8 pt-1 md:grid-cols-[minmax(0,1fr)_18rem] md:pl-[12.5rem] md:pr-8">
              <p className="max-w-[62ch] leading-relaxed text-bone/85">{cve.detail}</p>
              <dl className="grid grid-cols-[5.5rem_1fr] gap-x-4 gap-y-1.5 text-xs">
                <dt className="text-bone/45">weakness</dt>
                <dd className="text-bone">{cve.cwe}</dd>
                <dt className="text-bone/45">cvss</dt>
                <dd className="text-bone">
                  {cve.score === null ? `not published, rated ${cve.severity}` : `v${cve.cvss} · ${cve.score} ${cve.severity}`}
                </dd>
                <dt className="text-bone/45">code</dt>
                <dd className="text-bone">{cve.lang}</dd>
                <dt className="text-bone/45">status</dt>
                <dd className="text-bone">{cve.status}</dd>
                {cve.writeup ? (
                  <>
                    <dt className="text-bone/45">write-up</dt>
                    <dd>
                      <ExtLink href={cve.writeup}>Read on Medium</ExtLink>
                    </dd>
                  </>
                ) : null}
              </dl>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

function EmbargoRow() {
  return (
    <li className="border-t border-bone/15">
      <div className={cn(ROW_GRID, "py-4 md:px-2")}>
        <span className="order-1 text-sm text-bone/60">
          CVE-2026-<span className="redact w-[5ch]" />
          <span className="sr-only">withheld</span>
        </span>
        <span className="order-2 text-sm text-bone/45 md:order-4">embargoed</span>
        <span aria-hidden="true" className="order-3 col-span-2 md:order-2 md:col-span-1">
          <span className="redact w-[14ch]" />
        </span>
        <span className="order-4 col-span-2 text-sm text-bone/60 md:order-3 md:col-span-1">{embargoed}</span>
      </div>
    </li>
  );
}

export function Disclosures() {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<Set<string>>(() => new Set([cves[0].id]));

  const visible = filter === "all" ? cves : cves.filter((c) => c.severity === filter);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Section id="disclosures" title="disclosures" meta={`${cves.length} published CVEs · CVSS 3.1 and 4.0 · highest first`}>
      <div role="group" aria-label="Filter by severity" className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-2 border px-3 py-1.5 text-xs transition-colors",
                active ? "border-phosphor text-phosphor" : "border-bone/20 text-bone/70 hover:border-bone/60 hover:text-bone",
              )}
            >
              {f.key === "all" ? null : <Swatch severity={f.key} />}
              {f.label}
              <span className="tabular-nums opacity-60">{f.count}</span>
            </button>
          );
        })}
      </div>

      <div
        aria-hidden="true"
        className={cn(ROW_GRID, "hidden pb-3 text-[11px] text-bone/40 md:grid md:px-2")}
      >
        <span>id</span>
        <span>target</span>
        <span>class</span>
        <span>cvss</span>
        <span />
      </div>

      <ol className="border-b border-bone/15">
        {visible.map((cve) => (
          <Row key={cve.id} cve={cve} open={open.has(cve.id)} onToggle={() => toggle(cve.id)} />
        ))}
        {filter === "all" ? <EmbargoRow /> : null}
      </ol>

      <p className="mt-6 max-w-[62ch] text-xs leading-relaxed text-bone/50">
        Bar texture marks severity: solid for critical, checkerboard for high, dotted for medium. Open a row for the root
        cause, weakness class and fix status.
      </p>
    </Section>
  );
}

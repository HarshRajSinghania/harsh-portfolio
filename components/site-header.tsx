"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cves, sections } from "@/lib/data";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Track which section sits in the middle band of the viewport.
  useEffect(() => {
    const ids = ["top", ...sections];
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id === "top" ? null : entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-bone/15 bg-black/75 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[88rem] items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <a
            href="#top"
            className="inline-block -skew-x-12 text-lg font-semibold italic tracking-[0.2em] text-bone transition-colors hover:text-phosphor"
          >
            HARSH.RAJ
          </a>
          <span aria-hidden="true" className="h-4 w-px bg-bone/35" />
          <span className="text-[10px] text-bone/55">CVE×{cves.length}</span>
        </div>

        <nav aria-label="Sections" className="hidden md:block">
          <ul className="flex items-center gap-1 text-xs">
            {sections.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={active === id ? "location" : undefined}
                  className={cn(
                    "relative block px-2.5 py-2 transition-colors hover:text-phosphor",
                    active === id ? "text-bone" : "text-bone/55",
                  )}
                >
                  {id}
                  {active === id ? (
                    <motion.span layoutId="nav-active" className="absolute inset-x-2.5 -bottom-[11px] h-px bg-phosphor" />
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="-mr-2 p-2 text-bone transition-colors hover:text-phosphor md:hidden"
        >
          {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.nav
            id="mobile-nav"
            aria-label="Sections"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-bone/15 md:hidden"
          >
            <ul className="px-4 py-2">
              {sections.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={() => setOpen(false)}
                    className={cn("block py-3 text-sm transition-colors hover:text-phosphor", active === id ? "text-phosphor" : "text-bone/80")}
                  >
                    ~/{id}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Section } from "@/components/section";
import { ExtLink } from "@/components/ui/ext-link";
import { profile } from "@/lib/data";

function CopyEmail() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
    } catch {
      // Clipboard can be blocked (permissions, insecure context). The mailto link still works.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 border border-bone/25 px-3 py-1.5 text-xs text-bone/75 transition-colors hover:border-phosphor hover:text-phosphor"
    >
      {copied ? <Check aria-hidden="true" className="size-3.5" /> : <Copy aria-hidden="true" className="size-3.5" />}
      <span aria-live="polite">{copied ? "copied" : "copy address"}</span>
    </button>
  );
}

export function Contact() {
  return (
    <Section id="contact" title="contact">
      <p className="max-w-[56ch] leading-relaxed text-bone/70">
        For disclosure coordination, research collaboration, internships or security roles, email is the fastest way to reach me.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <a
          href={`mailto:${profile.email}`}
          className="break-all font-display text-4xl leading-none text-bone underline decoration-bone/25 decoration-1 underline-offset-8 transition-colors hover:text-phosphor hover:decoration-phosphor sm:text-5xl md:text-7xl"
        >
          {profile.email}
        </a>
        <CopyEmail />
      </div>

      <div className="mt-16 grid gap-10 border-t border-bone/15 pt-8 md:grid-cols-3">
        <div>
          <h3 className="mb-3 text-xs text-bone/45">elsewhere</h3>
          <ul className="space-y-2">
            {profile.links.map((l) => (
              <li key={l.href}>
                <ExtLink href={l.href}>{l.label}</ExtLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs text-bone/45">résumé</h3>
          <a
            href={profile.cv}
            download
            className="inline-flex items-center gap-2 text-bone underline decoration-bone/30 underline-offset-4 transition-colors hover:text-phosphor hover:decoration-phosphor"
          >
            <Download aria-hidden="true" className="size-3.5" />
            harsh-raj-cv.pdf
          </a>
        </div>

        <div>
          <h3 className="mb-3 text-xs text-bone/45">found a bug here?</h3>
          <p className="text-sm leading-relaxed text-bone/65">
            This site publishes a{" "}
            <a
              href="/.well-known/security.txt"
              className="text-bone underline decoration-bone/30 underline-offset-4 transition-colors hover:text-phosphor hover:decoration-phosphor"
            >
              security.txt
            </a>
            . I&apos;d rather hear about it from you.
          </p>
        </div>
      </div>
    </Section>
  );
}

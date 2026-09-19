import { Section } from "@/components/section";
import { cves, skills } from "@/lib/data";

export function About() {
  return (
    <Section id="whoami" title="whoami" meta="uid=1000(harsh) groups=research,defence">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-6 lg:col-span-7">
          <p className="max-w-[48ch] text-xl leading-relaxed text-bone md:text-2xl md:leading-relaxed">
            I&apos;m a cybersecurity student at Parul University and an independent vulnerability researcher, with {cves.length}{" "}
            CVEs so far in C, C++, Rust, Perl, PHP and Python code.
          </p>
          <p className="max-w-[60ch] leading-relaxed text-bone/70">
            Most of my findings start with a length or an input that the code trusts too early. I trace the path by hand, confirm
            the bug (often under AddressSanitizer), report it through coordinated disclosure, and send the patch myself when I
            can.
          </p>
          <p className="max-w-[60ch] leading-relaxed text-bone/70">
            The other half is defence. I run a Wazuh SIEM lab, built a host-based intrusion detection system for Linux, keep an
            isolated REMnux lab for taking malware apart, and trained in cybercrime investigation and digital forensics with the
            Gurugram Police.
          </p>
        </div>

        <div className="lg:col-span-5">
          <p className="mb-3 text-xs text-bone/45">
            <span aria-hidden="true">$ </span>ls ~/skills
          </p>
          <dl className="border-b border-bone/15">
            {skills.map((s) => (
              <div key={s.group} className="grid grid-cols-[6.5rem_1fr] gap-4 border-t border-bone/15 py-3">
                <dt className="text-xs leading-6 text-bone/45">{s.group}/</dt>
                <dd className="text-sm leading-6 text-bone/85">
                  {s.items.map((item, i) => (
                    <span key={item}>
                      {item}
                      {i < s.items.length - 1 ? (
                        <span aria-hidden="true" className="px-1.5 text-bone/25">
                          /
                        </span>
                      ) : null}
                      {i < s.items.length - 1 ? <span className="sr-only">,</span> : null}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}

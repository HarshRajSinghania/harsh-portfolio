// Everything the site says about Harsh lives here. Edit this file, not the components.

export type Severity = "critical" | "high" | "medium";

export type Cve = {
  id: string;
  target: string;
  kind: string;
  cwe: string;
  score: number | null;
  cvss: "3.1" | "4.0" | null;
  severity: Severity;
  lang: string;
  detail: string;
  status: string;
  writeup?: string;
};

export type Project = {
  name: string;
  kind: string;
  summary: string;
  stack: string[];
  href?: string;
  hrefLabel?: string;
};

export type Contribution = {
  repo: string;
  status: "merged" | "in review" | "submitted" | "credited";
  note: string;
  href?: string;
  hrefLabel?: string;
};

export type LogEntry = {
  when: string;
  tag: "edu" | "work" | "rank" | "cert";
  title: string;
  where?: string;
  note?: string;
  href?: string;
  hrefLabel?: string;
};

const MEDIUM = "https://medium.com/@harshrajsinghania";

export const writeups = {
  alsa: `${MEDIUM}/i-found-a-stack-buffer-overflow-in-alsa-lib-the-audio-library-running-on-every-linux-machine-d2849ae4889c`,
  rustIot: `${MEDIUM}/i-reported-the-bugs-nobody-fixed-them-so-i-fixed-them-myself-cve-2026-82452-and-cve-2026-82453-795a7c5ad905`,
  postgis: `${MEDIUM}/i-found-a-bug-in-postgis-that-takes-down-your-entire-database-cluster-with-one-query-d18d253d73f8`,
  email: `${MEDIUM}/i-spoofed-my-own-email-the-email-headers-told-a-very-different-story-2b16e5b956eb`,
  malwareLab: `${MEDIUM}/i-built-a-malware-reverse-engineering-lab-and-accidentally-became-obsessed-heres-how-you-can-too-93181fcd4dae`,
  trojan: `${MEDIUM}/your-os-cant-see-this-trojan-i-reverse-engineered-it-paramecium2-57635360c128`,
};

export const profile = {
  name: "Harsh Raj Singhania",
  email: "raj.harshraut@gmail.com",
  cv: "/harsh-raj-cv.pdf",
  github: "https://github.com/HarshRajSinghania",
  medium: MEDIUM,
  links: [
    { label: "GitHub", href: "https://github.com/HarshRajSinghania" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/harsh-raj-singhania/" },
    { label: "Hack The Box", href: "https://app.hackthebox.com/profile/2051724" },
    { label: "Medium", href: MEDIUM },
  ],
};

export const sections = ["disclosures", "whoami", "lab", "log", "writing", "contact"] as const;

export const cves: Cve[] = [
  {
    id: "CVE-2026-91939",
    target: "Cotonti CMS 1.0.0",
    kind: "Unauthenticated PHP object injection",
    cwe: "CWE-502",
    score: 9.8,
    cvss: "3.1",
    severity: "critical",
    lang: "PHP",
    detail:
      "The Comments plugin passes the ci GET parameter straight to unserialize() without allowed_classes. No login is needed, and gadget chains turn it into database manipulation or code execution.",
    status: "Disclosed",
  },
  {
    id: "CVE-2026-82452",
    target: "rust-iot-platform",
    kind: "Missing authentication on 162 routes",
    cwe: "CWE-306",
    score: 9.8,
    cvss: "3.1",
    severity: "critical",
    lang: "Rust",
    detail:
      "162 of the platform's 163 REST routes had no AuthToken guard, so an unauthenticated attacker could create, list, update and delete user accounts.",
    status: "Disclosed",
    writeup: writeups.rustIot,
  },
  {
    id: "CVE-2026-73194",
    target: "Perl DBI",
    kind: "Heap out-of-bounds write",
    cwe: "CWE-787",
    score: 9.1,
    cvss: "3.1",
    severity: "critical",
    lang: "C (Perl XS)",
    detail:
      "In preparse(), atoi() wraps :2147483648 into a negative placeholder counter that slips past the 99,999 limit. Every later '?' then expands to 14 bytes where only 7 were budgeted. Confirmed with AddressSanitizer.",
    status: "Fixed in DBI 1.652",
  },
  {
    id: "CVE-2026-78030",
    target: "Perl DBI, DBD::DBM",
    kind: "Unsafe reflection into require()",
    cwe: "CWE-470",
    score: null,
    cvss: null,
    severity: "high",
    lang: "Perl",
    detail:
      "The dbm_type and dbm_mldbm attributes reach require() unvalidated at three sites. File paths, or slash traversal past the MLDBM::Serializer:: prefix, load attacker-named Perl files.",
    status: "Fixed in DBI 1.653",
  },
  {
    id: "CVE-2026-82453",
    target: "rust-iot-platform",
    kind: "Plaintext password storage",
    cwe: "CWE-256",
    score: 7.5,
    cvss: "3.1",
    severity: "high",
    lang: "Rust",
    detail:
      "The user model stores passwords in plaintext, and the user listing and retrieval APIs hand them back to callers.",
    status: "Disclosed",
    writeup: writeups.rustIot,
  },
  {
    id: "CVE-2026-87961",
    target: "ESP32-audioI2S 3.4.4 to 4.0.0",
    kind: "Heap out-of-bounds read",
    cwe: "CWE-125",
    score: 7.1,
    cvss: "4.0",
    severity: "high",
    lang: "C++",
    detail:
      "A shadowed length parameter in read_ID3_Header() breaks ID3 synchronised-lyrics parsing. A crafted MP3 file or HTTP stream crashes the device or leaks heap memory.",
    status: "Fixed upstream",
  },
  {
    id: "CVE-2026-90775",
    target: "PostGIS address_standardizer",
    kind: "Out-of-bounds read",
    cwe: "CWE-125",
    score: 7.1,
    cvss: "4.0",
    severity: "high",
    lang: "C",
    detail:
      "An unvalidated rule Weight is used as an array index. One crafted rule reads out of bounds and takes down every PostgreSQL session on the server.",
    status: "Disclosed",
    writeup: writeups.postgis,
  },
  {
    id: "CVE-2026-86547",
    target: "mrubyc VM",
    kind: "NULL pointer dereference",
    cwe: "CWE-476",
    score: 6.2,
    cvss: "3.1",
    severity: "medium",
    lang: "C",
    detail: "Crafted .mrb bytecode makes op_enter() dereference NULL, crashing whatever application embeds the VM.",
    status: "Disclosed",
  },
  {
    id: "CVE-2026-90782",
    target: "S2OPC (OPC UA stack)",
    kind: "NULL pointer dereference",
    cwe: "CWE-476",
    score: 5.3,
    cvss: "3.1",
    severity: "medium",
    lang: "C",
    detail: "An allocation-failure status gets clobbered before it is checked, so the server dereferences NULL and crashes.",
    status: "Disclosed",
  },
  {
    id: "CVE-2026-89267",
    target: "starlette-admin",
    kind: "Allowlist bypass",
    cwe: "CWE-863",
    score: 5.3,
    cvss: "4.0",
    severity: "medium",
    lang: "Python",
    detail:
      "The searchable_fields allowlist can be bypassed, letting authenticated users filter on columns the developer deliberately excluded.",
    status: "Disclosed",
  },
  {
    id: "CVE-2026-90781",
    target: "alsa-lib",
    kind: "Off-by-one stack write",
    cwe: "CWE-193",
    score: 4.4,
    cvss: "3.1",
    severity: "medium",
    lang: "C",
    detail: "__snd_ctl_ascii_elem_id_parse() writes one byte past a 64-byte stack buffer.",
    status: "Fixed",
    writeup: writeups.alsa,
  },
];

export const severityCounts = cves.reduce<Record<Severity, number>>(
  (acc, c) => {
    acc[c.severity] += 1;
    return acc;
  },
  { critical: 0, high: 0, medium: 0 },
);

export const skills: { group: string; items: string[] }[] = [
  {
    group: "research",
    items: ["Vulnerability research", "Penetration testing", "Web app security (OWASP Top 10)", "Reverse engineering", "Malware analysis"],
  },
  { group: "languages", items: ["Python", "C", "C++", "PHP", "JavaScript", "HTML", "CSS"] },
  { group: "tooling", items: ["Burp Suite", "Nmap", "Metasploit", "Wireshark", "Ghidra", "AddressSanitizer", "YARA", "Tox"] },
  {
    group: "defence",
    items: ["SIEM (Wazuh)", "Log analysis", "Incident response", "Digital forensics", "Threat detection", "File integrity monitoring"],
  },
  { group: "network", items: ["TCP/IP", "DNS", "DHCP", "HTTP/S", "SSH", "VPNs", "Subnetting", "Packet analysis"] },
  { group: "systems", items: ["Linux (Kali, Debian, Ubuntu)", "Windows"] },
];

export const projects: Project[] = [
  {
    name: "hyperion-ids",
    kind: "Host-based intrusion detection for Linux",
    summary:
      "Watches the filesystem with hash-based integrity monitoring and raises real-time alerts on unauthorised changes. Tuning the detection logic cut false positives by 25%. Architecture and deployment are documented in the repo.",
    stack: ["Linux", "File integrity monitoring", "Real-time alerting"],
    href: "https://github.com/HarshRajSinghania/HyperionIDS",
    hrefLabel: "Source on GitHub",
  },
  {
    name: "siem-lab",
    kind: "Wazuh log collection, detection and response",
    summary:
      "Pulls logs from Windows, Linux and network devices into Wazuh. I wrote 15+ custom detection rules that raised identification accuracy to 95%, and automated alerting and response that cut mean time to respond by 60%.",
    stack: ["Wazuh", "Windows", "Linux", "Network devices"],
  },
  {
    name: "malware-lab",
    kind: "Isolated reverse-engineering environment",
    summary:
      "REMnux and Windows VMs for static and dynamic analysis: process monitoring, network traffic inspection and persistence hunting. What I find becomes custom YARA rules and IOC write-ups.",
    stack: ["REMnux", "Ghidra", "Procmon", "PEStudio", "FLOSS", "Wireshark"],
    href: writeups.malwareLab,
    hrefLabel: "How I built it",
  },
];

export const upstream: Contribution[] = [
  {
    repo: "ytisf/theZoo",
    status: "merged",
    note: "Wrote the Streamlit analysis UI, plus the GUI and packaging release work, for this live malware sample repository.",
  },
  {
    repo: "UKGovernmentBEIS/inspect_ai",
    status: "merged",
    note: "Parser fix with regression tests.",
    href: "https://github.com/UKGovernmentBEIS/inspect_ai/pull/5405",
    hrefLabel: "PR #5405",
  },
  {
    repo: "alsa-lib",
    status: "in review",
    note: "Reported an integer overflow in snd_tplg_decode() and sent an ASan-verified patch hardening the topology decoder: 64-bit size math, bounds checks, alloca removal.",
  },
  {
    repo: "starlette-admin",
    status: "submitted",
    note: "Patch that stops URL file export from following HTTP redirects, closing an SSRF path (CWE-918).",
  },
  {
    repo: "libvcs",
    status: "credited",
    note: "My report prompted a wider audit of argument injection in git, hg and svn command construction. Related issues were found and fixed.",
  },
];

// From the CV: beyond the contributions listed above.
export const furtherPrs = "20+ further PRs merged across open-source projects.";

// The CV notes more findings under embargo. The site shows they exist, nothing more.
export const embargoed = "Additional vulnerabilities identified and under coordinated disclosure. Details withheld until public release.";

export const articles = [
  { title: "I Found a Stack Buffer Overflow in ALSA-lib", topic: "CVE-2026-90781", href: writeups.alsa },
  { title: "I Reported the Bugs. Nobody Fixed Them. So I Fixed Them Myself", topic: "CVE-2026-82452, 82453", href: writeups.rustIot },
  { title: "A PostGIS Bug That Takes Down Your Database Cluster", topic: "CVE-2026-90775", href: writeups.postgis },
  { title: "Your OS Can't See This Trojan: Reverse-Engineering Paramecium2", topic: "reverse engineering", href: writeups.trojan },
  { title: "I Built a Malware Reverse Engineering Lab", topic: "Ghidra, lab setup", href: writeups.malwareLab },
  { title: "I Spoofed My Own Email: The Headers Told a Different Story", topic: "email forensics", href: writeups.email },
];

export const log: LogEntry[] = [
  { when: "now", tag: "edu", title: "B.Tech, Computer Science & Engineering with Cybersecurity", where: "Parul University, graduating 2029" },
  {
    when: "2026.06",
    tag: "work",
    title: "Cyber Security Intern",
    where: "Gurugram Police, GPCSSI 2026",
    note: "Selected from a competitive applicant pool. Trained hands-on in cybercrime investigation, digital forensics and incident response, working simulated and real-world cases alongside mentors.",
  },
  {
    when: "2025.10",
    tag: "work",
    title: "Independent security researcher",
    where: "Bugcrowd, October 2025 to present",
    note: "Assessed 20+ web application targets and reported through coordinated disclosure, including a P1 (duplicate) and a P5 informational finding.",
  },
  { when: "2025.10", tag: "work", title: "Cybersecurity job simulations", where: "Deloitte Australia, Mastercard, AIG, Datacom" },
  {
    when: "2025.02",
    tag: "rank",
    title: "Top 100 globally on Hack The Box",
    where: "20+ HTB machines and 10+ TryHackMe rooms solved",
    href: "https://app.hackthebox.com/profile/2051724",
    hrefLabel: "HTB profile",
  },
  { when: "2025", tag: "cert", title: "Certified Cybersecurity Educator Professional" },
  { when: "2024", tag: "cert", title: "Blue Team Junior Analyst" },
  { when: "2024", tag: "cert", title: "Google Cybersecurity Professional Certificate" },
  { when: "2024", tag: "edu", title: "Diploma in Computer Applications", where: "STP Computer Education" },
];

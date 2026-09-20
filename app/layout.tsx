import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, VT323 } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

const vt = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt",
  display: "swap",
});

const description =
  "Harsh Raj Singhania finds memory-corruption and access-control bugs in open-source software. 11 CVEs across C, C++, Perl, PHP, Rust and Python.";

export const metadata: Metadata = {
  title: "Harsh Raj Singhania, vulnerability researcher",
  description,
  authors: [{ name: "Harsh Raj Singhania" }],
  openGraph: { title: "Harsh Raj Singhania, vulnerability researcher", description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${plex.variable} ${vt.variable}`}>
      <body className="bg-black font-mono text-bone antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-phosphor focus:px-3 focus:py-2 focus:text-sm focus:text-black"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
        <div aria-hidden="true" className="scanlines pointer-events-none fixed inset-0 z-[60]" />
      </body>
    </html>
  );
}

import HeroAsciiOne from "@/components/ui/hero-ascii-one";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Disclosures } from "@/components/sections/disclosures";
import { About } from "@/components/sections/about";
import { Lab } from "@/components/sections/lab";
import { Log } from "@/components/sections/log";
import { Writing } from "@/components/sections/writing";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <HeroAsciiOne />
        <Disclosures />
        <About />
        <Lab />
        <Log />
        <Writing />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}

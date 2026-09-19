export function SiteFooter() {
  return (
    <footer className="border-t border-bone/15">
      <div className="mx-auto flex max-w-[88rem] flex-wrap justify-between gap-4 px-4 py-8 text-[11px] text-bone/45 lg:px-8">
        <p>© {new Date().getFullYear()} Harsh Raj</p>
        <p>Hero torus after donut.c by Andy Sloane. Your cursor writes 0x41.</p>
      </div>
    </footer>
  );
}

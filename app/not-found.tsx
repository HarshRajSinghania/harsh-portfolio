import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center px-6">
      <div className="max-w-md">
        <p className="font-display text-8xl leading-none text-bone">404</p>
        <p className="mt-4 text-sm leading-relaxed text-bone/75">Segmentation fault (core dumped). Nothing is mapped at this address.</p>
        <Link
          href="/"
          className="mt-8 inline-block border border-bone px-5 py-2.5 text-sm text-bone transition-colors hover:border-phosphor hover:bg-phosphor hover:text-black"
        >
          Back to the homepage
        </Link>
      </div>
    </main>
  );
}

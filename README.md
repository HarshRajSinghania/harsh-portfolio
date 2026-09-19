# Harsh Raj — Portfolio

A hacker-styled portfolio for cybersecurity researcher **Harsh Raj Singhania** —
11 published CVEs, research write-ups, and defensive labs.

Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and Framer Motion.
The hero is a hand-built ASCII canvas: a field of drifting hex bytes behind a
spinning torus, where the cursor overwrites nearby bytes with `0x41` — the
buffer-overflow payload.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build

```bash
npm run typecheck   # tsc --noEmit
npm run build       # production build
npm start           # serve the build
```

## Content

All content lives in `lib/data.ts` — CVEs, projects, upstream contributions,
timeline, and article links. Edit that one file to update the site.

## Deploy

Zero-config on Vercel (framework preset: Next.js). On Render, use a Web Service
with `npm install && npm run build` as the build command and `npm start` as the
start command.

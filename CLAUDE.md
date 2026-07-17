<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

## Development Commands

- `pnpm build` — typecheck (`tsc -b`) + production build
- `pnpm lint` / `pnpm exec eslint <file> --fix` — ESLint includes Prettier rules
- Vite `base` is `/safesock/`, so local URLs are e.g. `http://localhost:PORT/safesock/approach`; asset paths must use `import.meta.env.BASE_URL`

## Design

- Brand palette (per founder, 2026-07): accent `#1E52F3`, pure white background, black main text, grey (neutral-500) subtext
- `/approach` page (UI branch): minimal essay style inspired by fergusfinn.com — centered ~42rem article column, hairline `neutral-200` dividers instead of cards; header is the shared black-pill `Navbar` component (any navbar change must go in `src/components/Navbar.tsx` so all pages stay consistent)
- Fonts loaded in index.html: Readex Pro, Source Serif 4, Source Sans 3 (UI/headings on /approach), Crimson Pro (prose on /approach)
- `/data` page (2026-07, per founder): **no motion animations** — static polish only; the foot heatmap's design and blue→red colormap are locked, don't change them. Shares the /approach figure grammar statically: accent hairline atop cards (`HAIRLINE`), `CARD_LABEL` micro-labels, neutral-500 subtext, accent reserved for the live/current signal.
- `/approach` motion system (2026-07, CSS in `src/index.css`): one-shot reveal-on-scroll via page-local `Reveal` component (IntersectionObserver adds `.reveal-in`), scrollspy contents rail with sliding accent marker, CSS scroll-driven reading-progress hairline (`animation-timeline: scroll()`) and roadmap line draw (`view()`), both `@supports`-gated with invisible fallback. All motion sits behind `prefers-reduced-motion: no-preference`; SVG draw animations keep completed-state values in markup so the static fallback shows finished figures. Figures 1–2 share one visual grammar: accent hairline header, blinking Live dot, flowing-dot `stroke-dasharray` packets. Accent is reserved for signal/energy; hover affordances only on real links/buttons.

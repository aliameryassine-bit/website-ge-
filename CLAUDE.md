# Green Exchange — Project Brief

Persistent brief for every session. Read this before writing code.

## Company

Green Exchange is a Romanian company that builds and operates reverse vending machines (RVMs). The machines accept used PET bottles and aluminium cans and return value to the depositor.

This is an operating company. Write about it that way.

## Go to market

**Primary commercial target: Egyptian retail chains** — hypermarkets, supermarkets, convenience. Machines are placed in store entrances or car parks.

**Secondary:** malls, universities, corporate campuses, municipalities.

## Two audiences, ranked

**A. Retail chain decision makers** (Head of Operations, Head of Sustainability, Store Development). They buy on:

- Floor space
- Servicing burden
- Footfall and dwell time
- Revenue share
- Compliance and ESG reporting
- Brand halo

**B. Investors** (angel, seed, impact, strategic). They buy on:

- Unit economics per machine
- Payback period
- Recyclate offtake value
- TAM in Egypt and MENA
- Defensibility
- Team
- Traction

Audience A outranks audience B. When a layout, word count, or navigation decision forces a trade-off, resolve it in favour of the retail buyer.

## What the site must do

1. Make a retail chain request a pilot.
2. Make an investor request data room access.
3. Make both believe this is an operating company, not a student concept.

Every page should move a visitor toward goal 1 or goal 2. A page that serves neither needs a reason to exist.

## Non-negotiable rules for every session

**Never invent facts.** No fabricated statistic, customer name, logo, testimonial, certification, award, or partner. If a number is needed and has not been supplied, import it from `content/facts.ts` and mark it `PLACEHOLDER`. Placeholders are visible and honest; invented numbers are not. This rule holds even when a section looks empty or unfinished without them.

**No stock photo clichés.** No hands holding a seedling. No globe. No generic smiling office. If there is no real asset, use structure, type, and space instead of a decorative stand-in.

**No lorem ipsum in committed code.** Write real copy or leave a marked placeholder.

**Accessibility floor.** Visible keyboard focus on every interactive element. `prefers-reduced-motion` respected everywhere. Colour contrast AA minimum. These are floors, not targets.

**Mobile first.** Egyptian retail buyers will open this on a phone. Design at 375px, then scale up.

**Every page must work with JavaScript animations disabled.** Animation is enhancement only. Content, navigation, and both conversion paths must function without it. Never gate text, layout, or a form behind an animation trigger or scroll observer.

## Tone

Operational and precise, not eco poetic. We sell throughput, uptime, and material recovery.

Confidence comes from specificity. Prefer a concrete mechanism over an adjective. "Accepts PET and aluminium" beats "revolutionary recycling solution." Avoid sustainability boilerplate, exclamation, and mission-statement voice.

## Design workflow

The `ui-ux-pro-max` skill is installed at `.claude/skills/ui-ux-pro-max/`. Use it for UI structure, colour, typography, layout, and UX review. Run it from the project root:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system
```

Three known traps, verified by reading its data:

1. **Its style database skews mobile/native.** A generic query returns React Native styles citing Reanimated and haptics. Always include web/desktop keywords, and vet any recommended style before adopting it.
2. **Its token naming is inconsistent with itself.** The generator emits `--color-primary`; its own shadcn guidance says `--primary`. Pick one convention for this project and hold it.
3. **Its `MASTER.md` component specs are class-based CSS with hardcoded hex.** Translate them into theme tokens. Never paste raw hex into components.

Its own honesty rule applies here too: a 0-result search is never reported as data. Say when a recommendation came from defaults rather than a database match.

## Settled decisions

- **Stack.** Next.js 16 (App Router) + TypeScript strict + Tailwind v4, `src/` directory. **No shadcn/ui** — primitives are hand-built in `src/components/ui/`.
- **Tokens.** Tailwind v4 CSS-first `@theme` in `src/app/globals.css` is the single source of truth: it emits both the utilities and the CSS custom properties, so there is no second JS config to drift from. Convention is `--color-*` with semantic aliases (`--color-ground`, `--color-ink`, `--color-action`). No component may contain a raw hex, a raw easing curve, or a raw spacing value.
- **Motion.** `motion` (framer-motion successor) behind a root `MotionConfig`, plus Lenis, which is never constructed under `prefers-reduced-motion`.
- **Trap, already paid for once.** The named spacing tokens (`sm`…`3xl`) collide with Tailwind's container scale, so `max-w-2xl` resolves to 48px, not 42rem. Use `max-w-measure` / `max-w-page`, never a named max-width. Documented in `globals.css`.

## Open decisions

- **Real figures.** Machine throughput, uptime, unit economics, payback period, and recyclate values have not been supplied. Everything numeric routes through `content/facts.ts` as `PLACEHOLDER` until it is, and `scripts/check-facts.ts` fails the build if a public surface references one.
- **Arabic locale.** Array and Archivo have no Arabic. Do not pick an Arabic face without a native reader reviewing specimens.
- **Array at 375px.** The display face has not been specimen-tested at mobile width. See `src/fonts/README.md`.
- **Brand assets.** No favicon or logo exists, so `/favicon.ico` 404s. Needs a real asset — do not invent a mark.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

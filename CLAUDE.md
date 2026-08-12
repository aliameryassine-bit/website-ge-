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

## Open decisions

Not yet settled — do not silently pick one and build on it:

- **Stack.** Intended direction is Next.js App Router + TypeScript + Tailwind. Tailwind major version and whether to use shadcn/ui are both undecided; the shadcn choice determines the token naming convention above.
- **Real figures.** Machine throughput, uptime, unit economics, payback period, and recyclate values have not been supplied. Everything numeric routes through `content/facts.ts` as `PLACEHOLDER` until it is.

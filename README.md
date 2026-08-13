# Green Exchange

Marketing site for Green Exchange — reverse vending machines (RVMs) that accept
PET bottles and aluminium cans and return value to the depositor.

The site has exactly two jobs:

1. Get a retail chain to request a pilot.
2. Get an investor to request data room access.

Everything else on it is in service of one of those, or it is negotiable.

**Read `CLAUDE.md` before writing code.** It carries the project rules —
audience order, tone, the no-invented-facts rule, the accessibility floor —
and those are enforced by build gates, not by convention.

---

## Contents

- [Quick start](#quick-start)
- [How the site is put together](#how-the-site-is-put-together)
- [How to edit copy](#how-to-edit-copy)
- [How to update a fact](#how-to-update-a-fact-placeholder--verified)
- [How to add a translation](#how-to-add-a-translation)
- [How to read form submissions](#how-to-read-form-submissions)
- [How to deploy](#how-to-deploy)
- [The build gates](#the-build-gates)
- [Audits](#audits)

---

## Quick start

```bash
npm install
cp .env.example .env.local     # optional — the site runs with nothing set
npm run dev                    # http://localhost:3000
```

Node 22+. `next dev` does **not** run the build gates, so local development is
never blocked by an outstanding figure or an untranslated string. That is
deliberate: the gates exist to stop a _deploy_, not to stop work.

With no environment variables set, both lead forms validate correctly and then
report **failure** with a fallback email address. They do not pretend to have
sent. See [How to read form submissions](#how-to-read-form-submissions).

| Command                   | What it does                                                                    |
| ------------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`             | Development server                                                              |
| `npm run build`           | Runs all three gates, then builds. Fails if any gate fails                      |
| `npm start`               | Serves the production build                                                     |
| `npm run lint`            | ESLint, zero warnings tolerated                                                 |
| `npm run typecheck`       | `tsc --noEmit`                                                                  |
| `npm run format`          | Prettier, write                                                                 |
| `npm run build:messages`  | Regenerates `messages/*.json` and `content/i18n-todo.md` from `content/copy.ts` |
| `npm run check:facts`     | Fails if a PLACEHOLDER fact is referenced by a public surface                   |
| `npm run check:legal`     | Fails if placeholder legal wording is still present                             |
| `npm run check:i18n`      | Fails if any `[[AR]]` / `[[RO]]` marker remains                                 |
| `npm run grant:data-room` | Mints a signed, time-limited data room URL (manual, by hand)                    |

---

## How the site is put together

```
content/          The things a non-developer edits
  copy.ts           Every English string on the site
  facts.ts          Every number and every claim, with a source and a status
  roi.ts            ROI calculator coefficients (all still missing — see below)
  team.ts           Team members (empty — an invented team is worse than none)
  i18n-todo.md      Generated. Every string awaiting translation
messages/         Generated from copy.ts. en.json is real; ar/ro are marked TODO
src/
  app/[locale]/     All public routes. Locale-prefixed except English
  app/admin/        Internal dashboard. Outside [locale], Basic Auth, noindex
  components/       ui/ = primitives, sections/ = page sections
  lib/forms/        Zod schemas, server actions, rate limit, spam, delivery
  lib/analytics/    The six tracked events and their definitions
  i18n/             next-intl routing, request config, copy accessors
  app/globals.css   Tailwind v4 @theme — the single source of design tokens
scripts/          Build gates, message generation, audits
docs/analytics.md What each event answers and why it exists
```

**Stack.** Next.js 16 (App Router) · React 19 · TypeScript strict ·
Tailwind v4 (CSS-first `@theme`, no JS config) · next-intl · Motion · Lenis.
No shadcn/ui — primitives are hand-built in `src/components/ui/`.

**Two traps that have already cost time once each, documented in `globals.css`:**

- The named spacing tokens (`sm`…`3xl`) collide with Tailwind's container
  scale, so `max-w-2xl` resolves to **48px**, not 42rem. Use `max-w-measure`
  and `max-w-page`. Never a named max-width.
- No component may contain a raw hex, a raw easing curve, or a raw spacing
  value. Tokens only.

---

## How to edit copy

**All English copy lives in `content/copy.ts`.** One file. No string is typed
into a component.

1. Open `content/copy.ts` and find the section. It is organised by page, then
   by section, in the order they appear on screen.
2. Edit the string. Keep the comment above it — several of them record _why_
   a phrase is worded the way it is, and that context is the difference
   between an edit and a regression.
3. Run `npm run build:messages`. This regenerates `messages/en.json` (what the
   site actually loads) and re-derives the Arabic and Romanian entries as
   marked-untranslated strings.
4. Check the page. `npm run dev` picks it up on save.

**If you skip step 3 the site will not change.** `copy.ts` is the source; the
JSON is what next-intl reads. The generator is the only link between them.

### Tone

Operational and precise, not eco-poetic. We sell throughput, uptime, and
material recovery. Confidence comes from specificity — prefer a concrete
mechanism over an adjective. "Accepts PET and aluminium" beats "revolutionary
recycling solution."

Audience order is not a preference, it is a tie-breaker: when a sentence
cannot serve both a retail buyer and an investor, it serves the retail buyer.

### Two things you cannot put in copy

- **A number.** Numbers come from `content/facts.ts` and are rendered through
  the `<Fact>` component. Typing `"1.2M containers"` into copy bypasses every
  check in the repository. See the next section.
- **Legal wording.** The investor disclaimer and the investor-status
  declaration carry a `LEGAL-PLACEHOLDER-DO-NOT-SHIP` marker and are waiting
  on a lawyer. Do not draft replacements yourself.

---

## How to update a fact (PLACEHOLDER → verified)

Every number on this site is one entry in `content/facts.ts`, and every entry
carries a `status` that decides how it is allowed to be displayed.

| Status        | Meaning                      | Required in `source`      | Renders as                   |
| ------------- | ---------------------------- | ------------------------- | ---------------------------- |
| `PLACEHOLDER` | Nobody has supplied this yet | `UNSOURCED`               | An em dash, visibly unfilled |
| `internal`    | Measured by us               | A named internal document | The value, cited as internal |
| `verified`    | Externally citable           | A citable URL             | The value, with the citation |

### The edit

Find the fact and replace the whole `placeholder(...)` call with a literal
object. Here is the shape, using a fact that is currently outstanding:

```ts
// BEFORE — content/facts.ts
'machine-uptime': placeholder(
  'machine-uptime',
  'Machine uptime',
  'State the measurement window alongside this (e.g. trailing 90 days). An uptime figure without a window is not credible.',
),

// AFTER — once the real figure exists
'machine-uptime': {
  id: 'machine-uptime',
  value: '99.1%',
  label: 'Machine uptime',
  source: 'GX fleet telemetry export, 2026-06-30',   // named internal doc
  status: 'internal',
  numeric: 99.1,
  unit: '%',
  basis: 'trailing 90 days, 12-machine fleet',
},
```

Then run `npm run check:facts`. The count of blocking references should drop.

### The fields that are not optional in practice

- **`source` must be real.** `verified` requires a citable URL; `internal`
  requires a named document a person could actually be sent. The gate fails a
  build where a fact claims `verified` or `internal` while `source` is still
  `UNSOURCED` — and that failure blocks _commits_, not just deploys, because
  it is a mistake rather than an interim state.
- **`numeric`, `unit` and `basis` are required for anything that animates.**
  `isCountable()` refuses to animate a number without all three. "1.2M
  containers" is not a claim; "1.2M containers since March 2026" is one
  somebody can check. This is why the counters on the homepage currently do
  not animate.
- **Investor-facing market figures need a public source.** `isPubliclyCitable()`
  gates them, and a figure that fails it is **absent from the page**, not
  greyed out and not marked pending. An unsourced market statistic in front of
  an investor is the most damaging thing this site could publish.

### Never invent a value

Not to fill a gap, not to make a section look finished, not as an example that
"we'll replace later". If a number has not been supplied it stays a
`PLACEHOLDER`. The gate exists because this is the rule most likely to be
broken under deadline pressure, and a fabricated figure that reaches a retail
buyer is not recoverable by a later correction.

---

## How to add a translation

Three locales: **en** (default, no URL prefix), **ar**, **ro**. Routes are
`/for-retailers`, `/ar/for-retailers`, `/ro/for-retailers`. Arabic mirrors to
RTL automatically — `dir` is set on `<html>`, the layout uses logical
properties throughout, and directional animations and icons flip.

### Translating existing strings

1. Open `content/i18n-todo.md`. It lists every outstanding string with its key
   path and the English source, grouped by section. It also carries the brief
   for the translator: tone, audience order, what not to translate.
2. Open `messages/ar.json` (or `ro.json`) and find the key path.
3. Replace the **whole value including the `[[AR]]` / `[[RO]]` marker**.

```jsonc
// before
"pilotCta": "[[AR]] Request a pilot",
// after
"pilotCta": "اطلب تجربة"
```

4. `npm run check:i18n` fails while any marker remains, so a half-translated
   locale cannot reach production. That is the point: an Arabic page that is
   actually English with a marker in front of it reads worse to an Egyptian
   buyer than an English-only site, because it says we started and did not
   finish.

**Do not machine translate.** This is a commercial document aimed at retail
buyers and investors. Book a human.

**Do not translate:** routes, fact ids, the company name, or the legal
placeholder markers. The generator already excludes them; if you see one in a
messages file, that is a bug — report it rather than translating around it.

### Adding a fourth locale

1. Add the code to `routing.locales` in `src/i18n/routing.ts`.
2. `npm run build:messages` — it generates the new file with every string
   marked untranslated.
3. If the locale is RTL, confirm it is handled in the `dir` resolution.
4. Check the typeface. Array and Archivo have no Arabic; Arabic is set in a
   face designed for Arabic, not a Latin font falling back. A new script needs
   the same treatment — do not ship a locale in a font that does not cover it.

---

## How to read form submissions

Two forms: the pilot request (`/pilot`) and the data room request
(`/investors`). Both validate with the same Zod schema on the client and the
server, are rate limited, and carry a honeypot plus a signed timing check.

**Every submission is sent to two places, independently:**

| Destination       | Set by                                                 | What it is for                                                                                                            |
| ----------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Email, via Resend | `RESEND_API_KEY`, `LEADS_FROM_EMAIL`, `LEADS_TO_EMAIL` | Immediate notification. Reply-to is the lead's own address, so replying from the inbox reaches them                       |
| A row in Airtable | `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`                 | **The one you read without a developer.** A table you can sort, filter, add a Status column to, and run the pipeline from |

**Airtable is the recommended primary.** Email tells you a lead arrived; only
the table tells you what happened to it. Add a `Status` single-select and the
table becomes the pipeline — no developer, no export, no deploy to change a
column. The expected column names for both tables are listed in
`.env.example`; writes use `typecast`, so a column typed as text where a
number was sent still accepts the row, because a rejected write is a lost lead.

**Delivery policy.** A submission is _delivered_ if **either** destination
accepts it — both are durable records, and refusing to confirm because the
second one failed would turn a partial outage into a lost lead. A submission
_fails_ only when both refuse. In that case the full payload is written to the
server log under a grep-able marker:

```
[LEAD-NOT-DELIVERED]
```

**Grep your production logs for that string periodically.** It is the last
place a lead can be recovered from.

### The dashboard

`/admin` — HTTP Basic Auth, password from `ADMIN_PASSWORD` (12 characters
minimum; the route returns 503 rather than opening if it is unset or too
short). Username is ignored.

It shows submissions from Airtable next to event counts from Plausible, rates
first. Every panel that cannot load **says which credential is missing** rather
than showing a zero — a zero on a dashboard reads as "nobody came", and being
wrong about that in front of an investor is worse than an empty panel.

It is `noindex`, disallowed in `robots.txt`, and outside `[locale]` because it
is a tool for us in one language.

### Granting data room access

Manual, by design. The public form cannot mint a token; approving a request is
something a person does after reading it.

```bash
DATA_ROOM_SIGNING_SECRET=... npm run grant:data-room -- \
  --email lp@example.com --hours 72 --base-url https://greenexchange.example
```

It prints a signed, expiring URL. You send it.

---

## How to deploy

The site is a standard Next.js App Router application and deploys to Vercel
with no adapter and no `vercel.json`.

### 1. Set the environment variables

Every variable is documented with its purpose and its failure mode in
`.env.example`. The ones that must be set for a real production deploy:

| Variable                                                 | Why it is not optional                                                                                                            |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                   | Canonical, hreflang and OG URLs are built from it, **at build time** for static pages. Unset, every canonical points at localhost |
| `FORM_SIGNING_SECRET`                                    | Signs the anti-spam timing token. Unset, the token is unsigned and its elapsed time is editable                                   |
| `RESEND_API_KEY` + `LEADS_FROM_EMAIL` + `LEADS_TO_EMAIL` | Otherwise nobody is told a lead arrived                                                                                           |
| `AIRTABLE_API_KEY` + `AIRTABLE_BASE_ID`                  | Otherwise there is no table to read                                                                                               |
| `ADMIN_PASSWORD`                                         | Otherwise `/admin` returns 503                                                                                                    |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`                           | Otherwise no analytics script renders at all                                                                                      |
| `DATA_ROOM_SIGNING_SECRET`                               | Needed to grant access. Must **not** equal `FORM_SIGNING_SECRET`                                                                  |

`NEXT_PUBLIC_SITE_URL` must be set in the build environment, not only at
runtime. Setting it after the fact does not fix already-built pages.

### 2. Deploy

```bash
vercel            # preview
vercel --prod     # production
```

Or connect the repository in the Vercel dashboard. Build command is the
default `npm run build`, which runs the three gates first.

### 3. Expect the build to fail until the placeholders are resolved

`npm run build` runs `prebuild` → `check:facts && check:legal && check:i18n`.
Any one of them failing means `next build` never starts. **This is the
intended behaviour and it is currently blocking**: as of this commit the fact
gate reports 92 blocking references across 53 facts.

To build locally with the placeholders still in place:

```bash
ALLOW_PLACEHOLDERS=1 npm run build
```

One switch for all three gates, on purpose — it means "this build contains
known placeholders and must not be deployed", rather than three flags someone
can set one at a time without noticing what else they let through. **Do not
set it in the Vercel project environment.** The moment it is set there, the
gates stop protecting anything.

### Security headers

Set in `next.config.ts` and applied to every route: CSP, HSTS
(2 years, `includeSubDomains`, `preload`), `X-Frame-Options: DENY`,
`Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options`,
and a `Permissions-Policy` that denies camera, microphone, geolocation,
payment and USB outright.

Every CSP origin is `'self'` — fonts are self-hosted by `next/font`, Plausible
is proxied through `/stats`, and no third party is contacted from the browser.
Two relaxations are documented in full in `next.config.ts`: `'unsafe-inline'`
for scripts (Next inlines a per-page RSC payload that cannot be hashed) and
for styles (Motion writes inline styles while animating). The script one is
the weakest line in the policy and is annotated as such.

`headers()` is baked into the routing manifest at build time, so **changing a
header requires a rebuild**, not just a restart.

Verify with `node scripts/audit/csp.mjs` against a running production build.
It loads every route with the real headers, records any violation the browser
reports, and separately confirms the analytics beacon, the Motion-driven menu,
the CSS keyframe entrances and the form POST all still work.

**HSTS caveat:** `preload` is effectively irreversible on the timescale that
matters. Only keep it once the domain is genuinely HTTPS-only including every
subdomain.

---

## The build gates

Three scripts, all run by `prebuild`, all gated behind `ALLOW_PLACEHOLDERS=1`.

| Gate          | Fails when                                                                                        | Blocks                |
| ------------- | ------------------------------------------------------------------------------------------------- | --------------------- |
| `check:facts` | A `PLACEHOLDER` fact is referenced by a public surface                                            | Deploy                |
| `check:facts` | A fact claims `verified`/`internal` while `source` is `UNSOURCED`, or an unknown id is referenced | Deploy **and commit** |
| `check:legal` | The `LEGAL-PLACEHOLDER-DO-NOT-SHIP` marker appears anywhere in `src/` or `content/`               | Deploy                |
| `check:i18n`  | Any `[[AR]]` / `[[RO]]` marker remains in `messages/*.json`                                       | Deploy                |

The severity split in `check:facts` is deliberate. A referenced placeholder is
an _intentional interim state_ — the footer's registration details are
placeholders precisely because nobody has supplied them — so it blocks a
deploy but not a commit. A fact lying about its own status is a _mistake_, and
blocks both. Blocking commits on interim states would only teach everyone to
pass `--no-verify`.

The styleguide (`/styleguide`) is exempt from `check:facts`, because
demonstrating the placeholder state of the `Fact` primitive is its job. It is
`noindex`.

---

## Audits

All expect a **production** build (`npm run build && npm start`), not `next dev`.

```bash
npm run audit:lighthouse   # mobile perf, simulated 4G
npm run audit:axe          # accessibility, every route
npm run audit:keyboard     # keyboard walkthrough of both forms and the menu
npm run audit:bundle       # largest imports
npm run audit:fonts        # font loading and fallback metrics
node scripts/audit/csp.mjs # CSP vs. analytics, Motion, keyframes, form POST
node scripts/audit/events.mjs      # the six analytics events actually fire
node scripts/audit/verify-forms.mjs # both flows end to end against a mock API
```

`scripts/audit/mock-apis.mjs` stands in for Resend and Airtable on
`127.0.0.1:4111`, so the full submission path can be exercised without live
accounts or real leads. Point at it with `RESEND_BASE_URL` and
`AIRTABLE_BASE_URL` — both documented in `.env.example` as test seams.

---

## Before going live

See **`LAUNCH-CHECKLIST.md`**. It lists what a human has to do — legal
wording, real photography, verified statistics, Arabic translation, domain,
registration details — and states plainly what on this site is not yet real.

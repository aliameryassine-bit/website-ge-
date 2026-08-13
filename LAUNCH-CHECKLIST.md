# Launch checklist

Everything a **human** has to do before this site goes live. Nothing on this
list can be completed by writing code, which is why it is a separate document
from `README.md`.

The site is technically complete: routes, forms, delivery, analytics,
i18n scaffolding, security headers, error pages and build gates are all built
and tested. What is missing is **content that must come from the company** —
figures, legal wording, photography, translations, registration details.

The three build gates enforce most of this. `npm run build` currently fails,
by design, and will keep failing until the blocking items below are resolved.
Treat a green build as the definition of "ready to deploy", not this document's
tick boxes.

```
check-facts: FAILED with 92 problem(s)      → 53 distinct facts outstanding
check-legal: FAILED                          → 1 marker, content/copy.ts:838
check-i18n:  FAILED with 806 untranslated string(s)   → 403 per locale × 2
```

---

## 1. Legal — blocking

- [ ] **Investor disclaimer.** Currently marked `LEGAL-PLACEHOLDER-DO-NOT-SHIP`
      at `content/copy.ts:838`. Must be drafted by a qualified lawyer familiar
      with the jurisdiction the raise is conducted in. **Do not write this
      in-house and do not adapt one from another company's site.**
- [ ] **Investor-status declaration** on the data room request form. Same
      constraint. This is the text a person ticks to declare they are a
      qualified/professional investor, and its wording determines whether the
      declaration is worth anything.
- [ ] **Privacy policy.** `/legal/privacy` exists and renders a stub that says
      it awaits legal review — the GDPR consent checkbox on both forms links
      there. The published version must actually describe what happens to a
      submission: sent to Resend (email delivery) and written to Airtable (row
      storage), retained for X, contactable at Y. A consent checkbox pointing
      at a stub is not meaningfully better than one pointing at a 404.
- [ ] **The other three legal routes are stubs too:** `/legal/terms`,
      `/legal/cookies`, `/legal/investor-disclaimer`. Each renders a one-line
      statement of intent and nothing else. Decide which are needed at launch
      and have them drafted; delete the routes that are not.
- [ ] **Consent text is versioned** — the version string is written to every
      row. Confirm the stored version matches the published policy at launch,
      and bump it whenever the policy changes.
- [ ] **Cookie banner: not required for the current configuration.** Plausible
      stores nothing on the device and holds no personal data; the one cookie
      the site sets (`gx_t`, the anti-spam token) is strictly necessary and
      exempt. **This answer changes the moment any marketing pixel is added.**
      Reasoning in `docs/analytics.md`.
- [ ] **Egyptian data handling.** Leads are Egyptian retail contacts, and the
      delivery destinations (Resend, Airtable) are outside Egypt. Confirm with
      counsel whether Egypt's Personal Data Protection Law imposes anything
      beyond the GDPR posture already implemented.

## 2. Company registration details — blocking

These render in the footer and are currently placeholders. They are also the
cheapest possible credibility signal, and their absence is the first thing a
sceptical buyer notices.

- [ ] `legal-entity-name` — the registered name, not the trading name
- [ ] `company-registration-number`
- [ ] `vat-number`
- [ ] `registered-address`
- [ ] `contact-email` — a monitored address, not a personal one
- [ ] `contact-phone` — with an Egyptian number if there is an Egyptian presence
- [ ] `company-stage` — used on the investor page

## 3. Verified statistics — blocking

53 facts are outstanding. Every one of them is defined in `content/facts.ts`
with a note describing exactly what is needed. Grouped by who has to supply it:

**Machine specification** — engineering

- [ ] `floor-space-required-m2`, `machine-dimensions`, `service-clearance`,
      `floor-loading`, `power-requirement`, `connectivity-requirement`
- [ ] `accepted-container-sizes`, `machine-capacity-per-collection`,
      `compaction-ratio`, `container-recognition-rate`
- [ ] `deposit-cycle-per-container` — seconds per container, measured

**Operations** — fleet data

- [ ] `machine-uptime` — **with its measurement window.** An uptime figure
      without a window ("trailing 90 days", "since March 2026") is not a claim
- [ ] `servicing-frequency`, `fault-response-time`
- [ ] `machines-built`, `machines-deployed`
- [ ] `containers-collected-to-date`, `material-recovered-to-date`
- [ ] `containers-per-machine-per-day`
- [ ] `stream-separation-purity`, `stream-split-pet-share`

**Retail commercial** — the numbers a Head of Operations decides on

- [ ] `footfall-effect`, `dwell-time-effect`, `capture-rate-per-footfall`
- [ ] `voucher-redemption-rate`, `retailer-revenue-share`
- [ ] `esg-reporting-cadence`, `benefit-range-band`
- [ ] `pilot-response-time` — the promise made on the confirmation page. Make
      it one the team can keep

**Unit economics** — investor-facing

- [ ] `payback-period-per-machine`
- [ ] `value-per-tonne-baled-pet`, `value-per-tonne-baled-aluminium`
- [ ] `deposit-value-per-container`, `depositor-value-returned`
- [ ] `average-container-mass-pet`, `average-container-mass-aluminium`

**Market context** — must be **publicly citable**, not internal

- [ ] `egypt-annual-pet-consumption`, `egypt-pet-collection-rate`,
      `egypt-pet-formally-collected`, `egypt-pet-informally-collected`,
      `egypt-pet-uncollected`, `egypt-aluminium-collection-rate`,
      `egypt-regulatory-direction`

  These are gated by `isPubliclyCitable()`: without a named public source with
  a URL they are **absent from the page entirely**, not greyed out. An
  unsourced market statistic in front of an investor is the single most
  damaging thing this site could publish.

**Traction** — leave at zero rather than rounding up

- [ ] `pilots-signed`, `lois-signed`
- [ ] `data-room-review-time`

**Method:** each fact needs `value`, a real `source`, and a `status` of
`internal` (named internal document) or `verified` (citable URL). Anything that
animates as a counter also needs `numeric`, `unit` and `basis`. Procedure in
`README.md` → _How to update a fact_.

## 4. The ROI calculator — blocking for the retailer path

9 of its 10 coefficients are unmeasured, so the calculator currently reports
that it **cannot compute** and names what is missing. That is the intended
behaviour — a retail operations lead may take a siting decision on its output,
so it does not get plausible-looking defaults.

- [ ] `captureRatePerVisitor` — containers per visitor per day
- [ ] `machineThroughputPerDay` — containers per machine per day
- [ ] `petShareOfContainers` — share, 0–1
- [ ] `massPerPetContainerGrams`
- [ ] `massPerAluminiumContainerGrams`
- [ ] `valuePerTonnePet`
- [ ] `valuePerTonneAluminium`
- [ ] `retailerShareOfMaterialValue` — share, 0–1
- [ ] `benefitRangeBand` — the ± band on the estimate. Do not ship a
      point estimate without one

- [ ] **Decide the currency and state it.** The calculator is currency-agnostic
      today. EGP and USD imply very different conversations.

## 5. Arabic translation — blocking for the Egyptian market

- [ ] **Book a human translator.** 403 strings, listed with key paths and
      English source in `content/i18n-todo.md`. That file also carries the
      brief: tone, audience order, what not to translate.
- [ ] **Do not machine translate.** This is a commercial document aimed at
      retail buyers. A machine translation of "we come back with a site
      assessment" is how a serious company reads as an unserious one.
- [ ] **Have a native reader review the Arabic typeface.** Arabic is set in
      IBM Plex Sans Arabic — a face designed for Arabic, not a Latin font
      falling back — but the choice has not been reviewed by anyone who reads
      Arabic. Confirm it at real string lengths on a phone.
- [ ] **Walk the Arabic site RTL end to end.** The mirroring is implemented and
      tested structurally, but nobody has read it. Check the forms in
      particular: field order, error placement, the consent sentence.
- [ ] **Decide whether Romanian launches at all.** 403 more strings. Green
      Exchange is a Romanian company, so it is defensible; if the go-to-market
      is Egypt-only for now, removing `ro` from `routing.locales` is cheaper
      than a translation nobody reads. **Decide, do not default.**

## 6. Photography and brand assets — blocking

The site currently contains **no photographs at all**. There is no `public/`
directory. Structure, type and space are doing the work stock imagery would
normally do — which is a deliberate choice, and better than a hands-holding-a-
seedling cliché, but it is not the finished state.

- [ ] **A real photograph of a real machine.** This is the single highest-value
      missing asset. A retail buyer deciding on floor space needs to see the
      thing that will occupy it. Wanted: the machine in a store entrance, at a
      human scale, with something in frame for size.
- [ ] **A machine dimension drawing or elevation** for the technology page.
- [ ] **Photographs of the deposit interaction** — a person using it, ideally
      in an Egyptian store, with a signed release.
- [ ] **Favicon and logo.** `/favicon.ico` currently 404s. No mark exists.
      Do not commission a placeholder mark — commission the real one.
- [ ] **OG images.** Generated per route by `next/og` from the design system
      and typographic today. Once real photography exists, decide whether the
      OG images should use it.
- [ ] **No stock photo clichés.** No hands holding a seedling, no globe, no
      generic smiling office. If a real asset does not exist, the structural
      treatment stays.

## 7. Team — a decision, not a task

`content/team.ts` exports two empty arrays, so the team section renders
nothing. An investor reading forty decks a month will notice.

- [ ] **Decide:** publish real people with real roles and real photographs, or
      leave the section absent. Do not publish role titles without names, and
      do not list advisors who have not agreed in writing to be listed.

## 8. Domain and hosting

- [ ] **Register the domain.** Consider whether an `.eg` presence matters to an
      Egyptian retail buyer alongside the primary domain.
- [ ] Point DNS at Vercel; verify the apex and `www` both resolve and that one
      redirects to the other.
- [ ] **Set `NEXT_PUBLIC_SITE_URL` in the build environment** before the first
      production build. Canonical, hreflang and OG URLs are baked in at build
      time — setting it afterwards does not fix pages already built.
- [ ] **Verify the sending domain in Resend** (SPF/DKIM). Unverified, delivery
      fails with a 403 and every lead falls through to the log.
- [ ] Create the Airtable base with the column names listed in `.env.example`,
      and add a `Status` single-select so the table can run the pipeline.
- [ ] Generate the three secrets, each distinct:
      `FORM_SIGNING_SECRET`, `DATA_ROOM_SIGNING_SECRET`, `ADMIN_PASSWORD`.
      `openssl rand -base64 48`.
- [ ] Register the site in Plausible and set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.
- [ ] **Confirm `ALLOW_PLACEHOLDERS` is NOT set in the Vercel project.** The
      moment it is, all three gates stop protecting anything.
- [ ] **HSTS preload.** The header ships with `preload` and a two-year max-age.
      Only submit to the preload list once the domain is genuinely HTTPS-only
      including every subdomain — it is effectively irreversible.

## 9. Before you announce it

- [ ] **Submit both forms yourself, from a phone, on mobile data.** Confirm the
      email arrives, the Airtable row appears, and the reference code on the
      confirmation page matches the row.
- [ ] **Then reply to the email** and confirm the reply reaches the lead's
      address, not the sending domain.
- [ ] **Test the failure path.** Temporarily break the Airtable key and confirm
      the fallback email address is shown and `[LEAD-NOT-DELIVERED]` appears in
      the logs with the full payload.
- [ ] **Set a recurring reminder to grep production logs for
      `[LEAD-NOT-DELIVERED]`.** It is the last place a lead can be recovered
      from, and it only helps if somebody looks.
- [ ] Confirm `/admin` is reachable with the password and unreachable without.
- [ ] Re-run the audits against the production deployment, not localhost:
      `audit:lighthouse`, `audit:axe`, `audit:keyboard`, `scripts/audit/csp.mjs`.
- [ ] Submit `sitemap.xml` to Google Search Console for all three locales.
- [ ] Confirm `/styleguide` and `/admin` are `noindex` in production.
- [ ] **Read every page on a mid-range Android on a slow connection**, which is
      how the buyer will actually see it.

---

# What on this site is still not real

Asked for plainly, answered plainly. Everything in this list is either a
placeholder, an absence, or a mechanism waiting for input.

### Numbers

**Every number on this site is a placeholder.** All 53 facts referenced by
public pages are `PLACEHOLDER`, rendering as an em dash. There is no throughput
figure, no uptime figure, no floor-space figure, no payback period, no market
size, no recyclate value. Nothing has been invented to fill a gap — which is
why the pages have visible dashes rather than plausible figures — but the
consequence is that **the site currently makes no quantitative claim at all.**

The ROI calculator is a working model with 9 of its 10 coefficients missing. It
reports that it cannot compute and names what it needs. It has never produced a
number.

The homepage counters do not animate, because `isCountable()` refuses a figure
without a value, a unit and a time basis.

### Traction

`pilots-signed` and `lois-signed` are placeholders. There is **no customer, no
logo, no testimonial, no case study and no named partner anywhere on this
site**, because none was supplied. The absence is honest; it is also the thing
an investor will read as "pre-traction".

### The team

Empty. `TEAM` and `ADVISORS` are both `[]`. The site names no people.

### Legal wording

The investor disclaimer and the investor-status declaration are placeholder
markers, not draft text. All four legal routes — privacy, terms, cookies,
investor disclaimer — are stub pages that state what the document will cover
and contain no actual terms. The consent checkbox is implemented, versioned and
stored correctly, and it points at a page that has not been written.

### Translations

Arabic and Romanian are **not translated**. Both files contain the English
strings prefixed with `[[AR]]` / `[[RO]]`. The RTL layout is real and works;
the words in it are English. 806 strings await a human.

### Images

There are none. No `public/` directory, no photograph of a machine, no favicon,
no logo. `/favicon.ico` 404s. The visual design is entirely type, colour and
structure — which is a defensible choice and also means **nobody visiting this
site has seen the product.**

### Company identity

Legal entity name, registration number, VAT number, registered address, contact
email and contact phone are all placeholders. The footer currently identifies
the company by trading name only.

### Deployment

**No preview URL exists.** This environment has no Vercel CLI and no Vercel
token, so no deployment was performed and none could be. Everything needed for
one is in place — the app deploys with no adapter and no `vercel.json`, and
`README.md` documents the variables and the procedure — but the deploy itself
has to be run by someone with credentials. Note that it will fail at `prebuild`
until the blocking items above are resolved, which is the intended behaviour.

### Performance

Lighthouse mobile performance, CLS and TBT meet their targets. **LCP does not
reliably meet the 2.5s target on simulated 4G** — it moves across runs and some
routes miss on some batches. That was reported with the measurements at the
time rather than rounded down, and it has not since been fixed.

### What _is_ real

So it is not all caveats — the following are built, tested and working:

- Both conversion paths, end to end: shared Zod validation, server actions,
  rate limiting, honeypot plus signed timing check, dual delivery, a durable
  success page with a reference code, and a failure state that gives a fallback
  address so a lead is never silently lost.
- The fact system and its three build gates, which have now been demonstrated
  to block a production build.
- The i18n routing and full RTL mirroring.
- Analytics with six events, each justified in `docs/analytics.md`, and an
  admin dashboard that reports its own missing credentials rather than showing
  zeroes.
- Accessibility: axe reports **0 violations** across every route, and both
  forms and the mobile menu pass a keyboard walkthrough.
- Security headers, verified served, with the CSP confirmed not to break
  analytics, Motion, the CSS entrances or the form POST.
- 404, 500 and root-level error pages, each routing back to a conversion path.

The machinery is finished. The content it exists to carry has not been
supplied.

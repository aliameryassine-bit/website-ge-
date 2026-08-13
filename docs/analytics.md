# Analytics

## What was chosen: Plausible

Plausible, proxied through our own domain at `/stats`, rather than Vercel
Analytics.

Both are cookieless and both would have worked. Three things decided it:

1. **Vercel Analytics only works on Vercel.** That is a hosting coupling for a
   site that may not stay there, and the analytics would go dark on the day it
   moves.
2. **Plausible can be self-hosted.** For a company whose own investor story is
   about owning its material flow data, sending visitor data to a third party it
   does not control is an avoidable inconsistency. Set `PLAUSIBLE_HOST` to a
   self-hosted instance and nothing else changes.
3. **Plausible has a shareable read-only dashboard.** That is how you show an
   investor traffic without handing over an account or exporting a screenshot
   they cannot verify.

The script is proxied rather than loaded from `plausible.io`. Content blockers
match on the third-party host, and blocked analytics under-reports precisely the
technical, privacy-minded audience that reads a page like this — the wrong bias
for numbers that end up in a deck. The proxy path is `/stats` rather than
`/analytics` or `/plausible`, because blocker lists match on the obvious names.

## Is a cookie banner required? No.

Not for this configuration, and the reasoning matters more than the answer,
because the answer changes the moment the configuration does.

**ePrivacy (the "cookie law")** requires consent to store or access information
on a device. Plausible does neither: no cookie, no `localStorage`, no
fingerprint, no persistent identifier of any kind. Nothing is stored, so
nothing is consented to.

**GDPR** requires a lawful basis to process personal data. Plausible does not
collect it — an IP address is hashed with a daily-rotating salt in memory, used
to deduplicate a visitor within a day, and never written down. There is no
personal data to have a basis for.

**This site does set one cookie: `gx_t`.** It is worth being explicit about,
because it is exactly the thing an audit finds and a "we use no cookies" claim
trips over. It is the anti-spam timing token issued by middleware, it holds a
signed timestamp and nothing else, and it exists to tell a person from a script.
Strictly necessary cookies — including those for fraud prevention and security —
are exempt from consent under ePrivacy Article 5(3). So it does not trigger a
banner either.

### What would change the answer

Add any of these and the banner comes back:

- a marketing or advertising pixel (Meta, LinkedIn, Google Ads) — all of them
  store identifiers;
- Google Analytics in any configuration;
- a session recorder or heatmap tool;
- an A/B testing tool that persists a variant assignment;
- any cookie that is not strictly necessary for a function the visitor asked
  for.

### Still required, banner or not

**Disclosure is not the same as consent.** The privacy policy must still say
that Plausible is used, what it collects, where it is hosted, and that no
personal data is processed — GDPR transparency obligations apply whether or not
consent is needed. `/legal/privacy` is currently a stub and this is one of the
things it has to cover.

None of the above is legal advice. It is an accurate description of what the
software does and how the exemptions read; a DPO should confirm it against the
final hosting arrangement, particularly if Plausible's EU cloud is used rather
than a self-hosted instance.

## Configuration

| Variable                       | Purpose                             | Without it                                    |
| ------------------------------ | ----------------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | The site as registered in Plausible | No script renders at all                      |
| `PLAUSIBLE_HOST`               | Self-hosted instance                | Falls back to `https://plausible.io`          |
| `PLAUSIBLE_API_KEY`            | Stats API, read-only                | The admin dashboard says which key is missing |
| `ADMIN_PASSWORD`               | Basic Auth on `/admin`              | `/admin` returns 503, not a public page       |

`NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is the only one that reaches the browser, and it
is a hostname, not a secret.

## The admin dashboard

`/admin`, HTTP Basic Auth in middleware, checked before locale routing so it is
never redirected to `/en/admin`.

Basic Auth is proportionate for an internal dashboard for a handful of people:
no session store, no login page, no JavaScript, and nothing half-built to get
wrong. Its limits, stated plainly: credentials ride on every request so it needs
HTTPS, there is no logout beyond closing the browser, and one shared password
means it cannot tell you who looked. That is fine here and would not be fine for
investor materials, which is why the data room uses signed, time-limited,
individually issued tokens instead.

It fails closed: with no `ADMIN_PASSWORD` set the route returns 503, not a
public page.

Every panel reports its own absence. If a credential is missing the section says
which one rather than rendering a zero — a zero reads as "nobody came", and
being wrong about that in front of an investor is worse than an empty panel
that explains itself.

/**
 * Stand-in for Resend, Airtable and Plausible, for end-to-end testing only.
 *
 * Speaks each API at its HTTP boundary and records every request, so tests
 * exercise the real delivery and analytics code — real fetch, real headers,
 * real body — without live accounts or real leads.
 */
import { createServer } from 'node:http';
import { writeFileSync } from 'node:fs';

const OUT = process.argv[2] ?? '.mock-apis.log.json';
const received = [];

/** Minimal Plausible script stub: defines the API the site calls. */
const PLAUSIBLE_SCRIPT = `
(function () {
  // The site installs a queue stub before this loads. Real Plausible REPLACES
  // it and drains the queue; a mock that defers to the stub with
  // \`window.plausible || ...\` silently swallows every queued call, which is
  // exactly what made the first run of this test report zero events.
  var queued = (window.plausible && window.plausible.q) || [];
  window.plausible = function () {
    var a = arguments;
    navigator.sendBeacon('/stats/event', JSON.stringify({
      n: a[0], u: location.href, p: (a[1] && a[1].props) || {}
    }));
  };
  for (var i = 0; i < queued.length; i++) window.plausible.apply(null, queued[i]);
})();
// Tagged events: click anything carrying plausible-event-name=... classes.
document.addEventListener('click', function (e) {
  var el = e.target.closest && e.target.closest('[class*="plausible-event-name="]');
  if (!el) return;
  var name = null, props = {};
  String(el.className).split(/\\s+/).forEach(function (c) {
    var m = /^plausible-event-(name|[a-z]+)=(.+)$/.exec(c);
    if (!m) return;
    if (m[1] === 'name') name = m[2]; else props[m[1]] = m[2];
  });
  if (name) window.plausible(name, { props: props });
});
window.plausible('pageview');
`;

createServer((req, res) => {
  let body = '';
  req.on('data', (c) => {
    body += c;
  });
  req.on('end', () => {
    if (req.url.includes('script') && req.url.endsWith('.js')) {
      res.writeHead(200, { 'content-type': 'application/javascript' });
      res.end(PLAUSIBLE_SCRIPT);
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      parsed = body;
    }
    received.push({ at: new Date().toISOString(), url: req.url, body: parsed });
    writeFileSync(OUT, JSON.stringify(received, null, 2));

    res.writeHead(200, { 'content-type': 'application/json' });
    if (req.url.startsWith('/emails')) {
      res.end(JSON.stringify({ id: `mock-email-${received.length}` }));
    } else if (req.url.includes('/api/event')) {
      res.end('ok');
    } else if (req.url.includes('/api/v2/query')) {
      // Plausible Stats API. Values are ARBITRARY STAND-INS chosen only to
      // exercise the rate arithmetic — they are not measurements of anything.
      const dim = (parsed.dimensions || [])[0];
      const rows =
        dim === 'event:props:choice'
          ? [
              { dimensions: ['retailer'], metrics: [214, 231] },
              { dimensions: ['investor'], metrics: [96, 103] },
            ]
          : dim === 'event:props:stores'
            ? [
                { dimensions: ['1'], metrics: [7, 7] },
                { dimensions: ['2-5'], metrics: [12, 13] },
                { dimensions: ['6-20'], metrics: [31, 34] },
                { dimensions: ['21-50'], metrics: [24, 26] },
                { dimensions: ['51-200'], metrics: [9, 9] },
              ]
            : dim === 'event:page'
              ? [
                  { dimensions: ['/'], metrics: [1420] },
                  { dimensions: ['/for-retailers'], metrics: [318] },
                  { dimensions: ['/investors'], metrics: [187] },
                  { dimensions: ['/technology'], metrics: [242] },
                ]
              : [
                  { dimensions: ['fork_selected'], metrics: [310, 334] },
                  { dimensions: ['roi_calculator_used'], metrics: [83, 89] },
                  { dimensions: ['pilot_form_started'], metrics: [64, 64] },
                  { dimensions: ['pilot_form_submitted'], metrics: [23, 23] },
                  { dimensions: ['data_room_access_requested'], metrics: [11, 11] },
                  { dimensions: ['technology_sequence_completed'], metrics: [46, 46] },
                ];
      res.end(JSON.stringify({ results: rows }));
    } else if (req.method === 'GET' && req.url.includes('/v0/')) {
      // A list read from the admin dashboard. The last record deliberately has
      // no `fields` key at all, which is what Airtable returns for a row whose
      // cells are all empty — and what crashed the panel before it was guarded.
      const dataRoom = req.url.includes('Data%20room');
      res.end(
        JSON.stringify({
          records: dataRoom
            ? [
                { id: 'rec1', fields: { Reference: 'GX-D-36GTV', Organisation: 'Nile Delta Ventures', 'Investor type': 'Venture capital', Country: 'Egypt', Name: 'Layla Haddad', Status: 'Awaiting review', 'Received at': '2026-08-13T15:06:37.190Z' } },
                { id: 'rec2', fields: { Reference: 'GX-D-UN9YG', Organisation: 'Cairo Angels', 'Investor type': 'Angel', Country: 'Egypt', Name: 'Omar Fahmy', Status: 'Granted', 'Received at': '2026-08-12T09:14:02.000Z' } },
                { id: 'rec3' },
              ]
            : [
                { id: 'rec4', fields: { Reference: 'GX-P-ZAQTA', Company: 'Seoudi Supermarket', Stores: 38, City: 'Cairo', Role: 'Head of Store Operations', Email: 'operations@seoudi.example', 'Received at': '2026-08-13T15:06:30.618Z' } },
                { id: 'rec5', fields: { Reference: 'GX-P-HCP2H', Company: 'Kazyon', Stores: 12, City: 'Giza', Role: 'Store Development', Email: 'ops@kazyon.example', 'Received at': '2026-08-11T11:02:00.000Z' } },
                { id: 'rec6' },
              ],
        }),
      );
    } else {
      res.end(JSON.stringify({ records: [{ id: `recMOCK${received.length}` }] }));
    }
  });
}).listen(4111, '127.0.0.1', () => console.log('mock APIs on 4111'));

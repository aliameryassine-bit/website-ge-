/** Stand-in for Resend and Airtable, for end-to-end testing only. */
import { createServer } from 'node:http';
import { writeFileSync } from 'node:fs';

const OUT = process.argv[2] ?? '.mock-apis.log.json';
const received = [];

createServer((req, res) => {
  let body = '';
  req.on('data', (c) => {
    body += c;
  });
  req.on('end', () => {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      parsed = body;
    }
    received.push({ at: new Date().toISOString(), url: req.url, body: parsed });
    writeFileSync(OUT, JSON.stringify(received, null, 2));
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(
      req.url.startsWith('/emails')
        ? JSON.stringify({ id: `mock-email-${received.length}` })
        : JSON.stringify({ records: [{ id: `recMOCK${received.length}` }] }),
    );
  });
}).listen(4111, '127.0.0.1', () => console.log('mock APIs on 4111'));

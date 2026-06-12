import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:5174/';
const outPath = process.argv[3] || '/tmp/screenshot.png';
const waitMs = Number(process.argv[4] || 500);

const browser = await chromium.launch();
const page = await browser.newContext({ viewport: { width: 1440, height: 900 } }).then((ctx) => ctx.newPage());

const errors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', (err) => errors.push(String(err)));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(waitMs);
await page.screenshot({ path: outPath });

console.log('Console errors:', errors.length ? errors : 'none');

await browser.close();

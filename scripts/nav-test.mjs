import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:5174/';

const browser = await chromium.launch();
const page = await browser.newContext({ viewport: { width: 1440, height: 900 } }).then((ctx) => ctx.newPage());

const errors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', (err) => errors.push(String(err)));

await page.goto(url, { waitUntil: 'networkidle' });
// Wait for the full slide-0 sequence to land on slide 1.
await page.waitForTimeout(12000);
await page.screenshot({ path: '/tmp/nav-1-title.png' });

await page.keyboard.press('ArrowRight');
await page.waitForTimeout(700);
await page.screenshot({ path: '/tmp/nav-2-groups.png' });

await page.keyboard.press('ArrowLeft');
await page.waitForTimeout(700);
await page.screenshot({ path: '/tmp/nav-3-back-title.png' });

console.log('Console errors:', errors.length ? errors : 'none');
await browser.close();

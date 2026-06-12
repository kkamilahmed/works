import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:5174/';
const targetSlide = Number(process.argv[3] || 1);
const outPath = process.argv[4] || '/tmp/slide.png';
const settleMs = Number(process.argv[5] || 1500);
const hoverSelector = process.argv[6];

const browser = await chromium.launch();
const page = await browser.newContext({ viewport: { width: 1440, height: 900 } }).then((ctx) => ctx.newPage());

const errors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', (err) => errors.push(String(err)));

await page.goto(url, { waitUntil: 'networkidle' });
// Wait for slide-0 sequence to land on slide 1.
await page.waitForTimeout(12000);

for (let i = 1; i <= targetSlide; i++) {
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(700);
}

await page.waitForTimeout(settleMs);

if (hoverSelector) {
  await page.hover(hoverSelector);
  await page.waitForTimeout(300);
}

await page.screenshot({ path: outPath });
console.log('Console errors:', errors.length ? errors : 'none');
await browser.close();

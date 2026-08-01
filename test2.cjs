const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  console.log("Navigating to explore");
  await page.click('a[href="/pt/explore"]');
  await new Promise(r => setTimeout(r, 2000));
  console.log("Done");
  await browser.close();
})();

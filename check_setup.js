import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  try {
    await page.goto('http://localhost:3000/partner/setup', { waitUntil: 'networkidle2' });
    const content = await page.evaluate(() => document.body.innerHTML);
    console.log('CONTENT START\n', content.substring(0, 500), '\nCONTENT END');
  } catch (e) {
    console.log('Error navigating:', e);
  }

  await browser.close();
})();

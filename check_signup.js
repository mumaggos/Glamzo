import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  try {
    await page.goto('http://localhost:3000/en/signup', { waitUntil: 'networkidle2' });
    console.log('Navigated to /en/signup');
  } catch (e) { console.log('Error navigating:', e); }
  await browser.close();
})();

const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('response', response => {
    if (response.status() >= 400 || response.headers()['content-type']?.includes('text/html')) {
       console.log('Status ' + response.status() + ' ' + response.url() + ' -> ' + response.headers()['content-type']);
    }
  });
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await browser.close();
})();

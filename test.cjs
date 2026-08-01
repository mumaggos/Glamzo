const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('response', response => {
    const type = response.headers()['content-type'] || '';
    const url = response.url();
    if (type.includes('text/html') && !url.endsWith('/') && !url.includes('localhost:3000') && !url.includes('google-analytics')) {
       console.log('HTML returned for URL:', url);
    }
    if (url.endsWith('.tsx') || url.endsWith('.ts') || url.endsWith('.js')) {
      if (type.includes('text/html')) {
        console.log('DANGER! HTML returned for script:', url);
      }
    }
  });
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  console.log("Done. Errors found:");
  await browser.close();
})();

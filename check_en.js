import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Force English language
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'language', { get: function() { return 'en-US'; } });
    Object.defineProperty(navigator, 'languages', { get: function() { return ['en-US', 'en']; } });
  });

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    console.log('Navigated to /');
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) { console.log('Error navigating:', e); }
  
  await browser.close();
})();

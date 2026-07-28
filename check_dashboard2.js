import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Fake login
  await page.evaluateOnNewDocument(() => {
    window.localStorage.setItem('supabase.auth.token', 'dummy');
  });

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    await page.goto('http://localhost:3000/en/partner/dashboard', { waitUntil: 'networkidle2' });
    console.log('Final URL:', page.url());
  } catch (e) { console.log('Error navigating:', e); }
  
  await browser.close();
})();

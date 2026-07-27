import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  // Let's inject a fake auth so we bypass the ProtectedRoute redirect
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      currentSession: {
        access_token: 'fake',
        user: { id: 'test', email: 'test@glamzo.pt', role: 'authenticated' }
      }
    }));
  });

  try {
    await page.goto('http://localhost:3000/partner/setup', { waitUntil: 'networkidle0' });
    const content = await page.evaluate(() => document.body.innerHTML);
    console.log('CONTENT START\n', content.substring(0, 500), '\nCONTENT END');
  } catch (e) {
    console.log('Error navigating:', e);
  }

  await browser.close();
})();

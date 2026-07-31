import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  await page.goto('http://localhost:3000/explore', { waitUntil: 'networkidle0' });
  const mapElement = await page.$('div[aria-label="Mapa"]');
  if (mapElement) {
    console.log("Map element found");
    const mapBox = await mapElement.boundingBox();
    console.log("Map Box:", mapBox);
  } else {
    console.log("Map element NOT found");
  }
  await browser.close();
})();

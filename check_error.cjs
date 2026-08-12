const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', err => {
    console.log('PAGE CRASH:', err.message);
  });
  
  await page.goto('http://localhost:8443/gambaran-umum', { waitUntil: 'networkidle' });
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();

const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', exception => {
    console.log(`Uncaught exception: "${exception}"`);
    console.log(exception.stack);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text());
    }
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  } catch (e) {
    console.error('Error navigating:', e);
  }
  
  await browser.close();
})();

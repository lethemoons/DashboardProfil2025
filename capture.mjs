import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const OUT_DIR = 'd:/dashboard_dinkes/public/screenshots';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] 
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Beranda Hero
  console.log('Capturing Beranda Hero...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, 'beranda_hero.png') });

  // 2. Sidebar & Topbar (Navigating to Gambaran Umum)
  console.log('Capturing Sidebar & Topbar...');
  // Click on 'Gambaran Umum' in sidebar
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('aside button'));
    const gambaran = btns.find(b => b.textContent.includes('Gambaran Umum'));
    if (gambaran) gambaran.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  
  // Crop Topbar
  const topbar = await page.$('header');
  if (topbar) await topbar.screenshot({ path: path.join(OUT_DIR, 'filter_topbar.png') });
  
  // Crop Sidebar
  const sidebar = await page.$('aside');
  if (sidebar) await sidebar.screenshot({ path: path.join(OUT_DIR, 'sidebar.png') });

  // 3. Map Example
  const mapElement = await page.$('.leaflet-container');
  if (mapElement) {
    // take screenshot of the parent container
    const mapParent = await mapElement.evaluateHandle(el => el.parentElement.parentElement);
    await mapParent.screenshot({ path: path.join(OUT_DIR, 'map_example.png') });
  }

  // 4. Navigate to Kesehatan Lingkungan to get KPIs, Chart, Crosstab, Clustering
  console.log('Capturing Health Environment (KPI, Chart, Crosstab, Clustering)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('aside button'));
    const env = btns.find(b => b.textContent.includes('Kesehatan Lingkungan'));
    if (env) env.click();
  });
  await new Promise(r => setTimeout(r, 3000));

  // Screenshot KPI container (grid with 6 cards)
  const kpiContainer = await page.$('main > div > div.grid.grid-cols-2');
  if (kpiContainer) await kpiContainer.screenshot({ path: path.join(OUT_DIR, 'kpi_cards.png') });

  // Screenshot Chart (first bar chart)
  const chartContainer = await page.$('.recharts-responsive-container');
  if (chartContainer) {
    const chartParent = await chartContainer.evaluateHandle(el => el.parentElement.parentElement.parentElement);
    await chartParent.screenshot({ path: path.join(OUT_DIR, 'chart_example.png') });
  }

  // Screenshot Crosstab
  const crosstabHeader = await page.evaluateHandle(() => {
    const h3s = Array.from(document.querySelectorAll('h3'));
    return h3s.find(h => h.textContent.includes('Crosstab'))?.parentElement?.parentElement;
  });
  if (crosstabHeader) {
     await crosstabHeader.screenshot({ path: path.join(OUT_DIR, 'crosstab.png') });
  }

  // Screenshot Clustering
  const clusteringHeader = await page.evaluateHandle(() => {
    const h3s = Array.from(document.querySelectorAll('h3'));
    return h3s.find(h => h.textContent.includes('Klasterisasi'))?.parentElement;
  });
  if (clusteringHeader) {
     await clusteringHeader.screenshot({ path: path.join(OUT_DIR, 'clustering.png') });
  }

  // 5. Navigate to Admin
  console.log('Capturing Admin Login...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('aside button'));
    const admin = btns.find(b => b.textContent.includes('Admin Dashboard'));
    if (admin) admin.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, 'admin_login.png') });

  // 6. Login as Admin
  console.log('Capturing Admin Dashboard...');
  await page.type('input[type="text"]', 'admin');
  await page.type('input[type="password"]', 'admin123'); // assuming standard login
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: path.join(OUT_DIR, 'admin_dashboard.png') });
  
  // Show Upload Data block
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const uploadBtn = btns.find(b => b.textContent.includes('Unggah Data'));
    if (uploadBtn) uploadBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  const topButtons = await page.$('main > div > div.flex.justify-end.gap-3');
  if (topButtons) await topButtons.screenshot({ path: path.join(OUT_DIR, 'admin_actions.png') });

  await browser.close();
  console.log('Done!');
}

capture().catch(console.error);

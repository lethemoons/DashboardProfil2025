import puppeteer from 'puppeteer';
import path from 'path';

async function generate() {
  console.log('Launching browser for PDF generation...');
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] 
  });
  const page = await browser.newPage();
  
  // PDF 1: Guest
  console.log('Generating Guest Manual...');
  await page.goto(`file://${path.resolve('d:/dashboard_dinkes/manual_guest.html')}`, { waitUntil: 'networkidle0' });
  await page.pdf({ 
    path: 'd:/dashboard_dinkes/Panduan_User_Penggunaan_Dashboard_Profil_Kesehatan_Jawa_Timur.pdf', 
    format: 'A4', 
    printBackground: true 
  });

  // PDF 2: Admin
  console.log('Generating Admin Manual...');
  await page.goto(`file://${path.resolve('d:/dashboard_dinkes/manual_admin.html')}`, { waitUntil: 'networkidle0' });
  await page.pdf({ 
    path: 'd:/dashboard_dinkes/Panduan_Admin_Pengelolaan_Dashboard_Profil_Kesehatan_Jawa_Timur.pdf', 
    format: 'A4', 
    printBackground: true 
  });

  await browser.close();
  console.log('PDF generation done!');
}

generate().catch(console.error);

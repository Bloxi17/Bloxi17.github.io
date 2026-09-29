import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, 'showcase_assets', 'screenshots');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function capture() {
  console.log('🚀 Launching Chrome to capture high-res portfolio screenshots...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist']
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2 // High-DPI Retina
  });

  console.log('🌐 Loading https://bloxi17.github.io ...');
  await page.goto('https://bloxi17.github.io', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  // 1. Capture Welcome Screen (Void / Black Hole / Endurance Ship)
  console.log('📸 1. Capturing Welcome Void & Black Hole...');
  await page.screenshot({
    path: path.join(outputDir, '01_welcome_void_screen.png'),
    clip: { x: 0, y: 0, width: 1920, height: 1080 }
  });

  // 2. Click to initialize and trigger warp transition
  console.log('🖱️ Clicking to trigger warp animation and enter portfolio...');
  await page.click('body');
  await new Promise(r => setTimeout(r, 4500)); // wait for warp transition

  // 3. Capture About the Architect & Status
  console.log('📸 2. Capturing About the Architect & Accepting Missions status...');
  await page.screenshot({
    path: path.join(outputDir, '02_about_architect_status.png'),
    clip: { x: 0, y: 0, width: 1920, height: 1080 }
  });

  // 4. Scroll down to Mission Briefings
  console.log('📸 3. Capturing Mission Briefings & Selected Work...');
  await page.evaluate(() => {
    const el = document.querySelector('.stamp-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({
    path: path.join(outputDir, '03_mission_briefings_cards.png'),
    clip: { x: 0, y: 0, width: 1920, height: 1080 }
  });

  // 5. Scroll further down to Lab / Interactive Playground if available
  console.log('📸 4. Capturing Full Interior View...');
  await page.evaluate(() => {
    window.scrollBy({ top: 900, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({
    path: path.join(outputDir, '04_deep_interior_portfolio.png'),
    clip: { x: 0, y: 0, width: 1920, height: 1080 }
  });

  // 6. Bonus: Open Voyager 1 Interactive Documentary
  const voyagerHtmlPath = 'file:///' + path.join(__dirname, 'Voyager-Interactive', 'index.html').replace(/\\/g, '/');
  console.log('🛸 Navigating to Voyager-Interactive at:', voyagerHtmlPath);
  try {
    await page.goto(voyagerHtmlPath, { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 4000));
    console.log('📸 5. Capturing Voyager 1 Interactive Experience...');
    await page.screenshot({
      path: path.join(outputDir, '05_voyager_interactive_screen.png'),
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
  } catch (e) {
    console.warn('Voyager local load notice:', e.message);
  }

  await browser.close();
  console.log('✅ Complete portfolio showcase screenshots captured in:', outputDir);
}

capture().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

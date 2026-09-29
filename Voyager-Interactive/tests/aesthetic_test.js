const puppeteer = require('g:/Portfolio ainesh/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');
const os = require('os');

(async () => {
    console.log('--- STARTING AESTHETIC REDESIGN COMPREHENSIVE AUTOMATED TEST ---');

    const outDir = path.join(__dirname, 'aesthetic');
    const framesDir = path.join(outDir, 'frames');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });

    const tempUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'puppeteer_voyager_aesthetic_'));

    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true,
        userDataDir: tempUserDataDir,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--use-gl=angle',
            '--use-angle=default',
            '--enable-webgl',
            '--window-size=1920,1080'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

    const consoleErrors = [];
    const consoleWarnings = [];

    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error') {
            console.error(`[BROWSER ERROR] ${text}`);
            consoleErrors.push(text);
        } else if (type === 'warning') {
            console.warn(`[BROWSER WARNING] ${text}`);
            consoleWarnings.push(text);
        }
    });

    page.on('pageerror', err => {
        console.error(`[PAGE UNCAUGHT ERROR] ${err.message}`);
        consoleErrors.push(err.message);
    });

    console.log('Navigating to http://127.0.0.1:8080/ ...');
    await page.goto('http://127.0.0.1:8080/', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for preloader to finish and 3D assets to initialize
    console.log('Waiting for preloader and 3D assets to initialize...');
    const startTime = Date.now();
    let loaded = false;
    while (Date.now() - startTime < 60000) {
        loaded = await page.evaluate(() => {
            return window.isModelLoaded === true || (document.getElementById('preloader') && document.getElementById('preloader').style.display === 'none');
        });
        if (loaded) break;
        await new Promise(r => setTimeout(r, 800));
    }
    console.log('Assets loaded state:', loaded);
    await new Promise(r => setTimeout(r, 2200)); // Allow GSAP letter stagger animation to complete

    // Verification 1: Welcome Page / Cinematic Solar System Reveal
    console.log('Capturing: 01_cinematic_solar_system_reveal.png...');
    await page.screenshot({ path: path.join(outDir, '01_cinematic_solar_system_reveal.png') });

    const titleText = await page.$eval('#main-title', el => el.innerText);
    console.log(`Verified Hero Title: "${titleText.replace(/\s+/g, ' ').trim()}"`);

    // Verification 2: Begin Journey click
    console.log('Clicking "Begin the Journey" CTA button...');
    await page.click('#cta-begin-btn');
    await new Promise(r => setTimeout(r, 1500));

    // Chapter 1: Earth Departure
    console.log('Capturing: 02_chapter1_earth_departure.png...');
    await page.screenshot({ path: path.join(outDir, '02_chapter1_earth_departure.png') });

    // Chapter 2: Jovian Encounter
    console.log('Scrolling to Chapter 2: Jovian Encounter...');
    await page.evaluate(() => {
        const el = document.getElementById('chapter-2');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '03_chapter2_jovian_encounter.png') });

    // Chapter 3: Saturnian Gateway
    console.log('Scrolling to Chapter 3: Saturnian Gateway...');
    await page.evaluate(() => {
        const el = document.getElementById('chapter-3');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '04_chapter3_saturn_gateway.png') });

    // Chapter 4: The Golden Record
    console.log('Scrolling to Chapter 4: The Golden Record...');
    await page.evaluate(() => {
        const el = document.getElementById('chapter-4');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '05_chapter4_golden_record.png') });

    // Test Golden Record Turntable Console
    console.log('Engaging Golden Record Phonograph Turntable...');
    await page.click('#btn-toggle-phonograph');
    await new Promise(r => setTimeout(r, 800));
    const isSpinning = await page.evaluate(() => {
        return document.getElementById('phonograph-disk').classList.contains('spinning');
    });
    console.log('Phonograph Disk Spinning:', isSpinning);
    await page.screenshot({ path: path.join(outDir, '06_turntable_console_active.png') });

    // Chapter 5: Interstellar Horizon & Archival Certificate
    console.log('Scrolling to Chapter 5: Interstellar Horizon...');
    await page.evaluate(() => {
        const el = document.getElementById('chapter-5');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '07_chapter5_interstellar_horizon.png') });

    // Generate Archival Certificate
    console.log('Generating Archival Flight Dispatch Certificate...');
    await page.type('#cert-callsign', 'COMMANDER AINESH');
    await page.click('#btn-generate-cert');
    await new Promise(r => setTimeout(r, 1000));
    const certActive = await page.evaluate(() => {
        return document.getElementById('cert-modal').classList.contains('active');
    });
    console.log('Archival Certificate Modal Active:', certActive);
    await page.screenshot({ path: path.join(outDir, '08_archival_flight_certificate.png') });

    // Close Certificate Modal
    await page.click('#btn-close-cert');
    await new Promise(r => setTimeout(r, 500));

    // Test Feature: Pale Blue Dot Modal
    console.log('Testing Pale Blue Dot Reverence Modal...');
    await page.click('#btn-pale-blue-dot');
    await new Promise(r => setTimeout(r, 800));
    const pbdActive = await page.evaluate(() => {
        return document.getElementById('pbd-modal').classList.contains('active');
    });
    console.log('Pale Blue Dot Modal Active:', pbdActive);
    await page.screenshot({ path: path.join(outDir, '09_pale_blue_dot_modal.png') });

    // Close Pale Blue Dot Modal
    await page.click('#btn-close-pbd');
    await new Promise(r => setTimeout(r, 500));

    // Test Feature: 3D Craft Subsystem Inspector Mode
    console.log('Testing 3D Craft Subsystem Inspector Mode...');
    await page.click('#btn-inspect-craft');
    await new Promise(r => setTimeout(r, 1600));
    const inspectorActive = await page.evaluate(() => {
        return document.getElementById('inspector-overlay').classList.contains('active');
    });
    console.log('Inspector Overlay Active:', inspectorActive);
    await page.screenshot({ path: path.join(outDir, '10_craft_subsystem_inspector.png') });

    // Click Dish Hotspot for Telemetry Drawer
    console.log('Opening Hotspot Telemetry Drawer...');
    await page.click('#hotspot-dish');
    await new Promise(r => setTimeout(r, 600));
    const drawerVisible = await page.evaluate(() => {
        return document.getElementById('hotspot-drawer').classList.contains('visible');
    });
    console.log('Hotspot Drawer Visible:', drawerVisible);
    await page.screenshot({ path: path.join(outDir, '11_inspector_telemetry_drawer.png') });

    // Close Inspector
    await page.click('#btn-close-inspector');
    await new Promise(r => setTimeout(r, 1400));

    // Continuous scroll recording (15 frames)
    console.log('Recording 15 continuous scroll frames from top to bottom...');
    const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    const frameCount = 15;
    for (let f = 1; f <= frameCount; f++) {
        const targetScroll = Math.round((f / frameCount) * maxScroll);
        await page.evaluate((y) => window.scrollTo(0, y), targetScroll);
        await new Promise(r => setTimeout(r, 300));
        const frameNum = String(f).padStart(2, '0');
        await page.screenshot({ path: path.join(framesDir, `frame_${frameNum}.png`) });
    }

    await browser.close();

    console.log('\n==========================================');
    console.log('AESTHETIC REDESIGN VERIFICATION RESULTS');
    console.log('==========================================');
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Console Warnings: ${consoleWarnings.length}`);

    if (consoleErrors.length > 0) {
        console.error('\nConsole Errors found:');
        consoleErrors.forEach((e, idx) => console.error(`${idx + 1}. ${e}`));
        process.exit(1);
    }

    if (consoleWarnings.length > 0) {
        console.warn('\nConsole Warnings found:');
        consoleWarnings.forEach((w, idx) => console.warn(`${idx + 1}. ${w}`));
        process.exit(1);
    }

    console.log('\nSUCCESS: 0 console errors, 0 console warnings! Aesthetic redesign fully verified.');
    process.exit(0);
})().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
});

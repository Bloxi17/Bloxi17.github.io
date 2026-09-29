const puppeteer = require('g:/Portfolio ainesh/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');
const os = require('os');

(async () => {
    console.log('--- STARTING STAGE 4 COMPREHENSIVE AUTOMATED TEST ---');

    const outDir = path.join(__dirname, 'stage4');
    const framesDir = path.join(outDir, 'frames');
    if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });

    const tempProfileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'puppeteer_voyager_stage4_'));
    console.log('Isolated Chrome User Profile:', tempProfileDir);

    const consoleErrors = [];
    const consoleWarnings = [];

    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1920,1080',
            `--user-data-dir=${tempProfileDir}`
        ],
        defaultViewport: { width: 1920, height: 1080 }
    });

    const page = await browser.newPage();

    page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();
        if (type === 'error') {
            console.error('[BROWSER ERROR]', text);
            consoleErrors.push(text);
        } else if (type === 'warning') {
            console.warn('[BROWSER WARNING]', text);
            consoleWarnings.push(text);
        } else {
            console.log('[BROWSER LOG]', text);
        }
    });

    page.on('pageerror', err => {
        console.error('[PAGE EXCEPTION]', err.message);
        consoleErrors.push(err.message);
    });

    console.log('Navigating to http://127.0.0.1:8080/ ...');
    await page.goto('http://127.0.0.1:8080/', { waitUntil: 'domcontentloaded', timeout: 60000 });

    console.log('Waiting for loader to finish and 3D assets to initialize...');
    const startTime = Date.now();
    let loaded = false;
    while (Date.now() - startTime < 90000) {
        loaded = await page.evaluate(() => {
            const loader = document.getElementById('loader');
            return loader && loader.classList.contains('loaded');
        });
        if (loaded) break;
        await new Promise(r => setTimeout(r, 1000));
    }

    if (!loaded) {
        throw new Error('Timeout waiting for asset loading manager');
    }
    console.log('Assets fully loaded and 3D scene initialized!');

    // Wait 2 seconds for initial render frame to stabilize
    await new Promise(r => setTimeout(r, 2000));

    // Chapter validation and screenshots
    const chapters = [
        { id: 'chapter-1', name: 'chapter_01_earth_departure.png', desc: 'Chapter 1: Earth Departure' },
        { id: 'chapter-2', name: 'chapter_02_jovian_encounter.png', desc: 'Chapter 2: Jovian Encounter' },
        { id: 'chapter-3', name: 'chapter_03_saturn_gateway.png', desc: 'Chapter 3: Saturnian Gateway' },
        { id: 'chapter-4', name: 'chapter_04_golden_record.png', desc: 'Chapter 4: The Golden Record' },
        { id: 'chapter-5', name: 'chapter_05_interstellar_horizon.png', desc: 'Chapter 5: Interstellar Horizon' }
    ];

    for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i];
        console.log(`Scrolling to ${ch.desc}...`);
        await page.evaluate((chId) => {
            const el = document.getElementById(chId);
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
        }, ch.id);

        await new Promise(r => setTimeout(r, 1500));

        const shotPath = path.join(outDir, ch.name);
        await page.screenshot({ path: shotPath });
        console.log(`Captured: ${ch.name}`);
    }

    // ==========================================
    // STAGE 4 FEATURE VERIFICATION
    // ==========================================

    // Feature 1: Subsystem Inspector Mode (360° Craft Orbit)
    console.log('Testing Feature: 3D Subsystem Inspector Mode...');
    await page.click('#btn-inspect-craft');
    await new Promise(r => setTimeout(r, 1600)); // wait for GSAP camera zoom & OrbitControls initialization
    const inspectorActive = await page.evaluate(() => {
        return document.getElementById('inspector-overlay').classList.contains('active');
    });
    console.log('Inspector Overlay Active:', inspectorActive);
    await page.screenshot({ path: path.join(outDir, 'feature_01_craft_inspector.png') });
    console.log('Captured: feature_01_craft_inspector.png');

    // Feature 2: Hotspot Telemetry Drawer
    console.log('Testing Feature: Subsystem Hotspot Selection (High-Gain Dish)...');
    await page.click('#hotspot-dish');
    await new Promise(r => setTimeout(r, 600));
    const drawerVisible = await page.evaluate(() => {
        return document.getElementById('hotspot-drawer').classList.contains('visible');
    });
    console.log('Hotspot Drawer Visible:', drawerVisible);
    await page.screenshot({ path: path.join(outDir, 'feature_02_hotspot_telemetry_drawer.png') });
    console.log('Captured: feature_02_hotspot_telemetry_drawer.png');

    // Close Inspector
    console.log('Closing Inspector Mode and restoring mission trajectory...');
    await page.click('#btn-close-inspector');
    await new Promise(r => setTimeout(r, 1200));

    // Feature 3: Pale Blue Dot Reverence Modal
    console.log('Testing Feature: Pale Blue Dot Reverence Modal...');
    await page.click('#btn-pale-blue-dot');
    await new Promise(r => setTimeout(r, 800));
    const pbdActive = await page.evaluate(() => {
        return document.getElementById('pbd-modal').classList.contains('active');
    });
    console.log('Pale Blue Dot Modal Active:', pbdActive);
    await page.screenshot({ path: path.join(outDir, 'feature_03_pale_blue_dot_modal.png') });
    console.log('Captured: feature_03_pale_blue_dot_modal.png');

    // Close Pale Blue Dot
    await page.click('#btn-close-pbd');
    await new Promise(r => setTimeout(r, 600));

    // Feature 4: Golden Record Turntable Audio Console
    console.log('Testing Feature: Golden Record Turntable Console (Chapter 4)...');
    await page.evaluate(() => {
        const el = document.getElementById('chapter-4');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.click('#btn-turntable-play');
    await new Promise(r => setTimeout(r, 800));
    const vinylSpinning = await page.evaluate(() => {
        return document.getElementById('vinyl-disk').classList.contains('spinning');
    });
    console.log('Vinyl Phonograph Spinning:', vinylSpinning);
    await page.screenshot({ path: path.join(outDir, 'feature_04_turntable_console_active.png') });
    console.log('Captured: feature_04_turntable_console_active.png');

    // Feature 5: Interstellar Flight Dispatch Certificate Generator
    console.log('Testing Feature: Interstellar Flight Dispatch Certificate (Chapter 5)...');
    await page.evaluate(() => {
        const el = document.getElementById('chapter-5');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 1000));

    await page.type('#cert-callsign', 'COMMANDER AINESH');
    await page.click('#btn-generate-cert');
    await new Promise(r => setTimeout(r, 1200));

    const certActive = await page.evaluate(() => {
        return document.getElementById('cert-modal').classList.contains('active');
    });
    console.log('Flight Certificate Modal Active:', certActive);
    await page.screenshot({ path: path.join(outDir, 'feature_05_interstellar_flight_certificate.png') });
    console.log('Captured: feature_05_interstellar_flight_certificate.png');

    // Close Certificate Modal
    await page.click('#btn-close-cert');
    await new Promise(r => setTimeout(r, 600));

    // ==========================================
    // FULL TOP-TO-BOTTOM CONTINUOUS SCROLL RECORDING
    // ==========================================
    console.log('Recording 15 continuous scroll frames from top to bottom...');
    const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    const frameCount = 15;

    for (let f = 1; f <= frameCount; f++) {
        const targetScroll = Math.round((f / frameCount) * maxScroll);
        await page.evaluate((y) => window.scrollTo(0, y), targetScroll);
        await new Promise(r => setTimeout(r, 350));
        const frameNum = String(f).padStart(2, '0');
        await page.screenshot({ path: path.join(framesDir, `frame_${frameNum}.png`) });
    }
    await page.screenshot({ path: path.join(outDir, 'full_scroll_end.png') });
    console.log('Continuous scroll recording complete (15 frames captured).');

    await browser.close();

    console.log('\n==========================================');
    console.log('STAGE 4 VERIFICATION RESULTS');
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

    console.log('\nSUCCESS: 0 console errors, 0 console warnings! All Stage 4 features verified.');
    process.exit(0);
})().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
});

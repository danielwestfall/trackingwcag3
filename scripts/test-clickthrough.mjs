import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const DIST_CLIENT = path.join(process.cwd(), 'dist', 'client');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

const server = http.createServer((req, res) => {
  let p = path.join(DIST_CLIENT, req.url.split('?')[0]);
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (fs.existsSync(p) && !fs.statSync(p).isDirectory()) {
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'text/plain' });
    fs.createReadStream(p).pipe(res);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`\n========================================================`);
  console.log(`🌐 LIVE BROWSER CLICK-THROUGH TEST`);
  console.log(`   Server: ${baseUrl}`);
  console.log(`========================================================\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const runtimeErrors = [];
  page.on('pageerror', err => {
    console.error(`   ❌ [PAGE ERROR]: ${err.message}`);
    runtimeErrors.push(err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`   ⚠️ [CONSOLE ERROR]: ${msg.text()}`);
      runtimeErrors.push(msg.text());
    }
  });

  // 1. Home Page Check
  console.log(`👉 Testing Home Page (/)...\n`);
  await page.goto(`${baseUrl}/`);
  await page.waitForLoadState('networkidle');
  const title = await page.title();
  console.log(`   • Title: "${title}"`);

  // Test theme toggle on home page
  const themeBtn = page.locator('#theme-toggle, .theme-toggle, [aria-label*="theme"]').first();
  if (await themeBtn.isVisible()) {
    await themeBtn.click();
    const themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    console.log(`   • Theme toggle clicked. Active data-theme: "${themeAttr}"`);
  }

  // 2. Patterns Page (Deep interaction tests)
  console.log(`\n👉 Testing Patterns Explorer (/plain-english/patterns/)...\n`);
  await page.goto(`${baseUrl}/plain-english/patterns/`);
  await page.waitForLoadState('networkidle');

  // Test category filter pills
  const catPills = page.locator('#category-pills .filter-pill');
  const catCount = await catPills.count();
  console.log(`   • Found ${catCount} category filter pills`);
  if (catCount > 2) {
    await catPills.nth(1).click();
    await page.waitForTimeout(100);
    const visibleCards1 = await page.locator('.pattern-card:not([hidden])').count();
    console.log(`   • Clicked 2nd category pill. Visible cards: ${visibleCards1}`);
    await catPills.first().click(); // reset to all
  }

  // Test verdict filter pills
  const verdictPills = page.locator('#verdict-pills .filter-pill');
  const verdCount = await verdictPills.count();
  console.log(`   • Found ${verdCount} verdict filter pills`);
  if (verdCount > 2) {
    await verdictPills.nth(1).click();
    await page.waitForTimeout(100);
    const visibleCards2 = await page.locator('.pattern-card:not([hidden])').count();
    console.log(`   • Clicked Native Preferred pill. Visible cards: ${visibleCards2}`);
    await verdictPills.first().click(); // reset to all
  }

  // Test Search Box
  const patternSearch = page.locator('#pattern-search');
  if (await patternSearch.isVisible()) {
    await patternSearch.fill('dialog');
    await page.waitForTimeout(100);
    const visibleCards3 = await page.locator('.pattern-card:not([hidden])').count();
    console.log(`   • Searched "dialog". Matching cards: ${visibleCards3}`);
    const clearBtn = page.locator('#search-clear-btn');
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      console.log(`   • Cleared search via clear button`);
    }
  }

  // Test Interactive Dialog in Sandbox
  const openDlgBtn = page.locator('#btn-open-sem-dialog');
  if (await openDlgBtn.isVisible()) {
    await openDlgBtn.click();
    const semDialog = page.locator('#native-dialog-el');
    const isModalOpen = await semDialog.evaluate(el => el.open);
    console.log(`   • Opened native <dialog>. open = ${isModalOpen}`);
    const cancelDlgBtn = page.locator('#sem-dlg-cancel');
    await cancelDlgBtn.click();
    const isModalClosed = await semDialog.evaluate(el => el.open);
    console.log(`   • Clicked Cancel. open = ${isModalClosed}`);
  }

  // Test Popover API menu
  const popoverBtn = page.locator('#btn-sem-popover-menu');
  if (await popoverBtn.isVisible()) {
    await popoverBtn.click();
    const popoverBox = page.locator('#sem-popover-menu');
    const isPopoverOpen = await popoverBox.evaluate(el => el.matches(':popover-open'));
    console.log(`   • Opened Popover API menu. :popover-open = ${isPopoverOpen}`);
    await page.keyboard.press('Escape');
    const isPopoverClosed = await popoverBox.evaluate(el => el.matches(':popover-open'));
    console.log(`   • Pressed Escape. :popover-open = ${isPopoverClosed}`);
  }

  // Test Switch toggle
  const switchWidget = page.locator('#sem-switch-widget');
  if (await switchWidget.isVisible()) {
    const checkedBefore = await switchWidget.isChecked();
    await switchWidget.click();
    const checkedAfter = await switchWidget.isChecked();
    console.log(`   • Toggled Switch: ${checkedBefore} -> ${checkedAfter}`);
  }

  // Test Inspector Tabs & Copy Code
  const firstInspTab = page.locator('.insp-tab').nth(1);
  if (await firstInspTab.isVisible()) {
    await firstInspTab.click();
    const isTabActive = await firstInspTab.evaluate(el => el.classList.contains('active'));
    console.log(`   • Clicked inspector tab. Active = ${isTabActive}`);
  }
  const copyBtn = page.locator('.copy-code-btn').first();
  if (await copyBtn.isVisible()) {
    await copyBtn.click();
    const copyText = await copyBtn.textContent();
    console.log(`   • Clicked Copy Code button. Status text: "${copyText?.trim()}"`);
  }

  // 3. WCAG 3 Explorer Page (/plain-english/)
  console.log(`\n👉 Testing WCAG 3 Explorer (/plain-english/)...\n`);
  await page.goto(`${baseUrl}/plain-english/`);
  await page.waitForLoadState('networkidle');

  // Test Quick Nav (TOC) Drawer
  const tocBtn = page.locator('#toc-toggle-btn');
  const tocDrawer = page.locator('#toc-drawer');
  if (await tocBtn.isVisible()) {
    await tocBtn.click();
    const isDrawerOpen = await tocDrawer.evaluate(el => !el.hidden);
    console.log(`   • Clicked Quick Nav (TOC) button. Drawer visible = ${isDrawerOpen}`);
    const tocCloseBtn = page.locator('#toc-close-btn');
    await tocCloseBtn.click();
    const isDrawerHidden = await tocDrawer.evaluate(el => el.hidden);
    console.log(`   • Clicked TOC Close button. Drawer hidden = ${isDrawerHidden}`);
  }

  // Test Live Search & WCAG 2.2 Matching Section
  const mainSearch = page.locator('#search-input');
  if (await mainSearch.isVisible()) {
    await mainSearch.fill('contrast');
    await page.waitForTimeout(150);
    const wcag22MatchSection = page.locator('#wcag22-matches-section');
    const isMatchVisible = await wcag22MatchSection.evaluate(el => !el.hidden);
    const matchCards = await page.locator('.wcag22-match-card').count();
    console.log(`   • Searched "contrast". WCAG 2.2 Match Section visible = ${isMatchVisible} (${matchCards} matching SC cards)`);
    await mainSearch.fill('');
    await page.waitForTimeout(100);
  }

  // Test Requirement Type Pills
  const typePills = page.locator('#type-pills .type-pill');
  if (await typePills.count() > 1) {
    await typePills.nth(1).click();
    await page.waitForTimeout(100);
    const provCount = await page.locator('.provision-card:not([hidden])').count();
    console.log(`   • Clicked Core requirement pill. Visible provisions = ${provCount}`);
    await typePills.first().click(); // reset to all
  }

  // 4. Old vs New Evolution Matrix (/plain-english/comparison/)
  console.log(`\n👉 Testing Old vs New Evolution Matrix (/plain-english/comparison/)...\n`);
  await page.goto(`${baseUrl}/plain-english/comparison/`);
  await page.waitForLoadState('networkidle');

  const matrixRows = await page.locator('.matrix-row').count();
  console.log(`   • Rendered ${matrixRows} WCAG 2.2 criteria rows`);

  // Test Level Filter
  const levelAAPill = page.locator('#level-pills [data-level="AA"]');
  if (await levelAAPill.isVisible()) {
    await levelAAPill.click();
    await page.waitForTimeout(100);
    const aaRows = await page.locator('.matrix-row:not([hidden])').count();
    console.log(`   • Filtered by Level AA. Visible criteria: ${aaRows}`);
    await page.locator('#level-pills [data-level="all"]').click();
  }

  // Test Evolution Type Filter
  const successorPill = page.locator('#type-pills [data-type="successor"]');
  if (await successorPill.isVisible()) {
    await successorPill.click();
    await page.waitForTimeout(100);
    const succRows = await page.locator('.matrix-row:not([hidden])').count();
    console.log(`   • Filtered by "Successor". Visible criteria: ${succRows}`);
    await page.locator('#type-pills [data-type="all"]').click();
  }

  // 5. Check Navigation to a Detail Guide
  console.log(`\n👉 Testing Detail Provision Guide (/plain-english/provision/audio-shifting-adjustable/)...\n`);
  await page.goto(`${baseUrl}/plain-english/provision/audio-shifting-adjustable/`);
  await page.waitForLoadState('networkidle');
  const provHeading = await page.locator('h1').textContent();
  console.log(`   • Provision Page H1: "${provHeading?.trim()}"`);

  console.log(`\n========================================================`);
  console.log(`🏁 CLICK-THROUGH TEST COMPLETE`);
  console.log(`   Runtime errors / warnings: ${runtimeErrors.length}`);
  console.log(`========================================================\n`);

  await browser.close();
  server.close();

  if (runtimeErrors.length > 0) {
    process.exit(1);
  }
});

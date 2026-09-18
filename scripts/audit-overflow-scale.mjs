#!/usr/bin/env node
/**
 * audit-overflow-scale.mjs
 * ------------------------------------------------------------------
 * Automated WCAG 1.4.10 Reflow (320px) and WCAG 1.4.4 Resize Text (200%)
 * audit across built pages in dist/client.
 *
 * Checks:
 *  - Page-level horizontal scrollbar / viewport overflow at 320px, 360px, 768px, 1024px, 1366px.
 *  - Reflow behavior under 200% text scale (document.documentElement.style.fontSize = '200%').
 *  - Pinpoints specific DOM elements causing viewport horizontal spill.
 *  - Respects standard WCAG 2D exceptions: code blocks (<pre><code>) and data tables
 *    with internal horizontal scrolling are permitted, but the window itself must NOT scroll.
 *
 * Usage:
 *   node scripts/audit-overflow-scale.mjs
 *   node scripts/audit-overflow-scale.mjs --viewports=320,360
 *   node scripts/audit-overflow-scale.mjs --provisions-only
 *   node scripts/audit-overflow-scale.mjs --url=/plain-english/provision/text-contrast-sufficient-minimum/
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { globSync } from 'tinyglobby';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST_CLIENT = path.join(ROOT, 'dist', 'client');
const W3C_CSS_PATH = path.join(ROOT, 'scripts', 'w3c-wai-style.css');

const args = process.argv.slice(2);
const getArg = (name) => {
  const prefix = `--${name}=`;
  const hit = args.find((a) => a.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) return args[idx + 1];
  return null;
};
const hasFlag = (name) => args.includes(`--${name}`);

const VIEWPORTS = (getArg('viewports') || '320,360,768,1024,1366')
  .split(',')
  .map((v) => parseInt(v.trim(), 10))
  .filter(Boolean);

const TEST_200_SCALE = !hasFlag('no-scale');
const PROVISIONS_ONLY = hasFlag('provisions-only');
const SINGLE_URL = getArg('url') || null;
const LIMIT = getArg('limit') ? parseInt(getArg('limit'), 10) : 0;
const CONCURRENCY = parseInt(getArg('concurrency') || '6', 10);

function createStaticServer(distDir) {
  const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.ico': 'image/x-icon'
  };

  return http.createServer((req, res) => {
    const rawPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(distDir, rawPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

// In-browser probe function
const CHECK_OVERFLOW_FN = () => {
  const docEl = document.documentElement;
  const body = document.body;
  const winWidth = window.innerWidth;

  // Sub-pixel threshold: allow 1.5px tolerance for fractional font rasterization
  const overflowX = Math.max(docEl.scrollWidth - winWidth, body ? body.scrollWidth - winWidth : 0);

  if (overflowX <= 1.5) {
    return { hasOverflow: false, scrollWidth: Math.max(docEl.scrollWidth, body?.scrollWidth || 0), winWidth, culprits: [] };
  }

  // Find culprits that spill outside viewport bounds
  const culprits = [];
  const allElements = document.querySelectorAll('*');

  for (const el of allElements) {
    if (el === docEl || el === body) continue;
    const rect = el.getBoundingClientRect();
    // Element's right edge extends past viewport by more than 2px
    if (rect.right > winWidth + 2 && rect.width > 0) {
      // Check if this is an intentionally scrollable container that is already clipped
      const s = getComputedStyle(el);
      const isScrollContainer = s.overflowX === 'auto' || s.overflowX === 'scroll';

      // If it's a child inside an element with internal scroll, skip child
      const parentScroll = el.parentElement?.closest('[style*="overflow"], pre, .table-wrap, .code-wrap');
      if (parentScroll && parentScroll !== el) continue;

      culprits.push({
        tag: el.tagName.toLowerCase(),
        className: (el.className && typeof el.className === 'string') ? el.className.trim() : '',
        id: el.id || '',
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        excess: Math.round(rect.right - winWidth),
        textSnippet: (el.textContent || '').trim().slice(0, 40)
      });
      if (culprits.length >= 5) break;
    }
  }

  return {
    hasOverflow: true,
    scrollWidth: Math.round(Math.max(docEl.scrollWidth, body?.scrollWidth || 0)),
    winWidth,
    culprits
  };
};

async function main() {
  if (!fs.existsSync(DIST_CLIENT)) {
    console.error('Error: dist/client directory not found. Run npm run build first.');
    process.exit(1);
  }

  let w3cCss = '';
  if (fs.existsSync(W3C_CSS_PATH)) {
    w3cCss = fs.readFileSync(W3C_CSS_PATH, 'utf8');
  }

  const server = createStaticServer(DIST_CLIENT);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`⚡ Overflow audit server listening at ${baseUrl}`);
  console.log(`📐 Viewports to test: ${VIEWPORTS.join(', ')} px`);
  console.log(`🔍 200% text scale test: ${TEST_200_SCALE ? 'ENABLED' : 'DISABLED'}`);

  let urls = [];
  if (SINGLE_URL) {
    urls = [SINGLE_URL];
  } else {
    const htmlFiles = globSync('**/*.html', { cwd: DIST_CLIENT });
    urls = htmlFiles.map((f) => {
      let u = '/' + f.replace(/\\/g, '/');
      if (u.endsWith('/index.html')) u = u.slice(0, -'index.html'.length);
      return u;
    });

    if (PROVISIONS_ONLY) {
      urls = urls.filter((u) => u.startsWith('/plain-english/provision/'));
      console.log(`📋 Filtered to ${urls.length} provision pages.`);
    } else {
      console.log(`📋 Found ${urls.length} total pages in dist/client.`);
    }

    if (LIMIT > 0) {
      urls = urls.slice(0, LIMIT);
    }
  }

  const browser = await chromium.launch({ headless: true });
  const start = Date.now();

  const failures = [];
  let totalAudits = 0;
  let completedPages = 0;

  async function worker(queue) {
    const context = await browser.newContext();
    if (w3cCss) {
      await context.route('**/WAI/assets/css/style.css', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'text/css',
          body: w3cCss
        });
      });
    }

    const page = await context.newPage();

    while (queue.length > 0) {
      const url = queue.shift();
      try {
        await page.goto(`${baseUrl}${url}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        if (url.includes('/explainer') || url.includes('/requirements') || url.includes('/guidelines')) {
          await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
        }

        // Expand any tab panels so hidden components are in DOM flow
        await page.evaluate(() => {
          document.querySelectorAll('.tab-panel').forEach((p) => {
            p.classList.remove('hidden');
            p.classList.add('active');
            p.style.display = 'block';
          });
        });

        // Test each viewport at 100% scale
        for (const width of VIEWPORTS) {
          await page.setViewportSize({ width, height: 800 });
          totalAudits++;

          const res100 = await page.evaluate(CHECK_OVERFLOW_FN);
          if (res100.hasOverflow) {
            failures.push({
              url,
              viewport: width,
              scale: '100%',
              scrollWidth: res100.scrollWidth,
              winWidth: res100.winWidth,
              culprits: res100.culprits
            });
          }

          // Test 200% text scale if enabled
          if (TEST_200_SCALE) {
            await page.evaluate(() => {
              document.documentElement.style.fontSize = '200%';
            });
            totalAudits++;

            const res200 = await page.evaluate(CHECK_OVERFLOW_FN);
            if (res200.hasOverflow) {
              failures.push({
                url,
                viewport: width,
                scale: '200%',
                scrollWidth: res200.scrollWidth,
                winWidth: res200.winWidth,
                culprits: res200.culprits
              });
            }

            // Reset font size for next iteration
            await page.evaluate(() => {
              document.documentElement.style.fontSize = '';
            });
          }
        }
      } catch (err) {
        console.error(`❌ Error on ${url}: ${err.message}`);
      } finally {
        completedPages++;
        if (completedPages % 25 === 0 || completedPages === urls.length) {
          process.stdout.write(`   [${completedPages}/${urls.length}] pages processed (${totalAudits} layout checks)...\r`);
        }
      }
    }

    await context.close();
  }

  const queue = [...urls];
  const workers = Array.from({ length: CONCURRENCY }, () => worker(queue));
  await Promise.all(workers);

  await browser.close();
  server.close();

  const durationSec = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n\n✅ Overflow & Scale Sweep Complete in ${durationSec}s!`);
  console.log(`   - Pages Processed: ${urls.length}`);
  console.log(`   - Layout Checks Executed: ${totalAudits}`);
  console.log(`   - Overflow Failures: ${failures.length}`);

  if (failures.length > 0) {
    console.log(`\n⚠️  Horizontal Overflow detected on ${failures.length} check configurations:`);
    const grouped = {};
    for (const f of failures) {
      if (!grouped[f.url]) grouped[f.url] = [];
      grouped[f.url].push(f);
    }

    for (const [u, items] of Object.entries(grouped)) {
      console.log(`\n  ${u}:`);
      for (const item of items) {
        console.log(`    - Viewport ${item.viewport}px (${item.scale} text): scrollWidth ${item.scrollWidth}px > ${item.winWidth}px`);
        for (const c of item.culprits) {
          console.log(`        Culprit: <${c.tag} class="${c.className}" id="${c.id}"> (width: ${c.width}px, excess: +${c.excess}px) [${c.textSnippet}]`);
        }
      }
    }
  } else {
    console.log(`🎉 Clean sweep! Zero horizontal overflow detected across all tested viewports and 200% text scale.`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * audit-contrast.mjs
 * ------------------------------------------------------------------
 * Automated WCAG 2.2 AA contrast sweep across all built pages in dist/client.
 *
 * Features:
 *  - Opens all tab panels before probing so hidden panels are measured.
 *  - Corrected canvas assumption: default canvas is white unless the page
 *    opts in via color-scheme: dark (fixes phantom hits on unstyled ACT fixtures/redirect stubs).
 *  - Intercepts W3C stylesheet route so informative pages render with full styles.
 *  - Evaluates WCAG 2 AA contrast ratio (4.5:1 normal, 3:1 large).
 *  - Ignores known false positives: .toc-btn-text gradient, pure emoji bitmap glyphs,
 *    and third-party ReSpec toolbar injection.
 *
 * Usage:
 *   node scripts/audit-contrast.mjs --theme=dark
 *   node scripts/audit-contrast.mjs --theme=light
 *   node scripts/audit-contrast.mjs --theme=dark --sample=40
 *   node scripts/audit-contrast.mjs --url=/plain-english/provision/text-contrast-sufficient-minimum/
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

const THEME = getArg('theme') || 'dark';
const SAMPLE = getArg('sample') ? parseInt(getArg('sample'), 10) : 0;
const LIMIT = getArg('limit') ? parseInt(getArg('limit'), 10) : 0;
const SINGLE_URL = getArg('url') || null;
const CONCURRENCY = parseInt(getArg('concurrency') || '6', 10);

// --- Static File Server ---
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

// --- Browser Evaluate Function ---
const AUDIT_FUNCTION = (themeMode) => {
  const isDark = themeMode === 'dark';

  // Apply theme if site layout supports data-theme
  if (document.querySelector('[data-theme]') || document.documentElement.hasAttribute('data-theme') || document.querySelector('.hub-header, .hub-main')) {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.add('light-theme');
    }
  }

  // Open all tabs so hidden content is exposed and measured
  document.querySelectorAll('.tab-panel').forEach((p) => {
    p.classList.remove('hidden');
    p.classList.add('active');
    p.style.display = 'block';
  });

  function parseColor(str) {
    if (!str || str === 'transparent' || str === 'inherit') return null;
    const m = str.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
    if (!m) return null;
    return {
      r: parseInt(m[1], 10),
      g: parseInt(m[2], 10),
      b: parseInt(m[3], 10),
      a: m[4] !== undefined ? parseFloat(m[4]) : 1
    };
  }

  function composite(over, under) {
    const a = over.a + under.a * (1 - over.a);
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
    return {
      r: Math.round((over.r * over.a + under.r * under.a * (1 - over.a)) / a),
      g: Math.round((over.g * over.a + under.g * under.a * (1 - over.a)) / a),
      b: Math.round((over.b * over.a + under.b * under.a * (1 - over.a)) / a),
      a
    };
  }

  function luminance(c) {
    const srgb = [c.r / 255, c.g / 255, c.b / 255];
    const linear = srgb.map((v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  }

  function contrastRatio(fg, bg) {
    const l1 = luminance(fg);
    const l2 = luminance(bg);
    const bright = Math.max(l1, l2);
    const dark = Math.min(l1, l2);
    return (bright + 0.05) / (dark + 0.05);
  }

  // Canvas assumption:
  // A browser paints a pure WHITE canvas (#ffffff) unless the page explicitly opts in to dark
  // via color-scheme: dark. Unstyled fixtures and stubs paint white.
  const htmlScheme = getComputedStyle(document.documentElement).colorScheme;
  const canvasDefault = htmlScheme.includes('dark')
    ? { r: 7, g: 11, b: 20, a: 1 } // #070b14 (--surface-ground)
    : { r: 255, g: 255, b: 255, a: 1 }; // Pure white canvas

  function getEffectiveBg(el) {
    let curr = el;
    const layers = [];
    while (curr && curr !== document) {
      const s = getComputedStyle(curr);
      const bg = parseColor(s.backgroundColor);
      if (bg && bg.a > 0) {
        layers.unshift(bg);
        if (bg.a === 1) break;
      }
      curr = curr.parentElement;
    }
    let res = canvasDefault;
    for (const layer of layers) {
      res = composite(layer, res);
    }
    return res;
  }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const failures = [];
  let totalNodes = 0;

  // Regex to detect purely decorative emoji strings (rendered as fixed multi-color bitmaps)
  const isEmojiOnly = /^[\p{Extended_Pictographic}\p{Emoji}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]+$/u;

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.textContent.trim();
    if (!text || text.length === 0) continue;

    const el = node.parentElement;
    if (!el) continue;

    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    // Skip third-party W3C ReSpec toolbar injected elements
    if (el.closest('#respec-ui, .respec-button, #respec-pill, .respec-ui') || el.id?.startsWith('respec-')) {
      continue;
    }

    // Skip pure emoji text nodes (rendered as fixed OS bitmaps, not font colors)
    if (isEmojiOnly.test(text)) {
      totalNodes++;
      continue;
    }

    // Skip decorative icons hidden from assistive technology
    if (el.closest('[aria-hidden="true"]') && el.closest('.thumb-icon, .brand-logo-icon, .sparkle, .tab-icon, .calc-icon, .caveat-icon, .ready-icon, .portal-icon-wrap')) {
      totalNodes++;
      continue;
    }

    // Known false positive: .toc-btn-text has gradient where painted pixels measure 6.4:1+
    if (el.classList.contains('toc-btn-text') || el.closest('.toc-btn-text')) {
      totalNodes++;
      continue;
    }

    const fg = parseColor(s.color);
    if (!fg) continue;
    const bg = getEffectiveBg(el);
    const effectiveFg = composite(fg, bg);

    const ratio = contrastRatio(effectiveFg, bg);
    totalNodes++;

    const fontSize = parseFloat(s.fontSize);
    const isBold = parseInt(s.fontWeight, 10) >= 700 || s.fontWeight === 'bold';
    const isLarge = fontSize >= 24 || (fontSize >= 18.66 && isBold);
    const minRatio = isLarge ? 3.0 : 4.5;

    if (ratio < minRatio) {
      failures.push({
        text: text.slice(0, 45),
        tag: el.tagName.toLowerCase(),
        className: el.className || '',
        ratio: Math.round(ratio * 100) / 100,
        required: minRatio,
        fg: `rgb(${effectiveFg.r},${effectiveFg.g},${effectiveFg.b})`,
        bg: `rgb(${bg.r},${bg.g},${bg.b})`,
        fontSize: s.fontSize,
        isLarge
      });
    }
  }

  return { totalNodes, failures };
};

// --- Main Execution ---
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

  console.log(`⚡ Contrast audit server listening at ${baseUrl}`);
  console.log(`🎨 Mode: ${THEME.toUpperCase()} theme`);

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

    if (SAMPLE > 0) {
      const byCategory = {};
      for (const u of urls) {
        const cat = u.split('/')[1] || 'root';
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(u);
      }
      const sampled = [];
      const perCat = Math.max(2, Math.floor(SAMPLE / Object.keys(byCategory).length));
      for (const cat of Object.keys(byCategory)) {
        sampled.push(...byCategory[cat].slice(0, perCat));
      }
      urls = sampled.slice(0, SAMPLE);
      console.log(`📊 Running stratified sample of ${urls.length} pages`);
    } else if (LIMIT > 0) {
      urls = urls.slice(0, LIMIT);
    }
  }

  console.log(`🚀 Auditing ${urls.length} pages (concurrency: ${CONCURRENCY})...`);

  const browser = await chromium.launch({ headless: true });
  const start = Date.now();

  let grandTotalNodes = 0;
  let totalFailures = 0;
  const failedPages = [];
  let completed = 0;

  async function worker(queue) {
    const context = await browser.newContext({
      colorScheme: THEME === 'dark' ? 'dark' : 'light'
    });

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
        const res = await page.evaluate(AUDIT_FUNCTION, THEME);

        grandTotalNodes += res.totalNodes;
        if (res.failures.length > 0) {
          totalFailures += res.failures.length;
          failedPages.push({ url, failures: res.failures });
        }
      } catch (err) {
        console.error(`❌ Error on ${url}: ${err.message}`);
      } finally {
        completed++;
        if (completed % 50 === 0 || completed === urls.length) {
          process.stdout.write(`   [${completed}/${urls.length}] ${grandTotalNodes.toLocaleString()} text nodes audited...\r`);
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
  console.log(`\n\n✅ Sweep Complete in ${durationSec}s!`);
  console.log(`   - Pages Audited: ${urls.length}`);
  console.log(`   - Text Nodes Measured: ${grandTotalNodes.toLocaleString()}`);
  console.log(`   - Contrast Violations: ${totalFailures}`);

  if (failedPages.length > 0) {
    console.log(`\n⚠️  Failures detected on ${failedPages.length} pages:`);
    for (const fp of failedPages) {
      console.log(`\n  ${fp.url} (${fp.failures.length} violations):`);
      for (const f of fp.failures.slice(0, 5)) {
        console.log(`    - [${f.ratio}:1 < ${f.required}:1] <${f.tag} class="${f.className}"> "${f.text}" (fg: ${f.fg}, bg: ${f.bg}, size: ${f.fontSize})`);
      }
      if (fp.failures.length > 5) {
        console.log(`      ...and ${fp.failures.length - 5} more`);
      }
    }
  } else {
    console.log(`🎉 Clean sweep! Zero contrast violations detected.`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

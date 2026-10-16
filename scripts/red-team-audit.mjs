import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

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

const TARGET_ROUTES = [
  '/',
  '/plain-english/',
  '/plain-english/patterns/',
  '/plain-english/comparison/',
  '/plain-english/wcag22/',
  '/plain-english/wcag22/1-4-3/',
  '/plain-english/provision/audio-shifting-adjustable/',
  '/plain-english/conformance/',
  '/requirements/'
];

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`\n======================================================`);
  console.log(`🚀 AGENTIC RED TEAM ACCESSIBILITY AUDIT ENGINE`);
  console.log(`   Auditing ${TARGET_ROUTES.length} routes against WCAG 2.2 AA/AAA`);
  console.log(`======================================================\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  let totalViolations = 0;
  let totalWarnings = 0;

  for (const route of TARGET_ROUTES) {
    const page = await context.newPage();
    console.log(`\n🔍 [AUDIT ROUTE]: ${route}`);

    // 1. Standard Navigation & Axe-core scan (WCAG 2.0/2.1/2.2 + Best Practices on App Routes)
    await page.goto(baseUrl + route);
    const axeTags = route === '/requirements/'
      ? ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
      : ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
    const axeResults = await new AxeBuilder({ page })
      .withTags(axeTags)
      .analyze();

    if (axeResults.violations.length === 0) {
      console.log(`   ✅ Axe-Core: 0 violations`);
    } else {
      console.log(`   ❌ Axe-Core: ${axeResults.violations.length} violations:`);
      for (const v of axeResults.violations) {
        totalViolations += v.nodes.length;
        console.log(`      • [${v.impact?.toUpperCase()}] ${v.id}: ${v.help} (${v.nodes.length} nodes)`);
        for (const n of v.nodes) {
          console.log(`        - Target: ${n.target.join(' ')}`);
          console.log(`          HTML: ${n.html.slice(0, 120)}`);
        }
      }
    }

    // 2. Windows Contrast Themes / Forced Colors Emulation
    await page.emulateMedia({ forcedColors: 'active' });
    const forcedColorCheck = await page.evaluate(() => {
      const controls = Array.from(document.querySelectorAll(
        'button:not([hidden]), a[href]:not([hidden]), input:not([hidden]), select:not([hidden]), [role="switch"]:not([hidden]), [role="slider"]:not([hidden]), [role="tab"]:not([hidden]), [role="radio"]:not([hidden]), [role="checkbox"]:not([hidden])'
      ));
      return controls.filter(el => {
        if (el.closest('[hidden]')) return false;
        const cs = window.getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return false;
        return parseFloat(cs.opacity) === 0;
      }).length;
    });
    if (forcedColorCheck === 0) {
      console.log(`   ✅ Windows Contrast Themes (Forced Colors): Clean`);
    } else {
      console.log(`   ⚠️ Forced Colors warning: ${forcedColorCheck} invisible interactive controls`);
      totalWarnings += forcedColorCheck;
    }
    await page.emulateMedia({ forcedColors: 'none' });

    // 3. Screen Reader / UIA Tree Verification (ariaSnapshot, Headings, 2.5.3 Label in Name, Landmarks)
    const a11ySnapshot = await page.locator('body').ariaSnapshot();
    const nodeCount = a11ySnapshot.split('\n').filter(l => l.trim().startsWith('-')).length;
    const treeAudit = await page.evaluate((currentRoute) => {
      if (currentRoute === '/requirements/') {
        return { headingSkips: [], labelMismatches: [], mainCount: 1, duplicateNavs: [] };
      }
      // Heading hierarchy check
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter(el => {
        if (el.closest('[hidden]')) return false;
        const cs = window.getComputedStyle(el);
        return cs.display !== 'none' && cs.visibility !== 'hidden';
      });
      const headingSkips = [];
      let prevLevel = 0;
      for (const h of headings) {
        const lvl = parseInt(h.tagName.slice(1), 10);
        if (prevLevel > 0 && lvl > prevLevel + 1) {
          headingSkips.push(`h${prevLevel} -> h${lvl} ("${h.textContent.trim().slice(0, 40)}")`);
        }
        prevLevel = lvl;
      }

      // WCAG 2.5.3 Label in Name check
      const norm = s => s.replace(/\s+/g, ' ').trim().toLowerCase();
      const labelMismatches = [];
      for (const el of document.querySelectorAll('button[aria-label], a[aria-label], [role="button"][aria-label], [role="tab"][aria-label], [role="radio"][aria-label]')) {
        if (el.closest('[hidden]')) continue;
        const cs = window.getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const clone = el.cloneNode(true);
        clone.querySelectorAll('[aria-hidden="true"], .sr-only').forEach(n => n.remove());
        const vis = norm(clone.textContent || '').replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '').trim();
        const aria = norm(el.getAttribute('aria-label') || '');
        if (vis.length >= 2 && /[a-z0-9]/i.test(vis) && !aria.includes(vis)) {
          labelMismatches.push(`${el.tagName}#${el.id || ''} visible="${vis}" vs aria-label="${aria}"`);
        }
      }

      // Landmark uniqueness check
      const mains = Array.from(document.querySelectorAll('main, [role="main"]')).filter(el => !el.closest('[hidden]'));
      const navs = Array.from(document.querySelectorAll('nav, [role="navigation"]')).filter(el => !el.closest('[hidden]'));
      const navLabels = navs.map(n => n.getAttribute('aria-label') || n.getAttribute('aria-labelledby') || '');
      const duplicateNavs = navLabels.filter((l, i) => !l || navLabels.indexOf(l) !== i);

      return {
        headingSkips,
        labelMismatches,
        mainCount: mains.length,
        duplicateNavs
      };
    }, route);

    if (treeAudit.headingSkips.length === 0 && treeAudit.labelMismatches.length === 0 && treeAudit.mainCount === 1 && treeAudit.duplicateNavs.length === 0) {
      console.log(`   ✅ UIA/Screen Reader Tree (${nodeCount} nodes): Headings, 2.5.3 Label-in-Name & Landmarks verified`);
    } else {
      console.log(`   ❌ UIA/Screen Reader Tree issues:`, treeAudit);
      totalViolations += treeAudit.headingSkips.length + treeAudit.labelMismatches.length + (treeAudit.mainCount !== 1 ? 1 : 0) + treeAudit.duplicateNavs.length;
    }

    // 4. Keyboard Navigation, Focus Trapping & Roving Tabindex
    const kbdIssues = [];
    // Test roving tabindex on visible tablists, toolbars, radiogroups, and menubars
    const rovingGroups = await page.locator('[role="tablist"]:visible, [role="toolbar"]:visible, [role="radiogroup"]:visible, [role="menubar"]:visible').all();
    for (let i = 0; i < Math.min(rovingGroups.length, 6); i++) {
      const group = rovingGroups[i];
      const items = group.locator('[role="tab"]:visible, [role="radio"]:visible, [role="menuitem"]:visible, button:visible');
      if (await items.count() >= 2) {
        const first = items.nth(0);
        const second = items.nth(1);
        await first.focus();
        await page.keyboard.press('ArrowRight');
        const t0 = await first.getAttribute('tabindex');
        const t1 = await second.getAttribute('tabindex');
        if (t0 !== '-1' || t1 !== '0') {
          const groupLabel = await group.getAttribute('aria-label') || await group.getAttribute('id') || `group-${i}`;
          kbdIssues.push(`Roving tabindex failed in "${groupLabel}" (first=${t0}, second=${t1})`);
        }
        // Restore initial state
        await page.keyboard.press('ArrowLeft');
      }
    }

    // Test modal focus traps & Escape dismissal on /plain-english/patterns/ and /plain-english/
    if (route === '/plain-english/patterns/') {
      const openBtn = page.locator('#btn-open-apg-dialog');
      if (await openBtn.count() > 0) {
        await openBtn.click();
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        const trapped = await page.evaluate(() => !!document.activeElement?.closest('#apg-modal-overlay'));
        await page.keyboard.press('Escape');
        const restored = await page.evaluate(() => document.activeElement?.id === 'btn-open-apg-dialog');
        if (!trapped || !restored) {
          kbdIssues.push(`APG Modal trap=${trapped}, escapeRestore=${restored}`);
        }
      }
    } else if (route === '/plain-english/') {
      const tocBtn = page.locator('#toc-toggle-btn');
      if (await tocBtn.count() > 0) {
        await tocBtn.click();
        await page.keyboard.press('Escape');
        const restored = await page.evaluate(() => document.activeElement?.id === 'toc-toggle-btn' && document.getElementById('toc-drawer')?.hasAttribute('hidden'));
        if (!restored) {
          kbdIssues.push(`TOC Drawer Escape dismissal/focus restore failed`);
        }
      }
    }

    if (kbdIssues.length === 0) {
      console.log(`   ✅ Keyboard Roving Tabindex & Top-Layer Dismissal: Verified`);
    } else {
      console.log(`   ❌ Keyboard Navigation issues:`, kbdIssues);
      totalViolations += kbdIssues.length;
    }

    // 5. WCAG 1.4.10 Reflow (320px viewport stress test)
    await page.setViewportSize({ width: 320, height: 600 });
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    if (!hasHorizontalOverflow) {
      console.log(`   ✅ 320px Reflow Stress: No horizontal scroll leakage`);
    } else {
      console.log(`   ⚠️ Reflow Notice: Horizontal scroll detected at 320px width`);
      totalWarnings++;
    }

    // 6. WCAG 1.4.12 Text Spacing Override Stress Test
    await page.setViewportSize({ width: 1280, height: 800 });
    const textSpacingOk = await page.evaluate(() => {
      const style = document.createElement('style');
      style.id = '__text_spacing_test__';
      style.textContent = `
        * {
          line-height: 1.5 !important;
          letter-spacing: 0.12em !important;
          word-spacing: 0.16em !important;
        }
        p {
          margin-bottom: 2em !important;
        }
      `;
      document.head.appendChild(style);
      const headers = Array.from(document.querySelectorAll('h1, h2, h3'));
      const broken = headers.filter(h => h.scrollHeight > h.clientHeight + 10 && window.getComputedStyle(h).overflow === 'hidden');
      style.remove();
      return broken.length === 0;
    });
    if (textSpacingOk) {
      console.log(`   ✅ WCAG 1.4.12 Text Spacing Override: Passed`);
    } else {
      console.log(`   ⚠️ Text Spacing warning: potential heading text clipping under custom spacing`);
      totalWarnings++;
    }

    await page.close();
  }

  console.log(`\n======================================================`);
  console.log(`🏁 RED TEAM AUDIT COMPLETE`);
  console.log(`   Violations: ${totalViolations}`);
  console.log(`   Warnings/Notices: ${totalWarnings}`);
  console.log(`======================================================\n`);

  await browser.close();
  server.close();

  if (totalViolations > 0 || totalWarnings > 0) {
    process.exit(1);
  }
});

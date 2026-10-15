import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const DIST_CLIENT = path.join(process.cwd(), 'dist', 'client');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json'
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
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:' + port + '/plain-english/patterns/');

  // Query all interactive elements in .demo-semantic
  const elements = await page.evaluate(() => {
    const list = [];
    const semanticPanes = document.querySelectorAll('.demo-semantic');
    semanticPanes.forEach(pane => {
      const card = pane.closest('.pattern-card');
      const patternId = card?.getAttribute('data-id') || 'unknown';
      const items = pane.querySelectorAll('button, input, select, textarea, a, summary, [tabindex="0"]');
      items.forEach(el => {
        list.push({
          patternId,
          tag: el.tagName,
          id: el.id,
          cls: el.className,
          selector: el.id ? '#' + el.id : (el.className ? '.' + el.className.split(' ').join('.') : el.tagName.toLowerCase())
        });
      });
    });
    return list;
  });

  for (const theme of ['dark', 'light']) {
    console.log(`\n=== Auditing ${elements.length} Semantic Elements in [${theme.toUpperCase()}] Mode ===`);
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);

    let failed = 0;
    for (const item of elements) {
      const focusState = await page.evaluate(({ pid, id, cls, tag }) => {
        let target;
        if (id) target = document.getElementById(id);
        else {
          const card = document.getElementById('pattern-' + pid);
          const sem = card ? card.querySelector('.demo-semantic') : null;
          if (sem) {
            if (cls && cls.trim()) {
              target = sem.querySelector('.' + cls.trim().split(/\s+/).join('.'));
            }
            if (!target) {
              target = sem.querySelector(tag);
            }
          }
        }
        if (!target) return null;
        // Ensure any previously opened dialogs/popovers are closed
        document.querySelectorAll('dialog[open]').forEach(d => { try { d.close(); } catch(e) {} });
        document.querySelectorAll('[popover]:popover-open').forEach(p => { try { p.hidePopover(); } catch(e) {} });

        const popover = target.closest('[popover]');
        if (popover && !popover.matches(':popover-open')) {
          try { popover.showPopover(); } catch(e) {}
        }
        const dialog = target.closest('dialog');
        if (dialog && !dialog.open) {
          try { dialog.showModal(); } catch(e) {}
        }
        target.focus();
        const cs = window.getComputedStyle(target);
        const res = {
          tag,
          id,
          cls,
          outline: cs.outline,
          outlineStyle: cs.outlineStyle,
          outlineWidth: cs.outlineWidth,
          outlineColor: cs.outlineColor,
          outlineOffset: cs.outlineOffset,
          boxShadow: cs.boxShadow,
          borderColor: cs.borderColor
        };
        if (dialog && dialog.open) {
          try { dialog.close(); } catch(e) {}
        }
        if (popover && popover.matches(':popover-open')) {
          try { popover.hidePopover(); } catch(e) {}
        }
        return res;
      }, { pid: item.patternId, id: item.id, cls: item.cls, tag: item.tag });

      if (focusState) {
        const isNone = focusState.outlineStyle === 'none' && focusState.boxShadow === 'none';
        if (isNone) {
          failed++;
          console.log(`❌ NO FOCUS: [${item.patternId}] <${focusState.tag}> #${focusState.id} .${focusState.cls} outline=${focusState.outline}`);
        } else {
          // Log summary
        }
      }
    }
    console.log(`Result for [${theme}]: ${elements.length - failed}/${elements.length} elements have accessible focus indicators (${failed} failures).`);
  }

  await browser.close();
  server.close();
});

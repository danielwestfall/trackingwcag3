/*!
 * A11y Reading Panel v1.0
 * Drop-in accessibility & readability panel for any web page.
 * Works as a bookmarklet, a userscript, or a <script> tag. MIT License.
 *
 * Toggle: click the floating button, or press Alt+Shift+A.
 * Settings are remembered per site (localStorage).
 */
(() => {
  'use strict';
  if (window.__a11yPanel) { window.__a11yPanel.toggle(); return; }

  // Optional config: set window.a11yPanelConfig before this script runs.
  //   autoOpen  – open the panel on load (default true)
  //   removable – show the "Remove panel" button (default true)
  //   mount     – CSS selector or element: render the panel inline inside it (collapsible)
  //               instead of as a floating button + popover
  //   layout    – with mount: 'inline' (expands in the page flow) or 'dropdown' (drops down over the page,
  //               e.g. from a button in a site header)
  //   label     – text of the inline toggle button
  //   nativeTheme – { attr: 'data-theme', light: 'light', dark: 'dark', lightClass?, legacyKey? }: the site
  //               has its own light/dark theme; the Colors row then offers Auto / Light / Dark that set that
  //               attribute (and optional class) on <html>. legacyKey = localStorage key of an old theme toggle
  //               whose saved 'light'/'dark' choice should carry over (default 'theme').
  const CFG = Object.assign({ autoOpen: true, removable: true, mount: null, layout: 'inline', label: 'Reading & accessibility options', nativeTheme: null }, window.a11yPanelConfig || {});
  const NT = CFG.nativeTheme;
  const doc = document;
  const HOST_ID = 'a11yp-host';
  const FS_ATTR = 'data-a11yp-fs';
  const STORE_KEY = 'a11yp:' + location.hostname;

  // ---------- Config ----------
  const STEPPERS = [
    { key: 'text', label: 'Text size', steps: [1, 1.15, 1.3, 1.5, 1.75, 2], fmt: v => Math.round(v * 100) + '%' },
    { key: 'lh', label: 'Line height', steps: [0, 1.5, 1.75, 2, 2.4], fmt: v => (v ? v + '×' : 'Site') },
    { key: 'ls', label: 'Letter spacing', steps: [0, 0.03, 0.06, 0.12], fmt: v => (v ? '+' + v + 'em' : 'Site') },
    { key: 'ws', label: 'Word spacing', steps: [0, 0.1, 0.16, 0.3], fmt: v => (v ? '+' + v + 'em' : 'Site') },
  ];
  const SEGMENTS = [
    { key: 'font', label: 'Font', opts: [['default', 'Site'], ['legible', 'Hyperlegible'], ['lexend', 'Lexend'], ['dyslexic', 'Dyslexia-friendly']] },
    { key: 'theme', label: 'Colors', opts: NT
      ? [['none', 'Auto'], ['site-light', 'Light'], ['site-dark', 'Dark'], ['light', 'High contrast'], ['sepia', 'Sepia'], ['yellow', 'Yellow on black']]
      : [['none', 'Site'], ['dark', 'Dark'], ['light', 'High contrast'], ['sepia', 'Sepia'], ['yellow', 'Yellow on black']] },
    { key: 'sat', label: 'Saturation', opts: [['normal', 'Normal'], ['low', 'Low'], ['gray', 'Grayscale'], ['high', 'High']] },
    { key: 'guide', label: 'Reading guide', opts: [['off', 'Off'], ['ruler', 'Ruler'], ['mask', 'Focus mask']] },
    { key: 'rate', label: 'Speed', opts: [['0.8', '0.8×'], ['1', '1×'], ['1.25', '1.25×'], ['1.5', '1.5×']] },
  ];
  const TOGGLES = [
    ['align', 'Left-align text'],
    ['measure', 'Limit line length'],
    ['links', 'Highlight links'],
    ['headings', 'Label headings'],
    ['focus', 'Strong focus outline'],
    ['motion', 'Stop animations'],
    ['images', 'Hide images & media'],
    ['cursor', 'Large cursor'],
  ];
  const FONTS = {
    legible: { stack: "'Atkinson Hyperlegible', 'Atkinson', Verdana, Tahoma, sans-serif", href: 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap' },
    lexend: { stack: "'Lexend', Verdana, sans-serif", href: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300..700&display=swap' },
    // Uses OpenDyslexic if it's installed locally, otherwise Comic Neue.
    dyslexic: { stack: "'OpenDyslexic', 'Comic Neue', 'Comic Sans MS', sans-serif", href: 'https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap' },
  };
  const THEMES = {
    dark: { bg: '#121212', fg: '#e8e6e3', link: '#8ab4f8', line: '#3c4043', field: '#1e1e1e' },
    light: { bg: '#ffffff', fg: '#000000', link: '#0000cc', line: '#000000', field: '#ffffff' },
    sepia: { bg: '#f4ecd8', fg: '#3b2f20', link: '#8a3b00', line: '#c8b594', field: '#fbf6ea' },
    yellow: { bg: '#000000', fg: '#ffff00', link: '#00ffff', line: '#ffff00', field: '#000000' },
  };
  const DEFAULTS = {
    text: 0, lh: 0, ls: 0, ws: 0,
    font: 'default', theme: 'none', sat: 'normal', guide: 'off', rate: '1',
    align: false, measure: false, links: false, headings: false,
    focus: false, motion: false, images: false, cursor: false,
  };

  // ---------- State ----------
  const load = () => {
    let s = {};
    try { s = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { /* private mode etc. */ }
    if (NT && !s.theme) { // carry over a choice made with the site's old theme toggle
      try { const t = localStorage.getItem(NT.legacyKey || 'theme'); if (t === 'light' || t === 'dark') s.theme = 'site-' + t; } catch (e) { /* ignore */ }
    }
    const out = Object.assign({}, DEFAULTS, s);
    STEPPERS.forEach(st => { out[st.key] = Math.max(0, Math.min(st.steps.length - 1, out[st.key] | 0)); });
    SEGMENTS.forEach(sg => { if (!sg.opts.some(o => o[0] === String(out[sg.key]))) out[sg.key] = DEFAULTS[sg.key]; });
    return out;
  };
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } };
  let state = load();
  const stepVal = k => { const s = STEPPERS.find(x => x.key === k); return s.steps[state[k]]; };
  const isModified = () => Object.keys(DEFAULTS).some(k => k !== 'rate' && state[k] !== DEFAULTS[k] && !(k === 'theme' && /^site-/.test(state[k])));
  // Site's own light/dark theme (nativeTheme): Auto follows the OS; forced themes pick the closer base.
  const darkMQ = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function applyNativeTheme() {
    if (!NT) return;
    const t = state.theme;
    const mode = t === 'site-dark' || t === 'yellow' ? 'dark'
      : t === 'site-light' || t === 'light' || t === 'sepia' ? 'light'
      : (darkMQ && darkMQ.matches ? 'dark' : 'light');
    doc.documentElement.setAttribute(NT.attr || 'data-theme', NT[mode] || mode);
    if (NT.lightClass) doc.documentElement.classList.toggle(NT.lightClass, mode === 'light');
    doc.documentElement.style.colorScheme = mode;
  }
  if (NT && darkMQ && darkMQ.addEventListener) darkMQ.addEventListener('change', applyNativeTheme);

  // ---------- DOM helper (no innerHTML: safe under Trusted Types / CSP) ----------
  function h(tag, attrs, kids) {
    const el = doc.createElement(tag);
    for (const k in attrs || {}) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'text') el.textContent = v;
      else if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    (kids || []).forEach(c => c && el.appendChild(typeof c === 'string' ? doc.createTextNode(c) : c));
    return el;
  }
  function svg(paths, size) {
    const NS = 'http://www.w3.org/2000/svg';
    const s = doc.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', size); s.setAttribute('height', size);
    s.setAttribute('fill', 'currentColor'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
    paths.forEach(([tag, a]) => { const p = doc.createElementNS(NS, tag); for (const k in a) p.setAttribute(k, a[k]); s.appendChild(p); });
    return s;
  }

  // ---------- Stylesheets (CSSOM, so page CSP style-src doesn't block us) ----------
  const canAdopt = 'adoptedStyleSheets' in Document.prototype && 'replaceSync' in CSSStyleSheet.prototype;
  let pageSheet = null, pageStyleEl = null;
  function setPageCSS(css) {
    if (canAdopt) {
      if (!pageSheet) { pageSheet = new CSSStyleSheet(); doc.adoptedStyleSheets = [...doc.adoptedStyleSheets, pageSheet]; }
      pageSheet.replaceSync(css);
    } else {
      if (!pageStyleEl) { pageStyleEl = h('style', { id: 'a11yp-style' }); (doc.head || doc.documentElement).appendChild(pageStyleEl); }
      pageStyleEl.textContent = css;
    }
  }
  const cursorURL = fill => 'url("data:image/svg+xml,' + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 24 24'><path d='M4 2.5 L4 19 L8.2 15 L11 21.5 L14 20.2 L11.3 13.9 L17 13.6 Z' fill='${fill}' stroke='white' stroke-width='1.4' stroke-linejoin='round'/></svg>`
  ) + '") 7 5';

  function buildCSS() {
    const c = [];
    const lh = stepVal('lh'), ls = stepVal('ls'), ws = stepVal('ws');
    if (lh) c.push(`body, body *:not(svg *) { line-height: ${lh} !important; }`);
    if (ls) c.push(`body, body *:not(svg *) { letter-spacing: ${ls}em !important; }`);
    if (ws) c.push(`body, body *:not(svg *) { word-spacing: ${ws}em !important; }`);

    const f = FONTS[state.font];
    if (f) c.push(`body, body *:not(i):not(md-icon):not([class*="symbols"]):not([class*="icon"]):not([class*="Icon"]):not([class*="fa-"]):not([class^="fa"]):not([class*="material-"]):not(.glyphicon):not(code):not(pre):not(kbd):not(samp):not(pre *):not(code *):not(svg *) { font-family: ${f.stack} !important; }`);

    const t = THEMES[state.theme];
    if (t) c.push(
      `html, body { background: ${t.bg} !important; color: ${t.fg} !important; }`,
      `body *:not(img):not(video):not(canvas):not(picture) { background-color: ${t.bg} !important; color: ${t.fg} !important; border-color: ${t.line} !important; text-shadow: none !important; }`,
      `body a[href], body a[href] * { color: ${t.link} !important; }`,
      `body input, body textarea, body select, body button { background-color: ${t.field} !important; border: 1px solid ${t.line} !important; }`,
      `body ::placeholder { color: ${t.fg} !important; opacity: .7 !important; }`
    );

    const sat = { low: 'saturate(.45)', gray: 'grayscale(1)', high: 'saturate(1.8)' }[state.sat];
    if (sat) c.push(`html { filter: ${sat} !important; }`);

    if (state.align) c.push(`body p, body li, body dd, body dt, body td, body th, body blockquote, body figcaption, body h1, body h2, body h3, body h4, body h5, body h6 { text-align: start !important; hyphens: manual !important; }`);
    if (state.measure) c.push(`body p, body li, body dd, body blockquote, body figcaption { max-width: 70ch !important; }`);
    if (state.links) c.push(`body a[href] { text-decoration: underline !important; text-decoration-thickness: 2px !important; text-underline-offset: 3px !important; background-color: #fff3a0 !important; color: #000 !important; outline: 2px solid #000 !important; outline-offset: 1px !important; }`, `body a[href] * { color: #000 !important; }`);
    if (state.headings) {
      c.push(`body h1, body h2, body h3, body h4, body h5, body h6, body [role="heading"] { outline: 2px solid #7c3aed !important; outline-offset: 4px !important; }`);
      for (let n = 1; n <= 6; n++) c.push(`body h${n}::before { content: "H${n}" !important; display: inline-block !important; font: 700 11px/1.7 system-ui, sans-serif !important; letter-spacing: 0 !important; background: #7c3aed !important; color: #fff !important; padding: 0 6px !important; margin-right: 8px !important; border-radius: 4px !important; vertical-align: middle !important; }`);
    }
    if (state.focus) c.push(`body *:focus { outline: 3px solid #ff8c00 !important; outline-offset: 2px !important; box-shadow: 0 0 0 6px rgba(0,0,0,.75) !important; }`);
    if (state.motion) c.push(`*, *::before, *::after { animation-duration: 0.001s !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: 0.001s !important; transition-delay: 0s !important; scroll-behavior: auto !important; }`);
    if (state.images) c.push(`body img, body picture, body video, body canvas, body iframe, body [role="img"] { visibility: hidden !important; }`, `body * { background-image: none !important; }`);
    if (state.cursor) c.push(`html, html * { cursor: ${cursorURL('black')}, auto !important; }`, `html a[href], html a[href] *, html button, html [role="button"], html label, html summary, html select { cursor: ${cursorURL('#1a56db')}, pointer !important; }`);
    return c.join('\n');
  }

  const loadedFonts = new Set();
  function loadFont(key) {
    const f = FONTS[key];
    if (!f || loadedFonts.has(key)) return;
    loadedFonts.add(key);
    (doc.head || doc.documentElement).appendChild(h('link', { rel: 'stylesheet', href: f.href, 'data-a11yp': '' }));
  }

  // ---------- Text scaling (per-element, so it works on px-based sites too) ----------
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'BR', 'WBR', 'IMG', 'VIDEO', 'AUDIO', 'CANVAS', 'IFRAME', 'SOURCE', 'TRACK', 'LINK', 'META', 'OBJECT', 'EMBED', 'PICTURE']);
  const scalable = el => !SKIP.has(el.tagName) && !(el instanceof SVGElement) && el.id !== HOST_ID;
  let scaleNow = 1;

  function setSize(el, px) {
    el.setAttribute(FS_ATTR, el.style.fontSize || '');
    el.style.setProperty('font-size', px.toFixed(2) + 'px', 'important');
  }
  function unscaleText() {
    doc.querySelectorAll('[' + FS_ATTR + ']').forEach(el => {
      const prev = el.getAttribute(FS_ATTR);
      el.style.removeProperty('font-size');
      if (prev) el.style.fontSize = prev;
      el.removeAttribute(FS_ATTR);
    });
  }
  function scaleText() {
    const s = stepVal('text');
    unscaleText();
    scaleNow = s;
    if (s === 1 || !doc.body) return;
    const els = [doc.body, ...doc.body.getElementsByTagName('*')].filter(scalable);
    const sizes = els.map(el => parseFloat(getComputedStyle(el).fontSize) || 0); // read all first…
    els.forEach((el, i) => { if (sizes[i]) setSize(el, sizes[i] * s); });      // …then write, to avoid compounding
  }

  // Scale content added later (SPAs, infinite scroll).
  const pending = new Set();
  let moRaf = 0;
  const mo = new MutationObserver(muts => {
    if (scaleNow === 1) return;
    for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1) pending.add(n);
    if (pending.size && !moRaf) moRaf = requestAnimationFrame(flushPending);
  });
  function flushPending() {
    moRaf = 0;
    const roots = [...pending]; pending.clear();
    for (const root of roots) {
      if (!root.isConnected || !doc.body.contains(root)) continue;
      for (const el of [root, ...root.getElementsByTagName('*')]) {
        if (!scalable(el) || el.hasAttribute(FS_ATTR)) continue;
        const px = parseFloat(getComputedStyle(el).fontSize) || 0;
        if (!px) continue;
        const p = el.parentElement;
        const inherited = p && p.hasAttribute(FS_ATTR) && Math.abs(parseFloat(getComputedStyle(p).fontSize) - px) < 0.01;
        setSize(el, inherited ? px : px * scaleNow);
      }
    }
  }

  // ---------- Read aloud ----------
  const synth = window.speechSynthesis;
  function chunk(text) {
    const t = text.replace(/\s+/g, ' ').trim();
    const out = []; let buf = '';
    (t.match(/[^.!?]+[.!?]*\s*/g) || [t]).forEach(s => {
      if (buf && (buf + s).length > 220) { out.push(buf); buf = ''; }
      buf += s;
      while (buf.length > 300) { out.push(buf.slice(0, 300)); buf = buf.slice(300); }
    });
    if (buf.trim()) out.push(buf);
    return out;
  }
  function readAloud() {
    if (!synth) return;
    const sel = String(window.getSelection() || '').trim();
    const src = sel || (doc.querySelector('main, [role="main"], article') || doc.body).innerText;
    synth.cancel();
    const parts = chunk(src);
    if (!parts.length) return setStatus('Nothing to read.');
    parts.forEach((p, i) => {
      const u = new SpeechSynthesisUtterance(p);
      u.rate = parseFloat(state.rate) || 1;
      if (doc.documentElement.lang) u.lang = doc.documentElement.lang;
      if (i === parts.length - 1) u.onend = () => { setStatus('Finished.'); refs.pause.textContent = 'Pause'; };
      synth.speak(u);
    });
    refs.pause.textContent = 'Pause';
    setStatus(sel ? 'Reading your selection…' : 'Reading the main content…');
  }
  function pauseResume() {
    if (!synth || !synth.speaking) return;
    if (synth.paused) { synth.resume(); refs.pause.textContent = 'Pause'; setStatus('Reading…'); }
    else { synth.pause(); refs.pause.textContent = 'Resume'; setStatus('Paused.'); }
  }
  function stopReading() { if (synth) synth.cancel(); refs.pause.textContent = 'Pause'; setStatus('Stopped.'); }
  const setStatus = msg => { if (refs.status) refs.status.textContent = msg; };

  // ---------- Navigation ----------
  function goTo(el) {
    if (!el) return;
    if (!el.matches('a[href],button,input,select,textarea,[tabindex]')) el.setAttribute('tabindex', '-1');
    el.scrollIntoView({ block: 'center' });
    el.focus({ preventScroll: true });
    const prev = el.style.outline;
    el.style.outline = '3px solid #f59e0b';
    setTimeout(() => { el.style.outline = prev; }, 1600);
  }
  function findMain() {
    return doc.querySelector('main, [role="main"], #main, #content, #main-content, article') || doc.querySelector('h1');
  }
  function buildOutline() {
    const list = refs.outline;
    list.replaceChildren();
    const hs = [...doc.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]')]
      .filter(el => el.getClientRects().length && el.textContent.trim());
    if (!hs.length) { list.appendChild(h('li', { class: 'empty', text: 'No headings found on this page.' })); return; }
    hs.forEach(el => {
      const lvl = /^H[1-6]$/.test(el.tagName) ? +el.tagName[1] : (+el.getAttribute('aria-level') || 2);
      const txt = el.textContent.replace(/\s+/g, ' ').trim();
      const b = h('button', { type: 'button', onclick: () => goTo(el) }, [h('span', { class: 'lv', text: 'H' + lvl }), txt.length > 90 ? txt.slice(0, 88) + '…' : txt]);
      b.style.paddingLeft = (8 + (lvl - 1) * 12) + 'px';
      list.appendChild(h('li', {}, [b]));
    });
  }

  // ---------- Reading guide ----------
  let guideY = innerHeight / 2, gRaf = 0;
  function drawGuide() {
    gRaf = 0;
    const g = state.guide;
    refs.ruler.style.display = g === 'ruler' ? 'block' : 'none';
    refs.maskTop.style.display = refs.maskBot.style.display = g === 'mask' ? 'block' : 'none';
    if (g === 'ruler') refs.ruler.style.top = (guideY - 20) + 'px';
    if (g === 'mask') {
      refs.maskTop.style.height = Math.max(0, guideY - 45) + 'px';
      refs.maskBot.style.height = Math.max(0, innerHeight - guideY - 45) + 'px';
    }
  }
  const queueGuide = () => { if (state.guide !== 'off' && !gRaf) gRaf = requestAnimationFrame(drawGuide); };
  const onPointer = e => { const p = e.touches ? e.touches[0] : e; if (p) { guideY = p.clientY; queueGuide(); } };
  const onFocusIn = e => {
    if (e.target === host) return;
    const r = e.target.getBoundingClientRect && e.target.getBoundingClientRect();
    if (r && r.height) { guideY = r.top + r.height / 2; queueGuide(); }
  };

  // ---------- UI ----------
  const refs = {};
  const host = h('div', { id: HOST_ID });
  const root = host.attachShadow({ mode: 'open' });

  const PANEL_CSS = `
:host { all: initial; }
* { box-sizing: border-box; }
.root { --accent:var(--a11yp-accent,#1a56db); --on-accent:var(--a11yp-on-accent,#fff); --bg:var(--a11yp-bg,#fff); --fg:var(--a11yp-fg,#1f2328);
  --muted:var(--a11yp-muted,#57606a); --line:var(--a11yp-line,#d0d7de); --chip:var(--a11yp-chip,#f3f4f6); --track:var(--a11yp-track,#6e7781); --ring:var(--a11yp-ring,#1a56db);
  font: 15px/1.4 var(--a11yp-font, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif); color: var(--fg);
  letter-spacing: normal; word-spacing: normal; text-align: left; }
@media (prefers-color-scheme: dark) { .root:not([data-scheme="light"]) { --accent:var(--a11yp-accent,#7aa7ff); --on-accent:var(--a11yp-on-accent,#0b1220); --bg:var(--a11yp-bg,#1c1f24); --fg:var(--a11yp-fg,#e6edf3); --muted:var(--a11yp-muted,#9aa4af); --line:var(--a11yp-line,#3a414a); --chip:var(--a11yp-chip,#2a2f36); --track:var(--a11yp-track,#8b949e); --ring:var(--a11yp-ring,#7aa7ff); } }
.root[data-scheme="dark"] { --accent:var(--a11yp-accent,#7aa7ff); --on-accent:var(--a11yp-on-accent,#0b1220); --bg:var(--a11yp-bg,#1c1f24); --fg:var(--a11yp-fg,#e6edf3); --muted:var(--a11yp-muted,#9aa4af); --line:var(--a11yp-line,#3a414a); --chip:var(--a11yp-chip,#2a2f36); --track:var(--a11yp-track,#8b949e); --ring:var(--a11yp-ring,#7aa7ff); }
button { font: inherit; color: inherit; }
button:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }
.fab:focus-visible { outline-color: #1a56db; box-shadow: 0 0 0 3px #fff; }
.fab { position: fixed; right: 20px; bottom: 20px; width: 54px; height: 54px; border-radius: 50%; border: 2px solid #fff;
  background: #1a56db; color: #fff; cursor: pointer; display: grid; place-items: center; z-index: 2147483647;
  box-shadow: 0 4px 16px rgba(0,0,0,.35); padding: 0; }
.fab:hover { background: #1747b5; }
.fab.active::after { content: ""; position: absolute; top: 2px; right: 2px; width: 12px; height: 12px; border-radius: 50%; background: #22c55e; border: 2px solid #fff; }
.panel { position: fixed; right: 20px; bottom: 86px; width: min(370px, calc(100vw - 32px)); max-height: calc(100vh - 106px);
  overflow: auto; overscroll-behavior: contain; background: var(--bg); color: var(--fg); border: 1px solid var(--line);
  border-radius: 14px; box-shadow: 0 14px 44px rgba(0,0,0,.32); z-index: 2147483647; }
.panel[hidden] { display: none; }
header { position: sticky; top: 0; z-index: 1; background: var(--bg); display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; border-bottom: 1px solid var(--line); }
h2 { font-size: 16px; font-weight: 650; margin: 0; }
h2:focus { outline: none; }
fieldset { border: 0; border-bottom: 1px solid var(--line); margin: 0; padding: 12px 14px 8px; min-width: 0; }
legend { float: left; width: 100%; padding: 0; margin-bottom: 6px; font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }
legend + * { clear: both; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 4px 0; }
.step { display: flex; align-items: center; gap: 4px; }
.step output { min-width: 62px; text-align: center; font-variant-numeric: tabular-nums; font-weight: 600; }
.ib { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--line); background: var(--chip); cursor: pointer; font-size: 18px; line-height: 1; padding: 0; }
.ib[aria-disabled="true"] { opacity: .4; cursor: default; }
.lbl { font-size: 13.5px; color: var(--muted); margin: 8px 0 4px; }
.seg { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; }
.seg button { padding: 6px 11px; border-radius: 999px; border: 1px solid var(--line); background: var(--chip); cursor: pointer; font-size: 13.5px; }
.seg button[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: var(--on-accent); font-weight: 600; }
.sw { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 10px; padding: 7px 0; background: none; border: 0; cursor: pointer; text-align: left; }
.track { flex: none; width: 40px; height: 22px; border-radius: 11px; background: var(--track); position: relative; transition: background .15s; }
.track::after { content: ""; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform .15s; box-shadow: 0 1px 2px rgba(0,0,0,.3); }
.sw[aria-checked="true"] .track { background: var(--accent); }
.sw[aria-checked="true"] .track::after { transform: translateX(18px); }
.btns { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 6px; }
.btn { padding: 7px 12px; border-radius: 8px; border: 1px solid var(--line); background: var(--chip); cursor: pointer; font-size: 14px; }
.btn.primary { background: var(--accent); border-color: var(--accent); color: var(--on-accent); font-weight: 600; }
.status { font-size: 13px; color: var(--muted); margin: 4px 0 6px; min-height: 1.2em; }
.hint { font-size: 12.5px; color: var(--muted); margin: 2px 0 6px; }
.outline { list-style: none; margin: 6px 0 8px; padding: 4px 0; max-height: 240px; overflow: auto; border: 1px solid var(--line); border-radius: 8px; }
.outline[hidden] { display: none; }
.outline button { display: block; width: 100%; text-align: left; background: none; border: 0; padding: 6px 8px; cursor: pointer; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.outline button:hover { background: var(--chip); }
.outline .lv { font-size: 11px; font-weight: 700; color: var(--muted); margin-right: 6px; }
.outline .empty { padding: 6px 10px; color: var(--muted); font-size: 13.5px; }
footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 14px 12px; }
.kbd { font-size: 12px; color: var(--muted); }
.ruler { position: fixed; left: 0; right: 0; height: 40px; background: rgba(255,221,0,.2); border-top: 2px solid rgba(190,140,0,.85);
  border-bottom: 2px solid rgba(190,140,0,.85); pointer-events: none; z-index: 2147483646; display: none; }
.mask { position: fixed; left: 0; right: 0; background: rgba(0,0,0,.62); pointer-events: none; z-index: 2147483646; display: none; }
.mask.top { top: 0; } .mask.bot { bottom: 0; }
/* Inline (mounted) mode */
.inline .barwrap { display: flex; justify-content: flex-end; }
.bar { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px 8px 10px; border-radius: 999px; border: 1px solid var(--line);
  background: var(--chip); color: var(--fg); cursor: pointer; font-weight: 600; font-size: 14.5px; position: relative; }
.bar:hover { border-color: var(--accent); }
.bar svg:first-child { color: var(--accent); }
.bar .chev { transition: transform .2s; }
.bar[aria-expanded="true"] .chev { transform: rotate(180deg); }
.bar.active::after { content: ""; position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; border-radius: 50%; background: #22c55e; border: 2px solid var(--bg); }
.inline .panel { position: static; width: auto; max-height: none; overflow: visible; box-shadow: none; margin-top: 10px; border-radius: 16px; z-index: auto; }
.inline .grid { columns: 4 260px; column-gap: 0; }
.inline fieldset { border-bottom: 0; padding: 14px 18px 10px; break-inside: avoid; }
.inline footer { border-top: 1px solid var(--line); padding: 10px 18px 12px; }
/* Dropdown mode (mounted in a site header) */
.dropdown .barwrap { display: flex; }
.dropdown .bar { padding: 8px 12px 8px 9px; }
.dropdown .panel { position: absolute; top: 100%; bottom: auto; left: 12px; right: 12px; width: auto; max-width: 1180px; margin: 6px 0 0 auto;
  overflow: auto; overscroll-behavior: contain; box-shadow: 0 14px 44px rgba(0,0,0,.28); z-index: 1000; }
.sr { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (max-width: 640px) { .dropdown .bar .txt { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .dropdown .bar { padding: 9px; } .dropdown .panel { left: 8px; right: 8px; } }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
@media (forced-colors: active) { .seg button[aria-pressed="true"], .sw[aria-checked="true"] .track { forced-color-adjust: none; background: Highlight; color: HighlightText; } }
`;
  if (canAdopt) { const s = new CSSStyleSheet(); s.replaceSync(PANEL_CSS); root.adoptedStyleSheets = [s]; }
  else root.appendChild(h('style', { text: PANEL_CSS }));

  const set = (key, val) => { state[key] = val; apply(key); };
  const bump = (key, d) => {
    const s = STEPPERS.find(x => x.key === key);
    const n = Math.max(0, Math.min(s.steps.length - 1, state[key] + d));
    if (n !== state[key]) set(key, n);
  };

  function stepper(s) {
    const out = h('output', { 'aria-live': 'polite' });
    const dec = h('button', { type: 'button', class: 'ib', 'aria-label': 'Decrease ' + s.label.toLowerCase(), onclick: () => bump(s.key, -1) }, ['−']);
    const inc = h('button', { type: 'button', class: 'ib', 'aria-label': 'Increase ' + s.label.toLowerCase(), onclick: () => bump(s.key, 1) }, ['+']);
    refs[s.key] = { out, dec, inc };
    return h('div', { class: 'row' }, [
      h('span', { id: 'l-' + s.key, text: s.label }),
      h('div', { class: 'step', role: 'group', 'aria-labelledby': 'l-' + s.key }, [dec, out, inc]),
    ]);
  }
  function segment(key) {
    const s = SEGMENTS.find(x => x.key === key);
    const btns = s.opts.map(([val, txt]) => h('button', { type: 'button', 'data-val': val, onclick: () => set(key, val) }, [txt]));
    refs[key] = btns;
    return h('div', {}, [
      h('div', { class: 'lbl', id: 'g-' + key, text: s.label }),
      h('div', { class: 'seg', role: 'group', 'aria-labelledby': 'g-' + key }, btns),
    ]);
  }
  function toggleRow([key, label]) {
    const b = h('button', { type: 'button', class: 'sw', role: 'switch', 'aria-checked': 'false', onclick: () => set(key, !state[key]) },
      [h('span', { text: label }), h('span', { class: 'track', 'aria-hidden': 'true' })]);
    refs[key] = b;
    return b;
  }
  const fs = (legend, kids) => h('fieldset', {}, [h('legend', { text: legend }), ...kids]);

  const mountEl = CFG.mount ? (typeof CFG.mount === 'string' ? doc.querySelector(CFG.mount) : CFG.mount) : null;
  const INLINE = !!mountEl;
  const DROPDOWN = INLINE && CFG.layout === 'dropdown';
  const personIcon = size => svg([['circle', { cx: 12, cy: 4.2, r: 2.2 }], ['path', { d: 'M20.2 8.3a1.1 1.1 0 0 1-.95 1.2L15 10.1v3.1l1.95 6.95a1.1 1.1 0 0 1-2.1.62L12.5 15h-1l-2.35 5.77a1.1 1.1 0 0 1-2.1-.62L9 13.2v-3.1l-4.25-.6a1.1 1.1 0 1 1 .3-2.18l5.1.68h3.7l5.1-.68a1.1 1.1 0 0 1 1.25.98z' }]], size);
  // Floating mode: round button. Inline mode: a disclosure button that expands the panel in the page flow.
  const trigger = INLINE
    ? h('button', { type: 'button', class: 'bar', 'aria-expanded': 'false', 'aria-controls': 'a11yp-panel', onclick: () => togglePanel() },
        [personIcon(22), h('span', { class: 'txt', text: CFG.label }), (() => { const c = svg([['path', { d: 'M7 10l5 5 5-5z' }]], 20); c.classList.add('chev'); return c; })()])
    : h('button', {
        type: 'button', class: 'fab', 'aria-label': 'Accessibility & reading options', 'aria-expanded': 'false', 'aria-controls': 'a11yp-panel',
        title: 'Accessibility & reading options (Alt+Shift+A)', onclick: () => togglePanel(),
      }, [personIcon(30)]);

  const title = h('h2', { id: 'a11yp-title', tabindex: '-1', text: 'Reading & accessibility' });
  refs.status = h('p', { class: 'status', role: 'status' });
  refs.pause = h('button', { type: 'button', class: 'btn', onclick: pauseResume }, ['Pause']);
  const readBtn = h('button', { type: 'button', class: 'btn primary', onclick: readAloud }, ['Read aloud']);
  readBtn.addEventListener('mousedown', e => e.preventDefault()); // keep the page selection
  refs.outline = h('ul', { class: 'outline', id: 'a11yp-outline', hidden: true });
  const outlineBtn = h('button', {
    type: 'button', class: 'btn', 'aria-expanded': 'false', 'aria-controls': 'a11yp-outline',
    onclick: () => {
      const show = refs.outline.hidden;
      if (show) buildOutline();
      refs.outline.hidden = !show;
      outlineBtn.setAttribute('aria-expanded', String(show));
    },
  }, ['Page outline']);

  const groups = [
    fs('Text', [...STEPPERS.map(stepper), segment('font')]),
    fs('Color & contrast', [segment('theme'), segment('sat')]),
    fs('Reading aids', [segment('guide'), ...TOGGLES.map(toggleRow)]),
    synth && fs('Read aloud', [
      h('p', { class: 'hint', text: 'Reads highlighted text, or the main content if nothing is selected.' }),
      h('div', { class: 'btns' }, [readBtn, refs.pause, h('button', { type: 'button', class: 'btn', onclick: stopReading }, ['Stop'])]),
      segment('rate'), refs.status,
    ]),
    fs('Navigate', [
      h('div', { class: 'btns' }, [h('button', { type: 'button', class: 'btn', onclick: () => { if (!INLINE || DROPDOWN) closePanel(false); goTo(findMain()); } }, ['Jump to main content']), outlineBtn]),
      refs.outline,
    ]),
  ];
  const footer = h('footer', {}, [
      h('div', { class: 'btns' }, [
        h('button', { type: 'button', class: 'btn', onclick: reset }, ['Reset all']),
        CFG.removable && h('button', { type: 'button', class: 'btn', onclick: destroy, title: 'Removes the panel and undoes all changes on this page' }, ['Remove panel']),
      ]),
      h('span', { class: 'kbd', text: 'Alt+Shift+A' }),
    ]);
  const panel = INLINE
    ? h('section', { class: 'panel', id: 'a11yp-panel', 'aria-label': CFG.label, hidden: true }, [h('div', { class: 'grid' }, groups), footer])
    : h('section', { class: 'panel', id: 'a11yp-panel', role: 'dialog', 'aria-labelledby': 'a11yp-title', hidden: true }, [
        h('header', {}, [title, h('button', { type: 'button', class: 'ib', 'aria-label': 'Close panel', onclick: () => closePanel(true) }, ['×'])]),
        ...groups, footer,
      ]);
  if (!INLINE) panel.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); closePanel(true); } });

  refs.ruler = h('div', { class: 'ruler' });
  refs.maskTop = h('div', { class: 'mask top' });
  refs.maskBot = h('div', { class: 'mask bot' });
  const uiRoot = INLINE
    ? h('div', { class: DROPDOWN ? 'root inline dropdown' : 'root inline' }, [refs.maskTop, refs.maskBot, refs.ruler, h('div', { class: 'barwrap' }, [trigger]), panel])
    : h('div', { class: 'root' }, [refs.maskTop, refs.maskBot, refs.ruler, panel, trigger]);
  root.appendChild(uiRoot);
  // If the site has its own light/dark switch (html[data-theme] or .dark), match it.
  const syncScheme = () => {
    const de = doc.documentElement, t = de.getAttribute('data-theme') || de.getAttribute('data-color-scheme') || '';
    const s = /dark/.test(t) || de.classList.contains('dark') ? 'dark' : /light/.test(t) || de.classList.contains('light') ? 'light' : '';
    if (s) uiRoot.setAttribute('data-scheme', s); else uiRoot.removeAttribute('data-scheme');
  };
  syncScheme();
  const themeMO = new MutationObserver(syncScheme);
  themeMO.observe(doc.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-color-scheme', 'class'] });
  if (INLINE) mountEl.appendChild(host);
  else doc.documentElement.appendChild(host); // outside <body>, so page transforms/filters/our own rules don't touch it

  function render() {
    STEPPERS.forEach(s => {
      const r = refs[s.key], i = state[s.key];
      r.out.textContent = s.fmt(s.steps[i]);
      r.dec.setAttribute('aria-disabled', String(i === 0));
      r.inc.setAttribute('aria-disabled', String(i === s.steps.length - 1));
    });
    SEGMENTS.forEach(s => (refs[s.key] || []).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.val === String(state[s.key])))));
    TOGGLES.forEach(([k]) => refs[k].setAttribute('aria-checked', String(!!state[k])));
    trigger.classList.toggle('active', isModified());
  }

  function apply(changed) {
    applyNativeTheme();
    setPageCSS(buildCSS());
    if (!changed || changed === 'text') scaleText();
    if (FONTS[state.font]) loadFont(state.font);
    if (state.motion && (!changed || changed === 'motion')) doc.querySelectorAll('video').forEach(v => { try { v.pause(); } catch (e) { /* ignore */ } });
    drawGuide();
    render();
    save();
  }
  function reset() {
    state = Object.assign({}, DEFAULTS);
    if (synth) synth.cancel();
    apply();
    setStatus('');
  }

  // ---------- Open / close ----------
  const OPEN_KEY = STORE_KEY + ':open';
  const rememberOpen = v => { if (INLINE && !DROPDOWN) try { localStorage.setItem(OPEN_KEY, v ? '1' : ''); } catch (e) { /* ignore */ } };
  function openPanel(fromKey) {
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    rememberOpen(true);
    if (!INLINE) title.focus();
    else if (DROPDOWN) { fitDropdown(); if (fromKey) trigger.focus({ preventScroll: true }); }
    else if (fromKey) { host.scrollIntoView({ block: 'start' }); trigger.focus({ preventScroll: true }); }
  }
  // Dropdown: keep it within the viewport, close on Escape or a click elsewhere.
  function fitDropdown() {
    if (!DROPDOWN || panel.hidden) return;
    const top = panel.getBoundingClientRect().top;
    panel.style.maxHeight = Math.max(200, innerHeight - Math.max(top, 0) - 12) + 'px';
  }
  if (DROPDOWN) {
    addEventListener('resize', fitDropdown, { passive: true });
    addEventListener('scroll', () => requestAnimationFrame(fitDropdown), { passive: true });
    doc.addEventListener('pointerdown', e => { if (!panel.hidden && !e.composedPath().includes(host)) closePanel(false); }, true);
    doc.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) closePanel(doc.activeElement === host); }, true);
  }
  function closePanel(returnFocus) {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    rememberOpen(false);
    if (returnFocus) trigger.focus();
  }
  const togglePanel = fromKey => (panel.hidden ? openPanel(fromKey) : closePanel(true));
  const onKey = e => {
    if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyA') { e.preventDefault(); togglePanel(true); }
  };

  function destroy() {
    if (synth) synth.cancel();
    mo.disconnect(); themeMO.disconnect();
    unscaleText();
    if (pageSheet) doc.adoptedStyleSheets = doc.adoptedStyleSheets.filter(s => s !== pageSheet);
    if (pageStyleEl) pageStyleEl.remove();
    doc.querySelectorAll('link[data-a11yp]').forEach(l => l.remove());
    removeEventListener('mousemove', onPointer); removeEventListener('touchmove', onPointer);
    removeEventListener('keydown', onKey, true); doc.removeEventListener('focusin', onFocusIn, true);
    host.remove();
    delete window.__a11yPanel;
  }

  addEventListener('mousemove', onPointer, { passive: true });
  addEventListener('touchmove', onPointer, { passive: true });
  addEventListener('keydown', onKey, true);
  doc.addEventListener('focusin', onFocusIn, true);
  if (doc.body) mo.observe(doc.body, { childList: true, subtree: true });

  window.__a11yPanel = { open: () => openPanel(true), close: () => closePanel(false), toggle: togglePanel, reset, destroy, get state() { return Object.assign({}, state); } };

  apply();
  // Only the in-page (inline) layout remembers being expanded. A dropdown or popover never opens
  // by itself: it waits for a click or Alt+Shift+A. Clear any flag left by an earlier inline layout.
  let wasOpen = false;
  try {
    if (INLINE && !DROPDOWN) wasOpen = localStorage.getItem(OPEN_KEY) === '1';
    else localStorage.removeItem(OPEN_KEY);
  } catch (e) { /* ignore */ }
  if (CFG.autoOpen || wasOpen) openPanel(false);
})();

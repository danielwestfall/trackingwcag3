#!/usr/bin/env node
/**
 * check-quotes.mjs: every quotation in the site's data must match its source.
 *
 * The 2026-10-06 audit found quotes that had been trimmed, reworded or cut off
 * before a "However" (for example the WCAG 2.2 §5.1 statement, an Understanding
 * passage, and five GitHub comments). The existing factuality test checked
 * shapes and counts, never wording. This checks wording.
 *
 * Every quoted string of 4+ words in the scanned data files must be found,
 * after normalising case, whitespace and quote marks, in one of:
 *   - WCAG 2.2 normative text, notes and definitions (wcag22-data/normative-text.json,
 *     extracted verbatim from the published Recommendation)
 *   - the WCAG 3 draft at the tracked commit (guidelines/, src/pages/guidelines,
 *     src/pages/explainer.astro)
 *   - the cached GitHub threads (tracking/discussions-raw.json)
 *   - tracking/verified-quotes.json: quotes from sources not held locally
 *     (Understanding documents, techniques) and illustrative examples that are
 *     in quotation marks but aren't quotations. Each entry names its source.
 * An ellipsis ("..." or "…") inside a quote matches any omitted text.
 *
 *   node scripts/check-quotes.mjs          # exits 1 on any unmatched quote
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');
const readJson = (...p) => JSON.parse(read(...p));

const norm = (s) => s
  .replace(/<[^>]+>/g, ' ')
  .replace(/:term\[([^\]]+)\]/g, '$1')
  .replace(/[‘’ʼ]/g, "'")
  .replace(/[“”]/g, '"')
  .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
  .replace(/\]\([^)]*\)/g, ']')   // markdown link targets
  .replace(/[*_`>\[\]]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

// ---- Corpora --------------------------------------------------------------
const corpus = { wcag22: '', wcag3: '', github: '' };

const n22 = readJson('wcag22-data', 'normative-text.json');
const parts22 = [n22.normativeStatement];
const blockText = (b) => b.type === 'p' ? b.html : b.type === 'dl' ? b.items.map((i) => `${i.term} ${i.html}`).join(' ') : b.items.join(' ');
for (const c of n22.criteria) {
  parts22.push(...c.normative.map(blockText), ...c.informativeNotes);
  for (const d of c.definitions) parts22.push(...d.definition.map(blockText), ...d.informativeNotes);
}
corpus.wcag22 = norm(parts22.join(' \u0000 '));

const walkFiles = (dir, ext) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walkFiles(path.join(dir, e.name), ext) : e.name.endsWith(ext) ? [path.join(dir, e.name)] : []);
corpus.wcag3 = norm([
  ...walkFiles(path.join(ROOT, 'guidelines'), '.md').map((f) => fs.readFileSync(f, 'utf8')),
  ...walkFiles(path.join(ROOT, 'informative'), '.md').map((f) => fs.readFileSync(f, 'utf8')),
  read('src', 'pages', 'guidelines', 'index.astro'),
  read('src', 'pages', 'explainer.astro'),
].join(' \u0000 '));

const raw = readJson('tracking', 'discussions-raw.json').issues;
corpus.github = norm(Object.values(raw).flatMap((i) => [i.title, i.body || '', ...(i.comments || []).map((c) => c.body || '')]).join(' \u0000 '));

const registry = readJson('tracking', 'verified-quotes.json').quotes;
const registryNorm = new Map(registry.map((q) => [norm(q.text), q]));

// ---- Matching ---------------------------------------------------------------
function found(quote, haystack) {
  const segments = norm(quote).split(/\s*(?:\.\.\.|…)\s*/).map((s) => s.replace(/^[,.;:]+|[,.;:]+$/g, '').trim()).filter(Boolean);
  let from = 0;
  for (const seg of segments) {
    const at = haystack.indexOf(seg, from);
    if (at === -1) return false;
    from = at + seg.length;
  }
  return segments.length > 0;
}

// Quoted spans inside a string: "..." or “...”, 4+ words.
function quotesIn(text) {
  const out = [];
  for (const re of [/"([^"]{3,}?)"/g, /“([^”]{3,}?)”/g]) {
    for (const m of text.matchAll(re)) if (m[1].trim().split(/\s+/).length >= 4) out.push(m[1].trim());
  }
  return out;
}
function* strings(value, where = '') {
  if (typeof value === 'string') yield [where, value];
  else if (Array.isArray(value)) for (const [i, v] of value.entries()) yield* strings(v, `${where}[${i}]`);
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) {
    if (k.startsWith('_')) continue;
    yield* strings(v, where ? `${where}.${k}` : k);
  }
}

const targets = [
  ['wcag22-data/three-tier-guidance.json', ['wcag22']],
  ['public/data/wcag3-stricter.json', ['wcag22', 'wcag3']],
  ['public/data/wcag3-conformance.json', ['wcag3', 'wcag22']],
  ['wcag22-data/removals-and-omissions.json', ['wcag3', 'wcag22', 'github']],
  ['wcag22-data/wcag22-to-wcag3-map.json', ['wcag3']],
  ...fs.readdirSync(path.join(ROOT, 'plain-english-data', 'provisions')).map((f) => [`plain-english-data/provisions/${f}`, ['wcag3', 'wcag22']]),
  ...fs.readdirSync(path.join(ROOT, 'tracking', 'summaries')).filter((f) => f.endsWith('.json')).map((f) => [`tracking/summaries/${f}`, ['github', 'wcag3', 'wcag22']]),
];

let checked = 0;
const failures = [];
const usedRegistry = new Set();

// --built: also scan the rendered pages in dist/client, so quotations written
// into page templates (not just data files) are checked. Run after `npm run build`.
// Skipped: W3C's own documents mirrored on the site (guidelines, informative,
// explainer, requirements), whose quotation marks are W3C's.
const BUILT = process.argv.includes('--built');
const builtQuotes = new Map(); // quote -> pages
if (BUILT) {
  const dist = path.join(ROOT, 'dist', 'client');
  if (!fs.existsSync(dist)) { console.error('--built: dist/client not found; run `npm run build` first.'); process.exit(1); }
  const SKIP = /^(guidelines|informative|explainer|requirements)(\/|$)/;
  for (const f of walkFiles(dist, '.html')) {
    const rel = path.relative(dist, f).split(path.sep).join('/');
    if (SKIP.test(rel)) continue;
    // Walk the parsed page and collect visible text block by block, so a
    // stray quotation mark can't pair across paragraphs. <pre> is skipped: the
    // provision pages use it to show W3C's raw source on purpose.
    const $ = cheerio.load(fs.readFileSync(f, 'utf8'));
    $('script, style, template, noscript, pre, code').remove();
    const BLOCK = /^(p|li|dd|dt|h[1-6]|td|th|div|section|article|blockquote|summary|details|ul|ol|dl|table|tr|br|header|footer|nav|main|aside|label|button|figcaption|option)$/i;
    const chunks = [];
    let cur = '';
    const walkDom = (node) => {
      if (node.type === 'text') { cur += node.data; return; }
      if (node.type !== 'tag' && node.type !== 'root') return;
      const block = BLOCK.test(node.name);
      if (block) { chunks.push(cur); cur = ''; }
      for (const c of node.children || []) walkDom(c);
      if (block) { chunks.push(cur); cur = ''; }
    };
    walkDom($.root()[0]);
    chunks.push(cur);
    for (const block of chunks) {
      for (const q of quotesIn(block.replace(/\s+/g, ' '))) {
        if (!builtQuotes.has(q)) builtQuotes.set(q, []);
        if (!builtQuotes.get(q).includes(rel)) builtQuotes.get(q).push(rel);
      }
    }
  }
}

for (const [file, sources] of targets) {
  const data = readJson(...file.split('/'));
  for (const [where, text] of strings(data)) {
    for (const q of quotesIn(text)) {
      checked++;
      if (sources.some((s) => found(q, corpus[s]))) continue;
      const reg = registryNorm.get(norm(q));
      if (reg) { usedRegistry.add(reg.text); continue; }
      failures.push({ file, where, quote: q });
    }
  }
}

for (const [q, pages] of builtQuotes) {
  checked++;
  if (['wcag22', 'wcag3', 'github'].some((src) => found(q, corpus[src]))) continue;
  const reg = registryNorm.get(norm(q));
  if (reg) { usedRegistry.add(reg.text); continue; }
  failures.push({ file: `built page${pages.length > 1 ? 's' : ''} ${pages.slice(0, 3).join(', ')}${pages.length > 3 ? ` (+${pages.length - 3} more)` : ''}`, where: 'rendered text', quote: q });
}

const unusedRegistry = BUILT ? registry.filter((q) => !usedRegistry.has(q.text)) : [];
console.log(`Checked ${checked} quotations in ${targets.length} data files${BUILT ? ` and ${builtQuotes.size} distinct quotations on built pages` : ''} against WCAG 2.2 (${n22.sourceTag}), the WCAG 3 draft, ${Object.keys(raw).length} GitHub threads and ${registry.length} registry entries.`);
if (unusedRegistry.length) console.log(`Note: ${unusedRegistry.length} registry entries are no longer used and can be removed:\n  ${unusedRegistry.map((q) => q.text).join('\n  ')}`);
if (failures.length) {
  console.error(`\n❌ ${failures.length} quotation(s) not found in their sources:`);
  for (const f of failures) console.error(`  ${f.file} → ${f.where}\n    "${f.quote}"`);
  process.exit(1);
}
console.log('✅ Every quotation matches its source.');

#!/usr/bin/env node
/**
 * check-related-standards.mjs: keep public/data/related-standards.json honest.
 *
 * The Related Standards pages (ARIA, WCAG2Mobile, COGA, ACT) are written by
 * hand, but two kinds of fact on them go stale on their own:
 *
 *   1. Publication dates. Every https://www.w3.org/TR/... link in a group's
 *      `current`, `inDevelopment` and `trackedDocs` is fetched and its
 *      ReSpec <time class="dt-published"> date compared with the date on the
 *      page. W3C's own group publication lists lag (on 2026-10-08 they still
 *      showed HTML-AAM and SVG-AAM at August drafts), so the documents
 *      themselves are the source of truth.
 *   2. ACT rule counts, read from w3c/wcag-act-rules wcag-mapping.json and
 *      the list of EARL implementation reports.
 *
 * Usage:
 *   node scripts/check-related-standards.mjs          # report only, exit 1 if anything moved
 *   node scripts/check-related-standards.mjs --write  # also update dates and counts in the JSON
 *
 * A changed date means a new draft: --write updates the date, but the
 * narrative (summary, changes, future) still has to be re-read against the new
 * draft by hand. The script lists those for the weekly run.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const FILE = path.join(ROOT, 'public', 'data', 'related-standards.json');
const WRITE = process.argv.includes('--write');
const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const get = async (url, as = 'text') => {
  const res = await fetch(url, { headers: { 'user-agent': 'trackingwcag3-related-check' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return as === 'json' ? res.json() : res.text();
};

const MONTHS = { january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 };
function publishedDate(html) {
  // The dated "This version" URL, e.g. /TR/2015/WD-name-20150226/.
  const v = html.match(/This [Vv]ersion:?\s*<\/dt>\s*<dd>\s*<a href="https?:\/\/www\.w3\.org\/TR\/\d{4}\/[A-Z]+-[^"]*?-(\d{4})(\d{2})(\d{2})\/?"/);
  if (v) return `${v[1]}-${v[2]}-${v[3]}`;
  // Otherwise ReSpec's <time class="dt-published">. The dated URL wins when both
  // exist: the 2015 mobile mapping draft's datetime attribute says 02-12 while
  // its own text and URL say 26 February.
  const t = html.match(/<time[^>]*class="dt-published"[^>]*datetime="(\d{4}-\d{2}-\d{2})"/);
  if (t) return t[1];
  // Older, non-ReSpec documents: "W3C Recommendation 31 October 2019" style heading.
  const h = html.match(/W3C [A-Za-z ]*?(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})/);
  if (h) return `${h[3]}-${String(MONTHS[h[2].toLowerCase()]).padStart(2, '0')}-${h[1].padStart(2, '0')}`;
  return null;
}

const isTR = (u) => /^https:\/\/www\.w3\.org\/TR\/[^/]+\/?$/.test(u || '');
const changes = [];
const failures = [];
const cache = new Map();

async function check(group, list, dateKey, label) {
  for (const doc of list || []) {
    if (!isTR(doc.url) || !doc[dateKey]) continue;
    let live = cache.get(doc.url);
    if (live === undefined) {
      try { live = publishedDate(await get(doc.url)); } catch (e) { failures.push(`${doc.url}: ${e.message}`); live = null; }
      cache.set(doc.url, live);
    }
    if (!live) continue;
    if (live !== doc[dateKey]) {
      changes.push({ group: group.id, where: label, title: doc.title, was: doc[dateKey], now: live, url: doc.url });
      if (WRITE) doc[dateKey] = live;
    }
  }
}

for (const g of data.groups) {
  await check(g, g.current, 'date', 'current');
  await check(g, g.inDevelopment, 'date', 'inDevelopment');
  await check(g, g.trackedDocs, 'publishedDate', 'trackedDocs');
}

// ACT counts
try {
  const RAW = 'https://raw.githubusercontent.com/w3c/wcag-act-rules/main';
  const map = await get(`${RAW}/wcag-mapping.json`, 'json');
  const rules = map['act-rules'];
  const next = {
    total: rules.length,
    approved: rules.filter((r) => !r.deprecated && r.proposed === false).length,
    proposed: rules.filter((r) => !r.deprecated && r.proposed !== false).length,
    deprecated: rules.filter((r) => r.deprecated).length,
    noCriterion: rules.filter((r) => !(r.successCriteria || []).length).length,
  };
  const tree = await get('https://api.github.com/repos/w3c/wcag-act-rules/contents/content-assets/wcag-act-rules/earl', 'json').catch(() => null);
  if (Array.isArray(tree)) next.implementations = tree.filter((f) => f.name.endsWith('.json')).length;
  for (const [k, v] of Object.entries(next)) {
    if (data.act[k] !== v) {
      changes.push({ group: 'act', where: 'act counts', title: k, was: data.act[k], now: v });
      if (WRITE) data.act[k] = v;
    }
  }
  if (WRITE) data.act.checked = new Date().toISOString().slice(0, 10);
} catch (e) {
  failures.push(`ACT counts: ${e.message}`);
}

if (WRITE) fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');

console.log(`Related standards: ${cache.size} /TR/ documents checked, ${changes.length} change(s).`);
for (const c of changes) console.log(`  [${c.group}] ${c.where}: ${c.title}  ${c.was} -> ${c.now}${c.url ? `  ${c.url}` : ''}`);
const reread = [...new Set(changes.filter((c) => c.where !== 'act counts').map((c) => `${c.group}: ${c.title}`))];
if (reread.length) console.log(`\nRe-read against the new draft and update the narrative by hand:\n  ${reread.join('\n  ')}`);
for (const f of failures) console.error(`  could not check ${f}`);
process.exit(changes.length && !WRITE ? 1 : 0);

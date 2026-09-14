#!/usr/bin/env node
/**
 * merge-discussion-summaries.mjs
 * ------------------------------------------------------------------
 * Merges hand-written per-provision discussion summaries from
 * tracking/summaries/*.json into public/data/wcag3-discussions.json.
 *
 * Each summary is stamped with the fingerprint of the threads it was written
 * from, so `npm run fetch:discussions` can tell later whether the underlying
 * discussion has moved on and the summary has gone stale.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SUMMARY_DIR = path.join(ROOT, 'tracking', 'summaries');
const TARGET = path.join(ROOT, 'public', 'data', 'wcag3-discussions.json');

if (!fs.existsSync(TARGET)) {
  console.error('Run `npm run fetch:discussions` first — no discussions file to merge into.');
  process.exit(1);
}

const doc = JSON.parse(fs.readFileSync(TARGET, 'utf8'));
const files = fs.existsSync(SUMMARY_DIR)
  ? fs.readdirSync(SUMMARY_DIR).filter((f) => f.endsWith('.json')).sort()
  : [];

let applied = 0;
const unknown = [];
for (const file of files) {
  const batch = JSON.parse(fs.readFileSync(path.join(SUMMARY_DIR, file), 'utf8'));
  for (const [slug, summary] of Object.entries(batch)) {
    const entry = doc.provisions[slug];
    if (!entry) {
      unknown.push(`${slug} (${file})`);
      continue;
    }
    entry.summary = summary;
    entry.summaryOf = entry.fingerprint;
    entry.summarySource = file;
    applied += 1;
  }
}

const withDiscussion = Object.values(doc.provisions).filter((p) => p.threadCount > 0);
const summarized = withDiscussion.filter((p) => p.summary);
doc.totals.summarized = summarized.length;
doc.totals.awaitingSummary = withDiscussion.length - summarized.length;

fs.writeFileSync(TARGET, JSON.stringify(doc, null, 2));

console.log(`✔ merged ${applied} summaries from ${files.length} batch file(s)`);
console.log(`  ${summarized.length}/${withDiscussion.length} provisions with discussion are summarized`);
if (unknown.length) {
  console.log(`  ⚠️ ${unknown.length} slug(s) not found in the discussions file:`);
  for (const u of unknown) console.log(`     ${u}`);
}

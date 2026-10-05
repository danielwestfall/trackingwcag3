#!/usr/bin/env node
/**
 * merge-discussion-summaries.mjs
 * ------------------------------------------------------------------
 * Merges hand-written per-provision discussion summaries from
 * tracking/summaries/*.json into public/data/wcag3-discussions.json.
 *
 * Each summary is stamped with the fingerprint of the threads it was written
 * from, so the site can tell later whether the underlying discussion has moved
 * on and the summary has gone stale.
 *
 * The stamp is recorded ONCE, the first time a given summary text is merged,
 * in tracking/summary-stamps.json (slug -> { summaryOf, hash, source }). Later
 * runs reuse the recorded stamp. Re-stamping on every run would make every
 * summary look current forever, which is what happened before 2026-10-04.
 * Rewriting a summary changes its hash, so the new text gets a fresh stamp.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SUMMARY_DIR = path.join(ROOT, 'tracking', 'summaries');
const TARGET = path.join(ROOT, 'public', 'data', 'wcag3-discussions.json');
const STAMPS = path.join(ROOT, 'tracking', 'summary-stamps.json');

if (!fs.existsSync(TARGET)) {
  console.error('Run `npm run fetch:discussions` first — no discussions file to merge into.');
  process.exit(1);
}

const doc = JSON.parse(fs.readFileSync(TARGET, 'utf8'));
const files = fs.existsSync(SUMMARY_DIR)
  ? fs.readdirSync(SUMMARY_DIR).filter((f) => f.endsWith('.json')).sort()
  : [];

const stamps = fs.existsSync(STAMPS) ? JSON.parse(fs.readFileSync(STAMPS, 'utf8')) : {};
const hashOf = (summary) => crypto.createHash('sha256').update(JSON.stringify(summary)).digest('hex').slice(0, 16);

let applied = 0;
let newlyStamped = 0;
const unknown = [];
for (const file of files) {
  const batch = JSON.parse(fs.readFileSync(path.join(SUMMARY_DIR, file), 'utf8'));
  for (const [slug, summary] of Object.entries(batch)) {
    const entry = doc.provisions[slug];
    if (!entry) {
      unknown.push(`${slug} (${file})`);
      continue;
    }
    const hash = hashOf(summary);
    if (!stamps[slug] || stamps[slug].hash !== hash) {
      stamps[slug] = { summaryOf: entry.fingerprint, hash, source: file, stampedAt: new Date().toISOString().slice(0, 10) };
      newlyStamped += 1;
    }
    entry.summary = summary;
    entry.summaryOf = stamps[slug].summaryOf;
    entry.summarySource = file;
    applied += 1;
  }
}

const withDiscussion = Object.values(doc.provisions).filter((p) => p.threadCount > 0);
const summarized = withDiscussion.filter((p) => p.summary);
doc.totals.summarized = summarized.length;
doc.totals.staleSummaries = summarized.filter((p) => p.summaryOf !== p.fingerprint).length;
doc.totals.awaitingSummary = withDiscussion.length - summarized.length;

fs.writeFileSync(TARGET, JSON.stringify(doc, null, 2));
fs.writeFileSync(STAMPS, JSON.stringify(stamps, null, 2) + '\n');

console.log(`✔ merged ${applied} summaries from ${files.length} batch file(s)`);
console.log(`  ${summarized.length}/${withDiscussion.length} provisions with discussion are summarized`);
console.log(`  ${newlyStamped} newly stamped; ${doc.totals.staleSummaries} stale (discussion moved since the summary was written)`);
if (unknown.length) {
  console.log(`  ⚠️ ${unknown.length} slug(s) not found in the discussions file:`);
  for (const u of unknown) console.log(`     ${u}`);
}

#!/usr/bin/env node
// Validates public/data/wcag3-quick-check.json against the WCAG 3 catalog:
// every slug exists and is a core requirement, every core requirement is either
// asked about or listed as not testable yet, and question ids are unique.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const qc = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/wcag3-quick-check.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/wcag3-catalog.json'), 'utf8'));
const bySlug = new Map(catalog.map((p) => [p.slug, p]));
const errors = [];
const ids = new Set();
const asked = new Set();

function walk(item, where) {
  if (!item.id) errors.push(`${where}: question without an id`);
  else if (ids.has(item.id)) errors.push(`${where}: duplicate id ${item.id}`);
  ids.add(item.id);
  if (!item.q) errors.push(`${item.id}: missing question text`);
  if (item.provisions) {
    if (!['yes', 'no'].includes(item.meetsWhen)) errors.push(`${item.id}: meetsWhen must be yes or no`);
    for (const slug of item.provisions) {
      const p = bySlug.get(slug);
      if (!p) errors.push(`${item.id}: unknown provision ${slug}`);
      else if (p.type !== 'foundational') errors.push(`${item.id}: ${slug} is ${p.type}, not a core requirement`);
      asked.add(slug);
    }
  }
  if (item.standIn && !qc.standIns?.[item.standIn]) errors.push(`${item.id}: unknown stand-in ${item.standIn}`);
  for (const c of item.children || []) {
    if (!['yes', 'no'].includes(c.when)) errors.push(`${c.id}: child needs when: yes or no`);
    walk(c, item.id);
  }
}

for (const s of qc.sections) {
  if (s.gate) walk(s.gate, s.id);
  for (const it of s.items) walk(it, s.id);
}
const notYet = new Set(qc.notTestableYet.map((n) => n.slug));
for (const slug of notYet) {
  if (!bySlug.has(slug)) errors.push(`notTestableYet: unknown provision ${slug}`);
  if (asked.has(slug)) errors.push(`notTestableYet: ${slug} is also asked about`);
}
const core = catalog.filter((p) => p.type === 'foundational');
for (const p of core) if (!asked.has(p.slug) && !notYet.has(p.slug)) errors.push(`core requirement not covered: ${p.slug}`);

if (errors.length) {
  console.error(`Quick check: ${errors.length} problem(s)`);
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log(`Quick check: ${ids.size} questions cover ${asked.size} of ${core.length} core requirements; ${notYet.size} not testable yet. ✅`);

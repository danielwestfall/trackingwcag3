#!/usr/bin/env node
/**
 * build-search-index.mjs
 * ------------------------------------------------------------------
 * Builds a unified, lightweight search index (public/data/search-index.json)
 * containing all 87 WCAG 2.2 Success Criteria and all 245 WCAG 3.0 provisions.
 *
 * Indexed fields:
 *  - Full titles, criterion numbers, slugs
 *  - Conformance levels & requirement types
 *  - Plain-English summaries and "Why It Matters"
 *  - Bidirectional predecessor mappings (e.g. 2.5.8 Target Size -> interactive-elements-distinguishable)
 *  - Topical keywords & principles
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WCAG22_PATH = path.join(ROOT, 'public', 'data', 'wcag22-catalog.json');
const WCAG3_PATH = path.join(ROOT, 'public', 'data', 'wcag3-catalog.json');
const OUT_PATH = path.join(ROOT, 'public', 'data', 'search-index.json');

if (!fs.existsSync(WCAG22_PATH) || !fs.existsSync(WCAG3_PATH)) {
  console.error('Error: Catalogs missing. Ensure wcag22-catalog.json and wcag3-catalog.json exist.');
  process.exit(1);
}

const wcag22 = JSON.parse(fs.readFileSync(WCAG22_PATH, 'utf8'));
const wcag3 = JSON.parse(fs.readFileSync(WCAG3_PATH, 'utf8'));

const searchIndex = [];

// 1. Index WCAG 2.2 Success Criteria (87 items)
for (const sc of wcag22) {
  const mappedProvs = sc.wcag3Mapping?.provisions || [];
  const directTerms = [
    sc.num,
    sc.name,
    `Level ${sc.level}`,
    sc.principle,
    sc.w3cSlug,
    mappedProvs.join(' '),
    sc.wcag3Mapping?.evolutionNote || '',
    sc.plainEnglish?.summary || '',
    sc.plainEnglish?.whyItMatters || '',
    sc.plainEnglish?.realWorldExample || ''
  ].join(' ').toLowerCase();

  searchIndex.push({
    type: 'wcag22',
    id: sc.num,
    slug: sc.id.replace(/\./g, '-'),
    title: `${sc.num} ${sc.name}`,
    name: sc.name,
    num: sc.num,
    level: sc.level,
    principle: sc.principle,
    badge: `WCAG 2.2 ${sc.level}`,
    summary: sc.plainEnglish?.summary || '',
    whyItMatters: sc.plainEnglish?.whyItMatters || '',
    url: `/plain-english/wcag22/${sc.id.replace(/\./g, '-')}/`,
    mappedProvisions: mappedProvs,
    keywords: directTerms
  });
}

// 2. Index WCAG 3.0 Provisions (245 items)
for (const p of wcag3) {
  const directInbound = (p.wcag22Inbound?.direct || []).map((d) =>
    typeof d === 'string' ? d : `${d.num} ${d.name}`
  );
  const viaInbound = (p.wcag22Inbound?.viaGuideline || []).map((d) =>
    typeof d === 'string' ? d : `${d.num} ${d.name}`
  );
  const allInboundStr = [...directInbound, ...viaInbound].join(' ');

  const terms = [
    p.slug,
    p.title,
    p.type || '',
    p.status || '',
    p.groupSlug || '',
    allInboundStr,
    p.annotation?.plainEnglish?.summary || '',
    p.annotation?.plainEnglish?.whyItMatters || ''
  ].join(' ').toLowerCase();

  searchIndex.push({
    type: 'wcag3',
    id: p.slug,
    slug: p.slug,
    title: p.title,
    reqType: p.type || 'foundational',
    status: p.status || 'exploratory',
    group: p.groupSlug || 'general',
    badge: `WCAG 3 ${p.type || 'Provision'}`,
    summary: p.annotation?.plainEnglish?.summary || '',
    whyItMatters: p.annotation?.plainEnglish?.whyItMatters || '',
    url: `/plain-english/provision/${p.slug}/`,
    predecessors: directInbound,
    keywords: terms
  });
}

fs.writeFileSync(OUT_PATH, JSON.stringify(searchIndex, null, 2), 'utf8');
console.log(`✅ Generated unified search index with ${searchIndex.length} items (${wcag22.length} WCAG 2.2, ${wcag3.length} WCAG 3.0)`);
console.log(`   Saved to: ${OUT_PATH}`);

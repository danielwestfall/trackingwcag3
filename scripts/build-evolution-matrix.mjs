#!/usr/bin/env node
/**
 * build-evolution-matrix.mjs
 * ------------------------------------------------------------------
 * Builds public/data/wcag-evolution-matrix.json: each WCAG 2.2 success
 * criterion beside the WCAG 3 draft provisions that succeed it.
 *
 * Everything here is derived, never written by hand:
 *  - the 2.2 side comes from wcag22-catalog.json, whose summary is the Tier 1
 *    normative floor (see scripts/sync-wcag-plain-english.mjs)
 *  - the mapping comes from wcag22-data/wcag22-to-wcag3-map.json (reviewed)
 *  - each provision is shown with its own normative sentence, quoted from the
 *    draft at the tracked commit, and a source link pinned to that commit
 *
 * This replaced a hand-written "scope delta / testing impact" column that
 * described WCAG 3 features the draft doesn't contain (an APCA contrast model,
 * target-size provisions, adopted focus thresholds). The comparison is now
 * the two texts side by side, plus a factual mapping status.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WCAG22_PATH = path.join(ROOT, 'public', 'data', 'wcag22-catalog.json');
const WCAG3_PATH = path.join(ROOT, 'public', 'data', 'wcag3-catalog.json');
const STATE_PATH = path.join(ROOT, 'tracking', 'state.json');
const OUT_PATH = path.join(ROOT, 'public', 'data', 'wcag-evolution-matrix.json');

const wcag22Catalog = JSON.parse(fs.readFileSync(WCAG22_PATH, 'utf8'));
const wcag3Catalog = JSON.parse(fs.readFileSync(WCAG3_PATH, 'utf8'));
const commit = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')).lastTrackedCommit || 'main';
const wcag3BySlug = new Map(wcag3Catalog.map((p) => [p.slug, p]));

// The draft's normative sentence for a provision: its body up to the first
// directive block (:::note, :::except-when ...), with glossary markup removed.
function normativeText(rawBody = '') {
  return rawBody
    .replace(/:term\[([^\]]+)\]/g, '$1')
    .split(/\n\s*:::/)[0]
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join(' ');
}

const TYPE_LABEL = {
  foundational: 'Core requirement',
  supplemental: 'Supplemental requirement',
  assertion: 'Assertion',
  'recommended practice': 'Recommended practice',
};

function provisionCard(slug) {
  const prov = wcag3BySlug.get(slug);
  if (!prov) throw new Error(`Mapped provision "${slug}" is not in the WCAG 3 catalog`);
  return {
    slug: prov.slug,
    title: prov.title,
    type: prov.type || null,
    typeLabel: TYPE_LABEL[prov.type] || 'Requirement',
    status: prov.status || null,
    groupSlug: prov.groupSlug || null,
    text: normativeText(prov.rawBody),
    exceptWhen: prov.derived?.exceptWhen || [],
    sourceUrl: prov.derived?.sources?.provision
      ? `https://github.com/w3c/wcag3/blob/${commit}/${prov.derived.sources.provision}`
      : null,
    guideUrl: `/plain-english/provision/${prov.slug}/`,
  };
}

const STATUS = {
  successor: 'Successor in the draft',
  'related-only': 'Related provisions only',
  none: 'No provision in the draft',
  obsolete: 'Obsolete in WCAG 2.2',
};

const evolutionMatrix = wcag22Catalog.map((sc) => {
  const mapping = sc.wcag3Mapping || { provisions: [], related: [], note: null };
  const provisions = (mapping.provisions || []).map(provisionCard);
  const related = (mapping.related || []).map(provisionCard);
  const changeType = sc.obsolete ? 'obsolete'
    : provisions.length ? 'successor'
    : related.length ? 'related-only'
    : 'none';
  return {
    id: sc.num,
    num: sc.num,
    name: sc.name,
    level: sc.level,
    obsolete: !!sc.obsolete,
    principle: sc.principle,
    w3cSlug: sc.w3cSlug,
    summary: sc.plainEnglish?.summary || '',
    whyItMatters: sc.plainEnglish?.whyItMatters || '',
    trUrl: sc.trUrl || `https://www.w3.org/TR/WCAG22/#${sc.w3cSlug}`,
    understandingUrl: sc.understandingUrl || `https://www.w3.org/WAI/WCAG22/Understanding/${sc.w3cSlug}.html`,
    guideUrl: `/plain-english/wcag22/${sc.id.replace(/\./g, '-')}/`,
    provisions,
    related,
    changeAnalysis: {
      changeType,
      changeBadge: STATUS[changeType],
      note: mapping.note || null,
    },
  };
});

fs.writeFileSync(OUT_PATH, JSON.stringify(evolutionMatrix, null, 2), 'utf8');
const counts = evolutionMatrix.reduce((a, r) => ((a[r.changeAnalysis.changeType] = (a[r.changeAnalysis.changeType] || 0) + 1), a), {});
console.log(`✅ Generated WCAG Evolution Matrix with all ${evolutionMatrix.length} criteria (${JSON.stringify(counts)}), provisions quoted at ${commit}.`);

#!/usr/bin/env node
/**
 * track-upstream.mjs
 * ------------------------------------------------------------------
 * Watches the upstream W3C WCAG 3 repository (w3c/wcag3) and reports what
 * changed in the draft since the last time we looked, with an explicit read on
 * how those changes land against the WCAG 2.2 mapping in public/data.
 *
 * Usage:
 *   npm run track:upstream                       # since last tracked commit
 *   node scripts/track-upstream.mjs --from <ref> # explicit start ref
 *   node scripts/track-upstream.mjs --to <ref>   # explicit end ref
 *   node scripts/track-upstream.mjs --no-fetch   # skip the network fetch
 *   node scripts/track-upstream.mjs --dry-run    # don't advance state.json
 *
 * Writes:
 *   tracking/state.json                             last tracked upstream commit
 *   tracking/reports/<date>-upstream-changes.md     human report
 *   tracking/reports/<date>-upstream-changes.json   same data, machine readable
 *   tracking/CHANGELOG.md                           running one-line history
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TRACKING = path.join(ROOT, 'tracking');
const REPORTS = path.join(TRACKING, 'reports');
const STATE_FILE = path.join(TRACKING, 'state.json');
const CHANGELOG = path.join(TRACKING, 'CHANGELOG.md');

const UPSTREAM_URL = 'https://github.com/w3c/wcag3.git';
const UPSTREAM_REMOTE = 'upstream';
const UPSTREAM_BRANCH = 'main';
const REPO_WEB = 'https://github.com/w3c/wcag3';

/**
 * Paths whose changes we care about. src/pages/guidelines/index.astro is in the
 * list because that page — not the explainer — carries the normative
 * conformance section, which is where WCAG 3 diverges most from WCAG 2.2.
 */
const TRACKED_PATHS = [
  'guidelines',
  'informative',
  'src/pages/requirements.astro',
  'src/pages/explainer.astro',
  'src/pages/guidelines/index.astro',
];

// ---------------------------------------------------------------- args
const argv = process.argv.slice(2);
const arg = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null;
};
const flag = (name) => argv.includes(`--${name}`);

const OPT = {
  from: arg('from'),
  to: arg('to') || `${UPSTREAM_REMOTE}/${UPSTREAM_BRANCH}`,
  fetch: !flag('no-fetch'),
  dryRun: flag('dry-run'),
};

// ---------------------------------------------------------------- git
function git(args) {
  return execFileSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
}

function ensureUpstream() {
  const remotes = git(['remote']).split(/\r?\n/).map((s) => s.trim());
  if (!remotes.includes(UPSTREAM_REMOTE)) {
    console.log(`+ adding remote ${UPSTREAM_REMOTE} -> ${UPSTREAM_URL}`);
    git(['remote', 'add', UPSTREAM_REMOTE, UPSTREAM_URL]);
  }
  if (OPT.fetch) {
    console.log(`+ fetching ${UPSTREAM_REMOTE}/${UPSTREAM_BRANCH} ...`);
    git(['fetch', '--quiet', UPSTREAM_REMOTE, UPSTREAM_BRANCH]);
  }
}

/**
 * Bulk blob reader. One `git show` per file is far too slow across a few
 * hundred changed files (especially over a mounted filesystem), so every blob
 * we need is fetched in a single `git cat-file --batch` pass and cached.
 */
const blobCache = new Map();
function preloadBlobs(specs) {
  const wanted = [...new Set(specs)].filter((s) => !blobCache.has(s));
  if (!wanted.length) return;
  const out = execFileSync('git', ['cat-file', '--batch'], {
    cwd: ROOT,
    input: wanted.join('\n') + '\n',
    maxBuffer: 512 * 1024 * 1024,
  });
  let i = 0;
  for (const spec of wanted) {
    const nl = out.indexOf(0x0a, i);
    if (nl === -1) break;
    const header = out.slice(i, nl).toString('utf8');
    if (/ (missing|ambiguous)$/.test(header)) {
      blobCache.set(spec, null);
      i = nl + 1;
      continue;
    }
    const size = Number(header.split(' ')[2]);
    blobCache.set(spec, out.slice(nl + 1, nl + 1 + size).toString('utf8').replace(/\r\n/g, '\n'));
    i = nl + 1 + size + 1; // object body is followed by a newline
  }
  for (const spec of wanted) if (!blobCache.has(spec)) blobCache.set(spec, null);
}
function show(ref, file) {
  const spec = `${ref}:${file}`;
  if (!blobCache.has(spec)) preloadBlobs([spec]);
  return blobCache.get(spec) ?? null;
}

// ------------------------------------------------------- markdown parse
function parseFrontmatter(raw) {
  if (raw == null) return null;
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: raw.trim() };
  const fm = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (v.startsWith('[') && v.endsWith(']')) {
      v = v.slice(1, -1).split(',').map((x) => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
    fm[k] = v;
  }
  return { fm, body: m[2].trim() };
}

const DIRECTIVE_RE = /^:::([a-z-]+)\s*\n([\s\S]*?)^:::\s*$/gim;

/** Split a provision body into its normative sentence(s) and its ::: blocks. */
function splitBody(body) {
  const blocks = {};
  const normative = body
    .replace(DIRECTIVE_RE, (_all, name, inner) => {
      blocks[name] = (blocks[name] ? blocks[name] + '\n' : '') + inner.trim();
      return '';
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { normative, blocks };
}

function parseProvision(raw) {
  const p = parseFrontmatter(raw);
  if (!p) return null;
  const { normative, blocks } = splitBody(p.body);
  return {
    status: p.fm.status ?? null,
    type: p.fm.type ?? null,
    tags: p.fm.tags ?? null,
    needsAdditionalResearch: p.fm.needsAdditionalResearch ?? null,
    normative,
    blocks,
  };
}

function titleize(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Strip W3C authoring markup and typographic noise so we can tell a real
 * wording change from the periodic ":term[] markup + punctuation" editorial
 * passes upstream runs before each publication.
 */
function plainText(s) {
  if (s == null) return null;
  return s
    .replace(/:term\[([^\]]+)\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^[*\-+]\s+/gm, '')
    .replace(/[*_`]/g, '')
    .replace(/[,;:.]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Compact line-level diff: which lines dropped out, which appeared.
 * Lines are matched on their normalized form so that the recurring
 * capitalization/punctuation passes don't drown out real edits, but the
 * original text is what gets reported.
 */
function lineDiff(before, after) {
  const split = (s) => (s || '').split('\n').map((l) => l.trim()).filter(Boolean);
  const b = split(before), a = split(after);
  const bKeys = new Set(b.map(plainText)), aKeys = new Set(a.map(plainText));
  return {
    removed: b.filter((l) => !aKeys.has(plainText(l))),
    added: a.filter((l) => !bKeys.has(plainText(l))),
  };
}

/** Turn an .astro spec page into readable prose lines for diffing. */
function stripMarkup(html) {
  if (html == null) return '';
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&[lg]t;/g, '')
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 40 && /[a-z]/.test(l))
    .join('\n');
}

/** provision slug -> [WCAG 2.2 SC] from the local plain-English catalog. */
function loadWcag22Mapping() {
  const file = path.join(ROOT, 'public', 'data', 'wcag22-catalog.json');
  const map = new Map();
  if (!fs.existsSync(file)) return map;
  for (const sc of Object.values(JSON.parse(fs.readFileSync(file, 'utf8')))) {
    for (const slug of sc.wcag3Mapping?.provisions || []) {
      if (!map.has(slug)) map.set(slug, []);
      map.get(slug).push({ id: sc.id, name: sc.name, level: sc.level });
    }
  }
  return map;
}

function loadLocalProvisionSlugs() {
  const file = path.join(ROOT, 'public', 'data', 'wcag3-catalog.json');
  if (!fs.existsSync(file)) return null;
  return new Set(Object.values(JSON.parse(fs.readFileSync(file, 'utf8'))).map((p) => p.slug));
}

// ------------------------------------------------------------ classify
function classify(file) {
  const f = file.replace(/\\/g, '/');
  let m;
  if (f === 'guidelines/groups.json') return { kind: 'group-list' };
  if (f === 'guidelines/tags.json') return { kind: 'tags' };
  if ((m = f.match(/^guidelines\/terms\/([^/]+)\.md$/))) return { kind: 'term', slug: m[1] };
  if (f.startsWith('guidelines/acknowledgements/')) return { kind: 'acknowledgements' };
  if ((m = f.match(/^guidelines\/groups\/([^/]+)\.json$/))) return { kind: 'group-index', group: m[1] };
  if ((m = f.match(/^guidelines\/groups\/([^/]+)\/([^/]+)\.json$/))) return { kind: 'guideline-index', group: m[1], guideline: m[2] };
  if ((m = f.match(/^guidelines\/groups\/([^/]+)\/([^/]+)\.md$/))) return { kind: 'guideline', group: m[1], guideline: m[2] };
  if ((m = f.match(/^guidelines\/groups\/([^/]+)\/([^/]+)\/([^/]+)\.md$/))) return { kind: 'provision', group: m[1], guideline: m[2], slug: m[3] };
  if ((m = f.match(/^informative\/methods\/(.+)$/))) return { kind: 'method', id: m[1] };
  if ((m = f.match(/^informative\/act-rules\/(.+)$/))) return { kind: 'act-rule', id: m[1] };
  if ((m = f.match(/^informative\/best-practices\/(.+)$/))) return { kind: 'recommended-practice', id: m[1] };
  if ((m = f.match(/^informative\/guidelines\/(.+)$/))) return { kind: 'informative-doc', id: m[1] };
  if (f === 'src/pages/requirements.astro') return { kind: 'requirements-doc' };
  if (f === 'src/pages/explainer.astro') return { kind: 'explainer-doc' };
  if (f === 'src/pages/guidelines/index.astro') return { kind: 'conformance-doc' };
  return { kind: 'other' };
}

const SPEC_DOCS = ['conformance-doc', 'requirements-doc', 'explainer-doc'];

// ------------------------------------------------- commit history index
function commitIndex(from, to) {
  const out = git([
    'log', '--reverse', '-M', '--name-only', '--date=short',
    '--pretty=format:@@@%h|%ad|%s', `${from}..${to}`, '--', ...TRACKED_PATHS,
  ]);
  const commits = [];
  const byFile = new Map();
  let cur = null;
  for (const line of out.split('\n')) {
    if (line.startsWith('@@@')) {
      const [hash, date, ...rest] = line.slice(3).split('|');
      cur = { hash, date, subject: rest.join('|') };
      commits.push(cur);
    } else if (line.trim() && cur) {
      const f = line.trim();
      if (!byFile.has(f)) byFile.set(f, []);
      const list = byFile.get(f);
      if (!list.some((c) => c.hash === cur.hash)) list.push(cur);
    }
  }
  return { commits, byFile };
}

const PR_RE = /\(#(\d+)\)\s*$/;
function prLink(subject) {
  const m = subject.match(PR_RE);
  return m ? `[#${m[1]}](${REPO_WEB}/pull/${m[1]})` : null;
}

// The conformance page's headline figures live in wcag3-conformance.json and are
// rewritten from the upstream tree on every run. This used to sit below the
// "no new upstream commits" early return, which meant the figures only ever
// refreshed when upstream moved — but the catalog can change on its own (a type
// default changing, for instance), and then the page quietly disagreed with it.
// Refreshing unconditionally is the whole point of the block.
function refreshDraftState(toSha, toDate) {
  const tree = git(['ls-tree', '-r', '--name-only', toSha, '--', 'guidelines/groups']).split('\n');
  const provisionPaths = tree.filter((f) => /^guidelines\/groups\/[^/]+\/[^/]+\/[^/]+\.md$/.test(f));
  preloadBlobs(provisionPaths.map((f) => `${toSha}:${f}`));

  let taggedCount = 0;
  let needsResearchCount = 0;
  const statusTally = {};
  const typeTally = {};
  for (const f of provisionPaths) {
    const parsed = parseProvision(show(toSha, f));
    if (!parsed) continue;
    if (parsed.tags && parsed.tags.length) taggedCount += 1;
    if (parsed.needsAdditionalResearch === 'true') needsResearchCount += 1;
    statusTally[parsed.status ?? 'none'] = (statusTally[parsed.status ?? 'none'] || 0) + 1;
    typeTally[parsed.type ?? 'none'] = (typeTally[parsed.type ?? 'none'] || 0) + 1;
  }

  const conformanceFile = path.join(ROOT, 'public', 'data', 'wcag3-conformance.json');
  if (fs.existsSync(conformanceFile) && !OPT.dryRun) {
    const doc = JSON.parse(fs.readFileSync(conformanceFile, 'utf8'));
    const next = {
      baselineCommit: toSha,
      baselineDate: toDate,
      generatedAt: new Date().toISOString().slice(0, 10),
      provisionCount: provisionPaths.length,
      byType: {
        foundational: typeTally.foundational ?? 0,
        supplemental: typeTally.supplemental ?? 0,
        assertion: typeTally.assertion ?? 0,
        'recommended practice': typeTally['recommended practice'] ?? 0,
        // Provisions upstream leaves untyped. The catalog carries these as their
        // own 'exploratory' type; the two names must match or the site publishes
        // two different breakdowns of the same 245 provisions.
        exploratory: typeTally.none ?? 0,
      },
      byStatus: {
        developing: statusTally.developing ?? 0,
        exploratory: statusTally.exploratory ?? 0,
        refining: statusTally.refining ?? 0,
        mature: statusTally.mature ?? 0,
      },
      taggedForTiers: taggedCount,
      needsAdditionalResearch: needsResearchCount,
    };
    const changed = JSON.stringify(doc.draftState) !== JSON.stringify(next);
    if (changed) {
      doc.draftState = next;
      fs.writeFileSync(conformanceFile, JSON.stringify(doc, null, 2) + '\n');
      console.log('  refreshed public/data/wcag3-conformance.json draftState');
    }
  }
  return { taggedCount, needsResearchCount, statusTally, typeTally };
}

// ----------------------------------------------------------------- run
function main() {
  ensureUpstream();

  let state = { lastTrackedCommit: null, lastTrackedDate: null, history: [] };
  if (fs.existsSync(STATE_FILE)) state = { ...state, ...JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) };

  const from = OPT.from || state.lastTrackedCommit;
  if (!from) {
    console.error('No start ref. Pass --from <commit> once (the last upstream commit already merged here).');
    process.exit(1);
  }

  const fromSha = git(['rev-parse', '--short', from]).trim();
  const toSha = git(['rev-parse', '--short', OPT.to]).trim();
  const fromDate = git(['log', '-1', '--date=short', '--pretty=%ad', fromSha]).trim();
  const toDate = git(['log', '-1', '--date=short', '--pretty=%ad', toSha]).trim();

  if (fromSha === toSha) {
    console.log(`No new upstream commits. Still at ${toSha} (${toDate}).`);
    refreshDraftState(toSha, toDate);
    return;
  }

  const { commits, byFile } = commitIndex(fromSha, toSha);
  const nameStatus = git(['diff', '--name-status', '-M50%', `${fromSha}..${toSha}`, '--', ...TRACKED_PATHS]);

  // Pre-resolve every blob we will need, in one git process.
  {
    const specs = [];
    for (const line of nameStatus.split('\n')) {
      if (!line.trim()) continue;
      const parts = line.split('\t');
      const code = parts[0];
      if (code.startsWith('R')) specs.push(`${fromSha}:${parts[1]}`, `${toSha}:${parts[2]}`);
      else if (code.startsWith('A')) specs.push(`${toSha}:${parts[1]}`);
      else if (code.startsWith('D')) specs.push(`${fromSha}:${parts[1]}`);
      else specs.push(`${fromSha}:${parts[1]}`, `${toSha}:${parts[1]}`);
    }
    preloadBlobs(specs);
  }

  const changes = [];
  for (const line of nameStatus.split('\n')) {
    if (!line.trim()) continue;
    const parts = line.split('\t');
    const code = parts[0];
    let op, oldPath = null, newPath = null;
    if (code.startsWith('R')) { op = 'renamed'; oldPath = parts[1]; newPath = parts[2]; }
    else if (code.startsWith('A')) { op = 'added'; newPath = parts[1]; }
    else if (code.startsWith('D')) { op = 'removed'; oldPath = parts[1]; }
    else { op = 'modified'; oldPath = newPath = parts[1]; }

    const info = classify(newPath || oldPath);
    const rec = {
      op, kind: info.kind, oldPath, newPath, ...info,
      commits: (byFile.get(newPath) || byFile.get(oldPath) || []).map((c) => ({ ...c, pr: prLink(c.subject) })),
    };

    if (info.kind === 'provision') {
      const before = oldPath ? parseProvision(show(fromSha, oldPath)) : null;
      const after = newPath ? parseProvision(show(toSha, newPath)) : null;
      rec.before = before;
      rec.after = after;
      rec.statusChanged = before && after && before.status !== after.status;
      rec.typeChanged = before && after && before.type !== after.type;
      rec.normativeChanged = before && after && before.normative !== after.normative;
      rec.meaningChanged = Boolean(rec.normativeChanged && plainText(before.normative) !== plainText(after.normative));
      rec.editorialOnly = Boolean(rec.normativeChanged && !rec.meaningChanged);
      if (rec.meaningChanged) rec.diff = lineDiff(before.normative, after.normative);
      const names = new Set([...Object.keys(before?.blocks || {}), ...Object.keys(after?.blocks || {})]);
      rec.blocksChanged = [...names].filter((n) => (before?.blocks?.[n] ?? null) !== (after?.blocks?.[n] ?? null));
      rec.substantive = rec.op !== 'modified' || rec.statusChanged || rec.typeChanged || rec.meaningChanged;
    } else if (info.kind === 'term' || info.kind === 'guideline') {
      rec.beforeText = oldPath ? (parseFrontmatter(show(fromSha, oldPath))?.body ?? null) : null;
      rec.afterText = newPath ? (parseFrontmatter(show(toSha, newPath))?.body ?? null) : null;
      rec.substantive = plainText(rec.beforeText) !== plainText(rec.afterText);
    } else if (SPEC_DOCS.includes(info.kind)) {
      rec.prose = lineDiff(stripMarkup(show(fromSha, oldPath)), stripMarkup(show(toSha, newPath)));
      rec.substantive = true;
    } else {
      rec.substantive = true;
    }
    changes.push(rec);
  }

  const by = (kind) => changes.filter((c) => c.kind === kind);
  const prov = by('provision');
  const pick = (list, op) => list.filter((c) => c.op === op);

  const summary = {};
  for (const c of changes) {
    summary[c.kind] ??= { added: 0, removed: 0, renamed: 0, modified: 0 };
    summary[c.kind][c.op] += 1;
  }

  // ---------------------------------------------- WCAG 2.2 mapping impact
  const mapping = loadWcag22Mapping();
  const slugOf = (c) => c.slug || (c.newPath || c.oldPath).split('/').pop().replace(/\.md$/, '');
  const oldSlugOf = (c) => (c.oldPath ? c.oldPath.split('/').pop().replace(/\.md$/, '') : null);

  for (const c of prov) {
    c.criteria = mapping.get(slugOf(c)) || [];
    if (c.op === 'renamed') c.criteriaOld = mapping.get(oldSlugOf(c)) || [];
  }

  // The 2.2 catalog references a mix of provision, guideline and group slugs,
  // so resolve against all three levels before calling a reference broken.
  const tree = git(['ls-tree', '-r', '--name-only', toSha, '--', 'guidelines/groups']).split('\n');
  const upstreamSlugs = new Set();
  const guidelineSlugs = new Set();
  const groupSlugs = new Set();
  for (const f of tree) {
    let m;
    if ((m = f.match(/^guidelines\/groups\/([^/]+)\/([^/]+)\/([^/]+)\.md$/))) {
      groupSlugs.add(m[1]); guidelineSlugs.add(m[2]); upstreamSlugs.add(m[3]);
    } else if ((m = f.match(/^guidelines\/groups\/([^/]+)\/([^/]+)\.md$/))) {
      groupSlugs.add(m[1]); guidelineSlugs.add(m[2]);
    }
  }
  const renameMap = new Map(pick(prov, 'renamed').map((c) => [oldSlugOf(c), slugOf(c)]));

  const brokenMappings = [];
  const coarseMappings = [];
  for (const [slug, criteria] of mapping) {
    if (upstreamSlugs.has(slug)) continue;
    if (guidelineSlugs.has(slug)) { coarseMappings.push({ slug, level: 'guideline', criteria }); continue; }
    if (groupSlugs.has(slug)) { coarseMappings.push({ slug, level: 'group', criteria }); continue; }
    brokenMappings.push({ slug, criteria, renamedTo: renameMap.get(slug) ?? null });
  }

  // Reporting-tier readiness. The conformance section says provisions will be
  // tagged by type (harm / barrier / friction) to drive reporting tiers, but as
  // of writing nothing upstream carries a tag yet. The first tagged provision is
  // the signal that tier-based reporting has become plannable, so count them.
  const { taggedCount, needsResearchCount, statusTally, typeTally } = refreshDraftState(toSha, toDate);

  const localSlugs = loadLocalProvisionSlugs();
  const newToUs = localSlugs ? [...upstreamSlugs].filter((s) => !localSlugs.has(s)) : [];
  const goneFromUpstream = localSlugs ? [...localSlugs].filter((s) => !upstreamSlugs.has(s)) : [];

  const date = new Date().toISOString().slice(0, 10);
  const payload = {
    wcag22Impact: { brokenMappings, coarseMappings, newToUs, goneFromUpstream, upstreamProvisionCount: upstreamSlugs.size },
    draftShape: { taggedCount, needsResearchCount, statusTally, typeTally },
    generatedAt: new Date().toISOString(),
    range: { from: fromSha, fromDate, to: toSha, toDate },
    upstream: REPO_WEB,
    commitCount: commits.length,
    commits,
    summary,
    changes,
  };

  fs.mkdirSync(REPORTS, { recursive: true });
  const jsonPath = path.join(REPORTS, `${date}-upstream-changes.json`);
  const mdPath = path.join(REPORTS, `${date}-upstream-changes.md`);
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2));
  fs.writeFileSync(mdPath, renderMarkdown(payload, { prov, pick, by }));

  const edited = prov.filter((c) => c.op === 'modified' && c.substantive).length;

  if (!OPT.dryRun) {
    state.lastTrackedCommit = toSha;
    state.lastTrackedDate = toDate;
    state.lastRunAt = payload.generatedAt;
    state.history = [
      { date, from: fromSha, to: toSha, commits: commits.length, report: `tracking/reports/${date}-upstream-changes.md` },
      ...(state.history || []),
    ].slice(0, 50);
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

    const line =
      `- **${date}** — \`${fromSha}\`…\`${toSha}\` (${commits.length} commits): ` +
      `${pick(prov, 'added').length} provisions added, ${pick(prov, 'removed').length} removed, ` +
      `${pick(prov, 'renamed').length} renamed, ${edited} substantively edited. ` +
      `[report](reports/${date}-upstream-changes.md)\n`;
    const head = '# Upstream tracking log\n\nEach entry is one run of `npm run track:upstream`.\n\n';
    const existing = fs.existsSync(CHANGELOG) ? fs.readFileSync(CHANGELOG, 'utf8').replace(head, '') : '';
    fs.writeFileSync(CHANGELOG, head + line + existing);
  }

  console.log(`\n✔ ${commits.length} upstream commits, ${changes.length} tracked file changes`);
  console.log(`  provisions: +${pick(prov, 'added').length} -${pick(prov, 'removed').length} ~${pick(prov, 'renamed').length} renamed, ${edited} edited`);
  console.log(`  2.2 mapping: ${brokenMappings.length} broken, ${coarseMappings.length} coarse, ${newToUs.length} upstream provisions not in your catalog`);
  console.log(`  report: ${path.relative(ROOT, mdPath)}`);
  if (OPT.dryRun) console.log('  (dry run — state.json not advanced)');
}

// ------------------------------------------------------------- render
function renderMarkdown(p, { prov, pick, by }) {
  const L = [];
  const w = (s = '') => L.push(s);
  const provLabel = (c) => `**${titleize(slugFromChange(c))}** \`${c.group}/${c.guideline}/${slugFromChange(c)}\``;
  const commitRefs = (c) => (c.commits.length ? c.commits.map((x) => x.pr || `\`${x.hash}\``).join(', ') : '—');

  w(`# WCAG 3 upstream change report`);
  w();
  w(`**Range:** \`${p.range.from}\` (${p.range.fromDate}) → \`${p.range.to}\` (${p.range.toDate})  `);
  w(`**Upstream:** ${p.upstream}  `);
  w(`**Commits touching tracked spec content:** ${p.commitCount}  `);
  w(`**Generated:** ${p.generatedAt.slice(0, 10)}`);
  w();
  w(`> Automated diff of the W3C WCAG 3 editors' draft. Everything below is draft`);
  w(`> material and can change again before Candidate Recommendation.`);
  w();

  w(`## Summary`);
  w();
  w(`| Area | Added | Removed | Renamed | Modified |`);
  w(`| --- | ---: | ---: | ---: | ---: |`);
  const order = ['provision', 'guideline', 'guideline-index', 'group-index', 'group-list', 'term', 'tags',
    'conformance-doc', 'requirements-doc', 'explainer-doc', 'informative-doc', 'method', 'act-rule',
    'recommended-practice', 'acknowledgements', 'other'];
  for (const k of order) {
    const s = p.summary[k];
    if (!s) continue;
    w(`| ${k} | ${s.added} | ${s.removed} | ${s.renamed} | ${s.modified} |`);
  }
  w();

  // ----- spec documents first: this is where 2.2 → 3 structural change lives
  const specDocs = p.changes.filter((c) => SPEC_DOCS.includes(c.kind));
  if (specDocs.length) {
    w(`## Conformance model, Requirements & Explainer`);
    w();
    w(`This is where WCAG 3 departs from WCAG 2.2 structurally. Read this before the provision lists.`);
    w();
    const names = {
      'conformance-doc': 'Guidelines document (carries the normative conformance section)',
      'requirements-doc': 'Requirements for WCAG 3.0',
      'explainer-doc': 'Explainer',
    };
    for (const c of specDocs.sort((a, b) => SPEC_DOCS.indexOf(a.kind) - SPEC_DOCS.indexOf(b.kind))) {
      w(`### ${names[c.kind]}`);
      w();
      for (const x of c.commits) {
        const pr = prLink(x.subject);
        w(`- \`${x.hash}\` ${x.date} — ${x.subject.replace(PR_RE, '').trim()}${pr ? ` ${pr}` : ''}`);
      }
      w();
      const add = (c.prose?.added || []).slice(0, 25);
      const rem = (c.prose?.removed || []).slice(0, 12);
      if (add.length) {
        w(`**New or rewritten prose** (${c.prose.added.length} lines; first ${add.length}):`);
        w();
        for (const l of add) w(`> ${l}`);
        w();
      }
      if (rem.length) {
        w(`**Dropped prose** (${c.prose.removed.length} lines; first ${rem.length}):`);
        w();
        for (const l of rem) w(`> ~~${l}~~`);
        w();
      }
    }
  }

  w(`## Provisions`);
  w();

  const section = (title, list, render) => {
    if (!list.length) return;
    w(`### ${title} (${list.length})`);
    w();
    list.forEach(render);
    w();
  };

  section('Added', pick(prov, 'added'), (c) => {
    w(`- ${provLabel(c)} — \`${c.after?.status}\` / \`${c.after?.type}\` — ${commitRefs(c)}`);
    if (c.after?.normative) w(`  > ${c.after.normative.split('\n')[0]}`);
    if (c.criteria?.length) w(`  - 2.2 touchpoints: ${c.criteria.map((x) => `${x.id} (${x.level})`).join(', ')}`);
  });

  section('Removed', pick(prov, 'removed'), (c) => {
    w(`- ${provLabel(c)} — ${commitRefs(c)}`);
    if (c.before?.normative) w(`  > ~~${c.before.normative.split('\n')[0]}~~`);
    if (c.criteria?.length) w(`  - ⚠️ your catalog maps ${c.criteria.map((x) => x.id).join(', ')} to this slug — remap needed`);
  });

  section('Renamed / moved', pick(prov, 'renamed'), (c) => {
    w(`- \`${c.oldPath.replace('guidelines/groups/', '')}\` → \`${c.newPath.replace('guidelines/groups/', '')}\` — ${commitRefs(c)}`);
    if (c.meaningChanged) {
      w(`  - **text also changed:**`);
      w(`    - was: ${c.before?.normative?.split('\n')[0] ?? '—'}`);
      w(`    - now: ${c.after?.normative?.split('\n')[0] ?? '—'}`);
    }
    if (c.criteriaOld?.length) {
      w(`  - ⚠️ your catalog maps ${c.criteriaOld.map((x) => x.id).join(', ')} to the old slug — retarget to \`${slugFromChange(c)}\``);
    }
  });

  const statusOrType = prov.filter((c) => c.op === 'modified' && (c.statusChanged || c.typeChanged));
  section('Status / type changes', statusOrType, (c) => {
    const bits = [];
    if (c.statusChanged) bits.push(`status \`${c.before.status}\` → \`${c.after.status}\``);
    if (c.typeChanged) bits.push(`type \`${c.before.type}\` → \`${c.after.type}\``);
    w(`- ${provLabel(c)} — ${bits.join('; ')} — ${commitRefs(c)}`);
  });

  const meaning = prov.filter((c) => c.op === 'modified' && c.meaningChanged);
  if (meaning.length) {
    w(`### Normative wording changes (${meaning.length})`);
    w();
    w(`Wording that changed in substance, after normalizing away \`:term[]\` markup and punctuation.`);
    w();
    for (const c of meaning) {
      w(`- ${provLabel(c)} — ${commitRefs(c)}`);
      for (const l of (c.diff?.removed || []).slice(0, 4)) w(`  - − ${l}`);
      for (const l of (c.diff?.added || []).slice(0, 4)) w(`  - + ${l}`);
      if (c.criteria?.length) w(`  - 2.2 touchpoints: ${c.criteria.map((x) => `${x.id} (${x.level})`).join(', ')}`);
    }
    w();
  }

  const editorial = prov.filter((c) => c.op === 'modified' && c.editorialOnly);
  if (editorial.length) {
    w(`### Editorial-only changes (${editorial.length})`);
    w();
    w(`\`:term[]\` markup, punctuation or whitespace only — meaning unchanged. Listed so a`);
    w(`re-sync of the raw bodies stays traceable; none of these need a plain-English rewrite.`);
    w();
    w(editorial.map((c) => `\`${slugFromChange(c)}\``).join(', '));
    w();
  }

  const blocksOnly = prov.filter((c) => c.op === 'modified' && !c.normativeChanged && !c.statusChanged && !c.typeChanged && c.blocksChanged?.length);
  if (blocksOnly.length) {
    w(`### Supporting-block edits only (${blocksOnly.length})`);
    w();
    w(`Normative sentence unchanged; \`applies-when\` / \`except-when\` / \`ednote\` / \`example\` blocks edited.`);
    w();
    for (const c of blocksOnly) w(`- ${provLabel(c)} — blocks: ${c.blocksChanged.map((b) => `\`${b}\``).join(', ')} — ${commitRefs(c)}`);
    w();
  }

  const structural = p.changes.filter((c) => ['guideline', 'guideline-index', 'group-index', 'group-list', 'tags'].includes(c.kind));
  if (structural.length) {
    w(`## Structure (groups, guidelines, tags)`);
    w();
    for (const c of structural) {
      const label = c.op === 'renamed' ? `\`${c.oldPath}\` → \`${c.newPath}\`` : `\`${c.newPath || c.oldPath}\``;
      w(`- **${c.op}** ${label} — ${commitRefs(c)}`);
    }
    w();
  }

  const terms = by('term');
  if (terms.length) {
    w(`## Glossary terms`);
    w();
    w(`Definition changes ripple into every provision that uses \`:term[...]\`.`);
    w();
    for (const c of terms) {
      w(`- **${c.op}** \`${slugFromChange(c)}\`${c.substantive ? '' : ' *(editorial)*'} — ${commitRefs(c)}`);
      const text = c.afterText || c.beforeText;
      if (text) w(`  > ${text.split('\n')[0].slice(0, 220)}`);
    }
    w();
  }

  const informative = p.changes.filter((c) => ['method', 'act-rule', 'recommended-practice', 'informative-doc'].includes(c.kind));
  if (informative.length) {
    w(`## Informative materials (${informative.length} files)`);
    w();
    const counts = {};
    for (const c of informative) {
      counts[c.kind] ??= { added: 0, removed: 0, renamed: 0, modified: 0 };
      counts[c.kind][c.op] += 1;
    }
    for (const [k, v] of Object.entries(counts)) {
      w(`- **${k}**: ${v.added} added, ${v.removed} removed, ${v.renamed} renamed, ${v.modified} modified`);
    }
    w();
  }

  // ----- mapping health
  const imp = p.wcag22Impact || {};
  const shape = p.draftShape || {};
  w(`## Draft shape right now`);
  w();
  w(`Upstream publishes **${imp.upstreamProvisionCount ?? '?'}** provisions.`);
  w();
  const tally = (obj) => Object.entries(obj || {}).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ');
  w(`- **By type:** ${tally(shape.typeTally)}`);
  w(`- **By maturity status:** ${tally(shape.statusTally)}`);
  w(`- **Flagged \`needsAdditionalResearch\`:** ${shape.needsResearchCount ?? '?'}`);
  w(`- **Tagged for reporting tiers:** ${shape.taggedCount ?? '?'} of ${imp.upstreamProvisionCount ?? '?'}`);
  w();
  if (shape.taggedCount === 0) {
    w(`No provision carries a tag yet. Reporting tiers are described in the conformance`);
    w(`section but the harm / barrier / friction tagging that drives them has not been`);
    w(`applied, so tier placement can't be predicted per provision. Watch this number.`);
  } else {
    w(`⚠️ Provisions have started carrying tags — reporting-tier placement is now`);
    w(`partially derivable. Revisit the tier analysis.`);
  }
  w();

  w(`## Impact on your WCAG 2.2 → 3 mapping`);
  w();
  if (imp.brokenMappings?.length) {
    w(`### Broken references in \`public/data/wcag22-catalog.json\` (${imp.brokenMappings.length})`);
    w();
    w(`Slugs referenced by \`wcag3Mapping.provisions\` that resolve to nothing upstream.`);
    w();
    for (const b of imp.brokenMappings) {
      const to = b.renamedTo ? ` → renamed upstream to \`${b.renamedTo}\`` : ' → **no upstream target, needs a new one**';
      w(`- \`${b.slug}\`${to}  \n  referenced by ${b.criteria.map((x) => `${x.id} ${x.name} (${x.level})`).join(', ')}`);
    }
    w();
  } else {
    w(`No broken provision references. ✔`);
    w();
  }
  if (imp.coarseMappings?.length) {
    w(`### References pointing at a guideline or group, not a provision (${imp.coarseMappings.length})`);
    w();
    w(`These resolve upstream, but at a coarser level than a provision, so they can't`);
    w(`carry a provision-level status or type. Worth tightening.`);
    w();
    for (const b of imp.coarseMappings) {
      w(`- \`${b.slug}\` (${b.level}) — referenced by ${b.criteria.map((x) => x.id).join(', ')}`);
    }
    w();
  }
  if (imp.newToUs?.length) {
    w(`### Upstream provisions missing from your catalog (${imp.newToUs.length})`);
    w();
    w(`Merge upstream, run \`npm run sync:plain-english\`, then write annotations for:`);
    w();
    w(imp.newToUs.map((x) => `\`${x}\``).join(', '));
    w();
  }
  if (imp.goneFromUpstream?.length) {
    w(`### In your catalog but no longer upstream (${imp.goneFromUpstream.length})`);
    w();
    w(imp.goneFromUpstream.map((x) => `\`${x}\``).join(', '));
    w();
  }

  w(`## Commits touching tracked content`);
  w();
  for (const c of p.commits.slice().reverse()) {
    const pr = prLink(c.subject);
    w(`- \`${c.hash}\` ${c.date} — ${c.subject.replace(PR_RE, '').trim()}${pr ? ` ${pr}` : ''}`);
  }
  w();

  return L.join('\n');
}

function slugFromChange(c) {
  return c.slug || (c.newPath || c.oldPath).split('/').pop().replace(/\.md$/, '');
}

main();

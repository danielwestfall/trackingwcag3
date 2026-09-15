#!/usr/bin/env node
/**
 * fetch-provision-discussions.mjs
 * ------------------------------------------------------------------
 * Pulls every issue and comment from the W3C WCAG 3 repository and groups them
 * by the provision they are about, using the `P - <provision name>` labels the
 * working group applies.
 *
 * Usage:
 *   npm run fetch:discussions              # incremental, uses the local cache
 *   node scripts/fetch-provision-discussions.mjs --full   # ignore the cache
 *
 * Writes:
 *   tracking/discussions-raw.json          full issue + comment bodies (cache)
 *   public/data/wcag3-discussions.json     grouped by provision, for the site
 *
 * The raw cache is what a summarizing pass reads; the public file carries the
 * thread metadata the site renders plus whatever summaries have been written
 * into it, which this script preserves across runs.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW_FILE = path.join(ROOT, 'tracking', 'discussions-raw.json');
const PUBLIC_FILE = path.join(ROOT, 'public', 'data', 'wcag3-discussions.json');
const REPO = 'w3c/wcag3';
const API = `https://api.github.com/repos/${REPO}`;
const WEB = `https://github.com/${REPO}`;

const FULL = process.argv.includes('--full');
const CONCURRENCY = 8;

/**
 * Token lookup, in order: GITHUB_TOKEN in the environment, then a gitignored
 * .env file at the repo root holding `GITHUB_TOKEN=...`. Without one GitHub
 * allows 60 requests an hour; with any token, scopeless included, it is 5000.
 * The repo is public, so the token needs no scopes at all.
 */
function readToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  const envFile = path.join(ROOT, '.env');
  if (!fs.existsSync(envFile)) return null;
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*GITHUB_TOKEN\s*=\s*(.+?)\s*$/);
    if (m) return m[1].replace(/^["']|["']$/g, '');
  }
  return null;
}

const TOKEN = readToken();

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'wcag3-tracker',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

/**
 * Thrown when GitHub's hourly budget is spent. Unauthenticated callers get 60
 * requests an hour, which is not enough to walk this repo in one pass, so the
 * run saves what it has and asks to be resumed rather than failing.
 */
class RateLimited extends Error {
  constructor(resetAt) {
    super('GitHub rate limit exhausted');
    this.resetAt = resetAt;
  }
}

let budgetSpent = false;

async function api(url) {
  if (budgetSpent) throw new RateLimited(null);
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch(url, { headers });
    if (r.ok) return r.json();

    // A genuine rate-limit refusal always carries the budget headers. Read
    // them as null-or-number rather than through Number(), because
    // Number(null) is 0 — which made every header-less 403 (an egress policy
    // denial, a bad or expired token, SSO enforcement) masquerade as an
    // exhausted quota and send the caller off to wait for a reset that was
    // never coming.
    const remainingHeader = r.headers.get('x-ratelimit-remaining');
    const remaining = remainingHeader === null ? null : Number(remainingHeader);
    const reset = Number(r.headers.get('x-ratelimit-reset'));

    if ((r.status === 403 || r.status === 429) && remaining === 0) {
      budgetSpent = true;
      throw new RateLimited(reset ? new Date(reset * 1000) : null);
    }

    // A 403 with no budget headers is not a quota problem and will not fix
    // itself on a retry. Fail with whatever GitHub actually said.
    if (r.status === 403 && remaining === null) {
      let detail = '';
      try {
        detail = String((await r.json()).message || '').trim();
      } catch {
        /* body was not JSON */
      }
      throw new Error(`403 Forbidden for ${url}${detail ? ` — ${detail}` : ''}`);
    }

    if (r.status === 403 || r.status === 429 || r.status >= 500) {
      await new Promise((res) => setTimeout(res, 1500 * (attempt + 1)));
      continue;
    }

    throw new Error(`${r.status} ${r.statusText} for ${url}`);
  }
  throw new Error(`gave up on ${url}`);
}

async function checkBudget() {
  const r = await fetch('https://api.github.com/rate_limit', { headers });
  const core = (await r.json()).resources.core;
  const mins = Math.max(0, Math.round((core.reset * 1000 - Date.now()) / 60000));
  console.log(
    `GitHub budget: ${core.remaining}/${core.limit} remaining, resets in ${mins} min` +
      (headers.Authorization ? ' (authenticated)' : ' (unauthenticated \u2014 set GITHUB_TOKEN for 5000/hr)')
  );
  return core.remaining;
}

/** Run tasks with bounded concurrency. */
async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    })
  );
  return out;
}

// ------------------------------------------------ provision slug resolution
function parseFrontmatter(raw) {
  const m = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    fm[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return fm;
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

/** Normalize a label or title down to something comparable with a slug. */
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

function loadProvisions() {
  const groupsDir = path.join(ROOT, 'guidelines', 'groups');
  const provisions = [];
  for (const file of walk(groupsDir)) {
    const rel = path.relative(groupsDir, file).replace(/\\/g, '/');
    const parts = rel.split('/');
    if (parts.length !== 3) continue; // group/guideline/provision.md
    const slug = parts[2].replace(/\.md$/, '');
    const fm = parseFrontmatter(fs.readFileSync(file, 'utf8'));
    provisions.push({
      slug,
      group: parts[0],
      guideline: parts[1],
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      issueLabel: fm.issueLabel || null,
      status: fm.status ?? null,
      type: fm.type ?? null,
    });
  }
  return provisions;
}

/**
 * Build label -> slug. Upstream derives the label from the provision title and
 * shortens it past 50 characters, with an issueLabel frontmatter override, so
 * match on a normalized form and fall back to a prefix match for truncations.
 */
function buildLabelIndex(provisions) {
  const exact = new Map();
  for (const p of provisions) {
    exact.set(norm(p.title), p.slug);
    if (p.issueLabel) exact.set(norm(p.issueLabel), p.slug);
  }
  return (label) => {
    const body = label.replace(/^P\s*-\s*/, '');
    const key = norm(body);
    if (exact.has(key)) return exact.get(key);
    // Labels are shortened past 50 chars, and a few carry extra context the
    // slug does not ("Deceptive messaging expert review" -> messaging-expert-review).
    // Try truncation first, then containment, preferring the longest match.
    let best = null;
    for (const [k, slug] of exact) {
      if (k.startsWith(key) && (!best || k.length < best.len)) best = { slug, len: k.length };
    }
    if (best) return best.slug;
    for (const [k, slug] of exact) {
      if (k.length >= 8 && key.includes(k) && (!best || k.length > best.len)) best = { slug, len: k.length };
    }
    return best?.slug ?? null;
  };
}

// ------------------------------------------------------------------ fetch
async function fetchIssues() {
  const all = [];
  for (let page = 1; page <= 20; page++) {
    const batch = await api(`${API}/issues?state=all&per_page=100&page=${page}`);
    if (!batch.length) break;
    for (const i of batch) {
      if (i.pull_request) continue;
      all.push({
        number: i.number,
        title: i.title,
        state: i.state,
        labels: i.labels.map((l) => l.name),
        user: i.user?.login ?? null,
        created: i.created_at,
        updated: i.updated_at,
        closed: i.closed_at,
        commentCount: i.comments,
        body: i.body || '',
        url: `${WEB}/issues/${i.number}`,
      });
    }
    process.stdout.write(`\r  issues fetched: ${all.length}`);
  }
  process.stdout.write('\n');
  return all;
}

async function fetchComments(issue) {
  if (!issue.commentCount) return [];
  const out = [];
  for (let page = 1; page <= 10; page++) {
    const batch = await api(`${API}/issues/${issue.number}/comments?per_page=100&page=${page}`);
    if (!batch.length) break;
    for (const c of batch) {
      out.push({ user: c.user?.login ?? null, created: c.created_at, body: c.body || '' });
    }
    if (batch.length < 100) break;
  }
  return out;
}

// ------------------------------------------------------------------- main
async function main() {
  const provisions = loadProvisions();
  const resolve = buildLabelIndex(provisions);
  console.log(`Loaded ${provisions.length} provisions from guidelines/groups`);

  let cache = { issues: {}, fetchedAt: null };
  if (!FULL && fs.existsSync(RAW_FILE)) {
    cache = JSON.parse(fs.readFileSync(RAW_FILE, 'utf8'));
    console.log(`Cache holds ${Object.keys(cache.issues).length} issues`);
  }

  console.log('Fetching issue list...');
  let issues;
  try {
    issues = await fetchIssues();
  } catch (e) {
    if (e instanceof RateLimited) {
      console.log('\u26A0\uFE0F  No budget left to even list issues. Re-run later or set GITHUB_TOKEN.');
      return;
    }
    throw e;
  }

  // Only issues that actually carry comments cost an API call.
  const stale = issues.filter((i) => {
    const c = cache.issues[i.number];
    return (!c || c.updated !== i.updated) && i.commentCount > 0;
  });

  // Spend a limited budget where it buys the most: provisions with the busiest
  // discussion first, then the heaviest threads within them. Issues with no
  // provision label go last.
  const threadsPerProvision = new Map();
  for (const i of issues) {
    for (const l of i.labels.filter((x) => x.startsWith('P - '))) {
      const slug = resolve(l);
      if (slug) threadsPerProvision.set(slug, (threadsPerProvision.get(slug) || 0) + 1);
    }
  }
  const priority = (issue) => {
    const slugs = issue.labels
      .filter((l) => l.startsWith('P - '))
      .map(resolve)
      .filter(Boolean);
    if (!slugs.length) return -1; // unlabelled: last
    return Math.max(...slugs.map((s) => threadsPerProvision.get(s) || 0));
  };
  stale.sort((a, b) => priority(b) - priority(a) || b.commentCount - a.commentCount);

  const budget = await checkBudget();
  console.log(
    `${issues.length} issues total; ${stale.length} need a comment fetch; ` +
      `budget allows about ${budget} of them this hour`
  );
  if (stale.length > budget) {
    const top = stale.slice(0, budget);
    const provs = new Set(top.flatMap((i) => i.labels.filter((l) => l.startsWith('P - '))));
    console.log(`  prioritising ${provs.size} provisions with the most discussion first`);
  }

  let done = 0;
  let ranOut = null;
  const saveCache = () => {
    cache.fetchedAt = new Date().toISOString();
    fs.mkdirSync(path.dirname(RAW_FILE), { recursive: true });
    fs.writeFileSync(RAW_FILE, JSON.stringify(cache, null, 2));
  };
  await pool(stale, CONCURRENCY, async (issue) => {
    if (ranOut) return;
    try {
      issue.comments = await fetchComments(issue);
      cache.issues[issue.number] = issue;
      done += 1;
      if (done % 10 === 0) {
        process.stdout.write(`\r  comments fetched for ${done}/${stale.length}`);
        saveCache(); // keep partial progress across a rate-limit stop
      }
    } catch (e) {
      if (e instanceof RateLimited) ranOut = e;
      else throw e;
    }
  });
  process.stdout.write('\n');
  saveCache();
  if (ranOut) {
    const mins = ranOut.resetAt ? Math.max(0, Math.round((ranOut.resetAt - Date.now()) / 60000)) : '?';
    console.log(`\n\u26A0\uFE0F  Ran out of GitHub budget after ${done}/${stale.length} issues.`);
    console.log(`   Progress is saved. Re-run in ~${mins} min to continue, or set GITHUB_TOKEN`);
    console.log(`   (any token, even scopeless, raises the limit from 60/hr to 5000/hr).`);
  }

  // keep unchanged issues, drop any that vanished upstream
  const live = new Set(issues.map((i) => String(i.number)));
  for (const n of Object.keys(cache.issues)) if (!live.has(n)) delete cache.issues[n];
  for (const i of issues) if (!cache.issues[i.number]) cache.issues[i.number] = { ...i, comments: [] };

  saveCache();

  // ---- group by provision
  const byProvision = new Map(provisions.map((p) => [p.slug, []]));
  const unmatchedLabels = new Map();
  const general = []; // issues with no provision label

  for (const issue of Object.values(cache.issues)) {
    const pLabels = issue.labels.filter((l) => l.startsWith('P - '));
    if (!pLabels.length) {
      general.push(issue);
      continue;
    }
    let placed = false;
    for (const label of pLabels) {
      const slug = resolve(label);
      if (slug && byProvision.has(slug)) {
        byProvision.get(slug).push(issue);
        placed = true;
      } else {
        unmatchedLabels.set(label, (unmatchedLabels.get(label) || 0) + 1);
      }
    }
    if (!placed) general.push(issue);
  }

  // ---- preserve any summaries already written into the public file
  let existingSummaries = {};
  if (fs.existsSync(PUBLIC_FILE)) {
    const prev = JSON.parse(fs.readFileSync(PUBLIC_FILE, 'utf8'));
    for (const [slug, entry] of Object.entries(prev.provisions || {})) {
      if (entry.summary) existingSummaries[slug] = { summary: entry.summary, summaryOf: entry.summaryOf };
    }
  }

  const out = {
    generatedAt: cache.fetchedAt,
    repo: WEB,
    totals: {
      provisions: provisions.length,
      issuesTotal: Object.keys(cache.issues).length,
      issuesWithProvisionLabel: Object.values(cache.issues).filter((i) =>
        i.labels.some((l) => l.startsWith('P - '))
      ).length,
      provisionsWithDiscussion: [...byProvision.values()].filter((v) => v.length).length,
      generalIssues: general.length,
    },
    provisions: {},
    unmatchedLabels: Object.fromEntries(unmatchedLabels),
  };

  for (const p of provisions) {
    const threads = byProvision.get(p.slug) || [];
    threads.sort((a, b) => (a.number < b.number ? -1 : 1));
    const prev = existingSummaries[p.slug];
    // A summary is stale if the thread set or any thread's last update moved.
    const fingerprint = threads.map((t) => `${t.number}@${t.updated}`).join(',');
    out.provisions[p.slug] = {
      slug: p.slug,
      title: p.title,
      group: p.group,
      guideline: p.guideline,
      status: p.status,
      type: p.type,
      threadCount: threads.length,
      // No recorded discussion usually means nobody has filed on it yet, not
      // that the working group has settled it. The site must say so.
      noRecordedDiscussion: threads.length === 0,
      commentCount: threads.reduce((a, t) => a + (t.comments?.length ?? 0), 0),
      openCount: threads.filter((t) => t.state === 'open').length,
      fingerprint,
      threads: threads.map((t) => ({
        number: t.number,
        title: t.title,
        state: t.state,
        url: t.url,
        created: t.created.slice(0, 10),
        updated: t.updated.slice(0, 10),
        comments: t.comments?.length ?? 0,
        labels: t.labels.filter((l) => !l.startsWith('P - ')),
      })),
      ...(prev && prev.summaryOf === fingerprint ? { summary: prev.summary, summaryOf: prev.summaryOf } : {}),
    };
  }

  fs.writeFileSync(PUBLIC_FILE, JSON.stringify(out, null, 2));

  console.log('');
  console.log(`✔ ${out.totals.issuesTotal} issues cached (${out.totals.issuesWithProvisionLabel} provision-labelled)`);
  console.log(`  ${out.totals.provisionsWithDiscussion}/${provisions.length} provisions have recorded discussion`);
  console.log(`  ${out.totals.generalIssues} issues sit at group level with no provision label`);
  if (unmatchedLabels.size) {
    console.log(`  ⚠️ ${unmatchedLabels.size} provision labels did not resolve to a slug:`);
    for (const [l, n] of unmatchedLabels) console.log(`     ${n}×  ${l}`);
  }
  console.log(`  raw:    ${path.relative(ROOT, RAW_FILE)}`);
  console.log(`  public: ${path.relative(ROOT, PUBLIC_FILE)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

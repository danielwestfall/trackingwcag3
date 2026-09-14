# Upstream tracking

This folder is the change-tracking layer for the site: it watches the W3C
editors' draft of WCAG 3 (`w3c/wcag3`) and reports what moved since the last
time we looked, in terms that map onto the plain-English catalogs in
`public/data/`.

## Running it

```bash
npm run track:upstream          # fetch upstream, diff since tracking/state.json, write a report
npm run track:upstream:dry      # same, but don't advance state.json
node scripts/track-upstream.mjs --from <ref> --to <ref>   # any explicit range
```

The first run needs `--from <commit>`: the last upstream commit already merged
into this fork. After that the range is remembered in `state.json`.

## What comes out

| File | What it is |
| --- | --- |
| `state.json` | Last tracked upstream commit + a run history |
| `CHANGELOG.md` | One line per run, newest first |
| `reports/<date>-upstream-changes.md` | The readable report |
| `reports/<date>-upstream-changes.json` | Same data, for feeding the site or a script |

## What it tracks, and why

`TRACKED_PATHS` in the script is deliberately narrow:

- `guidelines/` — groups, guidelines, provisions, glossary terms
- `informative/` — methods, ACT rules, recommended practices
- `src/pages/requirements.astro` — Requirements for WCAG 3.0
- `src/pages/explainer.astro` — the Explainer
- `src/pages/guidelines/index.astro` — **the normative conformance section**

That last one matters more than it looks. The conformance model is not in the
explainer; it lives in the guidelines page. Conformance is where WCAG 3 differs
from WCAG 2.2 most sharply, so a tracker that only watched `guidelines/` would
miss the single most consequential class of change.

## How it separates signal from noise

Upstream runs a large editorial pass before each publication — wrapping terms in
`:term[...]`, normalizing punctuation and list capitalization. Those passes touch
a hundred-plus provisions at a time and mean nothing for implementers.

Every normative sentence is therefore compared twice: raw, and again after
normalizing away `:term[]` markup, emphasis, list markers, punctuation and case.
Changes are then reported as:

- **Normative wording changes** — survived normalization; the meaning moved
- **Editorial-only changes** — did not; listed for traceability only
- **Supporting-block edits** — the normative sentence is untouched but
  `applies-when` / `except-when` / `ednote` / `example` changed

Renames are resolved by git's own rename detection rather than by guessing at
content similarity, so a provision that moves between guidelines is reported as
one move instead of an unrelated add plus delete.

## The 2.2 mapping health check

Each report ends with a section that checks `public/data/wcag22-catalog.json`
against what actually exists upstream:

- **Broken references** — a `wcag3Mapping.provisions` slug that resolves to
  nothing upstream, with the renamed target when there is one
- **Coarse references** — a slug that resolves to a *guideline* or *group*
  rather than a provision, so it can't carry a provision-level status or type
- **Upstream provisions missing from the catalog** — what to annotate after the
  next `npm run sync:plain-english`
- **In the catalog but gone upstream** — stale entries to retire

This is the part that keeps the WCAG 2.2 → 3 cross-references on the site
honest as the draft churns.

## Suggested loop

1. `npm run track:upstream` (or let the scheduled task do it)
2. Read the report, starting at *Conformance model, Requirements & Explainer*
3. `git merge upstream/main` when you're ready to take the content
4. `npm run sync:plain-english` to rebuild the catalogs
5. Write annotations for anything listed under *missing from your catalog*
6. Fix whatever the mapping health check flagged

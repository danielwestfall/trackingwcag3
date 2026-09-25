# WCAG 3 & 2.2 Plain English Reference Hub 🌐♿

> **Tracking and translating WCAG 3.0 draft guidelines, architectural shifts, and WCAG 2.2 accessibility standards into plain, actionable English.**

An accessible, fast, decoupled educational web application built with **Astro**, **TypeScript**, and an accessible **Cyber-Clarity Design System**. Built for designers, developers, QA engineers, and product managers to understand, test, track, and operationalize W3C Web Content Accessibility Guidelines.

---

## 🌟 Key Features & Capabilities

### 1. 🎨 Accessible Cyber-Clarity Design System (WCAG 2.2 AA / AAA Compliant)
- **High-Contrast Dark & Light Elevation Systems**: Built with high contrast tokens exceeding WCAG 2.2 Level AA (4.5:1 for normal copy, 3:1 for large copy and UI boundaries) and Level AAA in primary reader views.
- **Tactile Header Switch Toggle**: Sliding switch track with moon (🌙) / sun (☀️) indicators, semantic `role="switch"` and `aria-checked` states, keyboard shortcut (`T`), and zero-FOUC persistent theme storage.
- **Accessible Text Enhancements**: Custom letter-stroke rendering and drop-shadows on gradient text headings to ensure strict $7:1+$ readability against light surfaces.

### 2. 📘 WCAG 3.0 Explorer (`/plain-english/`)
- **245 W3C Draft Provisions**: Educational breakdowns across all functional categories (*Text*, *Navigation*, *Media*, *Interactivity*, *Forms*, *Assistive Tech Control*, etc.). Tracked against the W3C editors' draft; the count updates when upstream changes.
- **Structured Draft Information**: Scope, applies-when / except-when conditions, editor notes, worked examples, procedure tests, and direct source links for every provision.
- **W3C Working Group Status**: Upstream maturity levels (*developing*, *exploratory*, *refining*, *mature*) and open questions recorded directly in the editors' draft.
- **Conformance Model Breakdown**: How WCAG 3 replaced A/AA/AAA with a single conformance bar wrapped in six reporting tiers. Bronze, Silver and Gold are tiers *above* conformance in the current draft, not the conformance levels — and the working group has a competing scoring proposal open for comment, which the site says plainly.
- **Interactive Quick Nav Drawer**: Keyboard-operable (`Esc` to close) table of contents with instant text filtering.

### 3. 📗 100% Complete WCAG 2.2 Reference (`/plain-english/wcag22/`)
- **All 87 Success Criteria**: Complete coverage across Level A (32), Level AA (24), and Level AAA (31) covering all 4 Principles (*Perceivable*, *Operable*, *Understandable*, *Robust*).
- **Multi-Modal Testing Checklists**: Step-by-step audit plans for **Automated Audit Tools** (axe-core, Lighthouse), **Manual Keyboard Navigation**, and **Screen Reader Auditing** (NVDA, JAWS, VoiceOver).
- **Interactive Code Snippet Diffs**: Accessible vs. Inaccessible HTML/CSS code comparisons with one-click copy buttons.
- **WCAG 3 Evolution Map**: Direct cross-reference links mapping WCAG 2.2 criteria to their corresponding WCAG 3 outcomes.

### 4. 🔄 Removals & Architectural Shifts (`/plain-english/removals/`)
- **Phased Out & Redesigned Concepts in WCAG 3**:
  1. *Conforming Alternate Versions (CAV)* phased out in favor of native accessibility and responsive page variations.
  2. *Page-by-Page Binary Pass/Fail Conformance* replaced by defined Conformance Scope (with alternative task-scoring under review).
  3. *Strict A / AA / AAA Conformance Levels* replaced by a single core conformance threshold wrapped in six reporting tiers.
  4. *Author-Defined 'Accessibility Supported' Baselines* standardized into defined Default and Alternative Accessibility Support Sets.

### 5. 💬 Live W3C Working Group Discussions (`/plain-english/discussions/`)
- **Direct GitHub Issue Synchronization**: Automatically ingests issue threads from `w3c/wcag3` and groups them by provision.
- **Distilled Consensus & Positions**: Real positions, consensus agreements, and open questions attributed to named W3C contributors (e.g. font-size units in #642, flashing thresholds in #628/#629, adjacent interactive elements in #602).

### 6. ⚖️ Conformance: What Changed & Readiness (`/plain-english/conformance/`)
- **The headline shift**: Leveling moved off conformance and onto reporting in the latest W3C draft, with the six-tier table and what drives tier placement.
- **Five structural differences from WCAG 2.2**: Reporting tiers, assertions, conformance scope, accessibility support sets, and the three-way requirement split — each explained as *was / now / so what*.
- **A readiness checklist**: Split into *start now* (work that pays off regardless of how the draft lands), *cheap hedges*, and *wait for the draft*.
- **Live draft figures**: Provision counts, type and maturity breakdowns, and the reporting-tier tag count are read from `public/data/wcag3-conformance.json`, which `npm run track:upstream` refreshes on every run.

### 7. 🔍 Upstream Change Tracker (`npm run track:upstream`)
- Diffs the W3C editors' draft (`w3c/wcag3`) since the last tracked commit and writes a dated report to `tracking/reports/`.
- Separates real normative wording changes from periodic markup and punctuation passes.
- Checks every WCAG 2.2 → 3 mapping against what actually exists upstream, flagging broken slugs and coarse references.
- Runs weekly as a scheduled task. See [`tracking/README.md`](tracking/README.md) and [`tracking/wcag22-to-wcag3-plan.md`](tracking/wcag22-to-wcag3-plan.md).

### 8. 🧮 Interactive WCAG 3 Score Calculator (`/plain-english/calculator/`)
- **Educational Simulation of the Silver Scoring Prototype**: Models the Silver Task Force's points-based scoring prototype (Bronze 70%, Silver 80%, Gold 90%) with interactive category health meters, allowing teams to explore outcome-based audit workflows alongside the normative reporting tier draft.
- **Core Blockers Detection**: Visual feedback verifying that all core/foundational provisions must pass before rating thresholds can be satisfied under the prototype scoring model.
- **Interactive Auditor Presets**: Instant simulation of typical web apps, critical blocker scenarios, or 100% Gold baselines.
- **Export & Reporting**: One-click download of audit results as formatted GitHub-Flavored Markdown reports (`.md`) or structured JSON datasets.

### 9. 🔄 Decoupled Upstream Sync Engine (`npm run sync:plain-english`)
- Fully decoupled from upstream `w3c/wcag3` markdown repositories.
- Combines raw W3C spec documents with local educational annotations into zero-dependency compiled JSON catalogs in `public/data/`.

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Local Setup
```bash
# 1. Clone repository
git clone https://github.com/danielwestfall/trackingwcag3.git
cd trackingwcag3

# 2. Install dependencies
npm install

# 3. Compile datasets (WCAG 3, WCAG 2.2, Removals & Debates)
npm run sync:plain-english

# 4. Start local development server
npm start
```

Open your browser to:
👉 **`http://localhost:4321/`**

---

## ⌨️ Global Keyboard Shortcuts

| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| <kbd>/</kbd> | Focus global search bar | Home portal |
| <kbd>T</kbd> | Toggle Light / Dark color mode | Global |
| <kbd>Esc</kbd> | Close Quick Nav drawer | WCAG 3 Explorer |
| <kbd>Tab</kbd> / <kbd>Shift + Tab</kbd> | Navigate interactive focus sequence | Global |

---

## 🛠️ Project Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Start Dev Server** | `npm start` | Launches Astro dev server on `http://localhost:4321/` |
| **Sync Datasets** | `npm run sync:plain-english` | Compiles raw W3C markdown & annotations into `public/data/` JSON catalogs |
| **Generate WCAG 2.2 Data** | `npm run generate:wcag22` | Compiles all 87 WCAG 2.2 Success Criteria dataset |
| **Type & Lint Check** | `npm run check` | Runs `astro check` type diagnostics across all 66 pages and layouts |
| **Build Production** | `npm run build` | Builds optimized static production bundle into `dist/` |

---

## 📁 Repository Architecture

```
trackingwcag3/
├── guidelines/                 # Upstream W3C WCAG 3 markdown guidelines (from w3c/wcag3)
├── plain-english-data/         # Custom WCAG 3 plain-English annotations & schema
├── wcag22-data/                # WCAG 2.2 dataset (87 SCs), Removals & Hottest Debates
│   ├── success-criteria.json
│   ├── removals-and-omissions.json
│   └── hottest-debates.json
├── scripts/
│   ├── sync-wcag-plain-english.mjs   # Upstream sync & catalog compilation engine
│   └── build-full-wcag22-dataset.mjs # 87 SC dataset generator
├── public/data/                # Compiled runtime JSON datasets read by Astro
│   ├── wcag3-catalog.json
│   ├── wcag22-catalog.json
│   ├── wcag3-removals.json
│   └── wcag3-debates.json
├── src/
│   ├── layouts/
│   │   └── PlainEnglishLayout.astro # Global accessible layout & theme switch
│   └── pages/
│       ├── index.astro               # Flagship Welcome Portal & Global Search
│       └── plain-english/
│           ├── index.astro           # WCAG 3 Explorer & conformance model overview
│           ├── provision/[id].astro  # 5-tab WCAG 3 provision detail view
│           ├── wcag22/index.astro    # 87 SC WCAG 2.2 Reference index
│           ├── wcag22/[id].astro     # WCAG 2.2 criterion detail view
│           └── removals/index.astro  # Removals & Hottest Debates guide
└── README.md
```

---

## 🔄 Updating Upstream W3C Drafts

To fetch updates from the official `w3c/wcag3` upstream repository:

```bash
# Fetch and merge latest W3C guidelines
git fetch upstream
git merge upstream/main

# Re-run sync engine to update compiled datasets
npm run sync:plain-english

# Verify diagnostics
npm run check
```

---

## 📄 License & Attribution

- **W3C Source Material**: Content in `guidelines/` is derived from the W3C Web Content Accessibility Guidelines (WCAG) 3.0 Working Draft under the W3C Software and Document License.
- **Educational Plain English Annotations & Platform**: Created for `trackingwcag3`.

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
- **219 W3C Draft Provisions**: Educational breakdowns across all functional categories (*Text*, *Navigation*, *Media*, *Interactivity*, *Forms*, *Assistive Tech Control*, etc.).
- **Role-Tailored Guidance**: Persona tabs for **🎨 Designers**, **💻 Developers**, **🧪 QA Engineers**, and **📋 Product Managers**.
- **W3C Working Group Estimations**: Live estimates on whether provisions are mature or under active discussion, plus W3C release likelihood meters (`High 90%+`, `Medium 70-89%`, `Under Discussion`).
- **Rating Model Breakdown (Bronze, Silver & Gold)**: Explanations of continuous points-based outcome scoring compared to legacy WCAG 2.x binary checklists.
- **Interactive Quick Nav Drawer**: Keyboard-operable (`Esc` to close) table of contents with instant text filtering.

### 3. 📗 100% Complete WCAG 2.2 Reference (`/plain-english/wcag22/`)
- **All 87 Success Criteria**: Complete coverage across Level A (32), Level AA (24), and Level AAA (31) covering all 4 Principles (*Perceivable*, *Operable*, *Understandable*, *Robust*).
- **Multi-Modal Testing Checklists**: Step-by-step audit plans for **Automated Audit Tools** (axe-core, Lighthouse), **Manual Keyboard Navigation**, and **Screen Reader Auditing** (NVDA, JAWS, VoiceOver).
- **Interactive Code Snippet Diffs**: Accessible vs. Inaccessible HTML/CSS code comparisons with one-click copy buttons.
- **WCAG 3 Evolution Map**: Direct cross-reference links mapping WCAG 2.2 criteria to their corresponding WCAG 3 outcomes.

### 4. 🔄 Removals, Architectural Shifts & Working Group Debates (`/plain-english/removals/`)
- **Phased Out Concepts in WCAG 3**:
  1. *Conforming Alternate Versions (CAV)* & Page Variations
  2. *Page-by-Page Binary Pass/Fail Conformance*
  3. *Strict A / AA / AAA Conformance Tiers*
  4. *Page-Level 'Accessibility Supported' Baseline Exemptions*
- **🔥 Top 10 Hottest WCAG 3 Working Group Debates**: Real-time tracking of AGWG and Silver Task Force debates (e.g. APCA vs. WCAG 2 contrast algorithms, Cognitive Accessibility testability, Assertion-based conformance claims, Third-party widget responsibility) with direct links to W3C GitHub issues.

### 5. 🔄 Decoupled Upstream Sync Engine (`npm run sync:plain-english`)
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
│           ├── index.astro           # WCAG 3 Explorer & Rating Model visualizer
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

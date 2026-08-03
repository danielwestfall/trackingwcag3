# WCAG 3 & 2.2 Plain English Reference Hub 🌐♿

> **Tracking and translating WCAG 3.0 draft guidelines and WCAG 2.2 accessibility standards into plain, actionable English.**

An accessible web application and decoupled educational hub built with Astro, TypeScript, and modern CSS. Designed for non-accessibility professionals, designers, developers, QA engineers, and product managers to understand, test, and track W3C Web Content Accessibility Guidelines.

---

## 🌟 Key Features

### 1. 📘 WCAG 3.0 Explorer (`/plain-english/`)
- **219 W3C Draft Provisions**: Educational breakdowns across all functional categories (*Text*, *Navigation*, *Media*, *Interactivity*, *Forms*, etc.).
- **Role-Tailored Advice**: Specific tips for **🎨 Designers**, **💻 Developers**, **🧪 QA Engineers**, and **📋 Product Managers**.
- **W3C Working Group Estimations**: Live estimates on whether provisions are mature or under active discussion, plus W3C release likelihood meters (`High 90%+`, `Medium 70-89%`, `Under Discussion`).
- **Rating Model Breakdown (Bronze, Silver & Gold)**: Clear explanation of how WCAG 3 continuous points-based outcome scoring works compared to legacy WCAG 2.x checklists.
- **Live W3C Development Status Accordion**: Real-time status tracking on mandatory Core vs. Supplemental requirements, point weighting, and regulatory mapping.

### 2. 📗 WCAG 2.2 Plain English Reference (`/plain-english/wcag22/`)
- **68 Primary Success Criteria**: Covers all Level A, Level AA, and Level AAA criteria across all 4 WCAG Principles (*Perceivable*, *Operable*, *Understandable*, *Robust*).
- **Practical Testing Checklists**: Step-by-step guidance for **Automated Audit Tools** (axe-core, Lighthouse), **Manual Keyboard Navigation**, and **Screen Reader Auditing** (NVDA, JAWS, VoiceOver).
- **Code Examples**: Practical `Good Code` vs. `Bad Code` snippets for every criterion.
- **WCAG 3 Evolution Map**: Direct cross-reference links mapping WCAG 2.2 criteria to their corresponding WCAG 3 outcomes.

### 3. 📙 Removals & Architectural Shifts (`/plain-english/removals/`)
- **Phased Out Concepts**: In-depth analysis of concepts allowed in WCAG 2.2 that are omitted or replaced in WCAG 3:
  1. *Conforming Alternate Versions (CAV)* & Page Variations
  2. *Page-by-Page Binary Pass/Fail Conformance*
  3. *Strict A / AA / AAA Conformance Tiers*
  4. *Page-Level 'Accessibility Supported' Baseline Exemptions*
- **W3C Working Group Debate & Discussion Links**: Direct links to official W3C GitHub discussions (e.g. [Discussion #623](https://github.com/w3c/wcag3/discussions/623)), Silver Task Force wikis, and AGWG meeting minutes documenting why these shifts are happening.

### 4. 🔄 Decoupled Upstream Sync Engine (`npm run sync:plain-english`)
- Fully resilient to `git pull` updates from `w3c/wcag3`.
- Merges raw W3C markdown files with custom annotations in `plain-english-data/` and fallback AI-generated summaries to output zero-dependency compiled JSON catalogs in `public/data/`.

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Local Setup
```bash
# Clone repository
git clone https://github.com/danielwestfall/trackingwcag3.git
cd trackingwcag3

# Install dependencies
npm install

# Build compiled catalogs (WCAG 3, WCAG 2.2 & Removals)
npm run sync:plain-english

# Start local development server
npm start
```

Open your browser to:
👉 **`http://localhost:4321/plain-english/`**

---

## 🛠️ Project Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Start Dev Server** | `npm start` | Launches Astro dev server on `http://localhost:4321/` |
| **Sync Datasets** | `npm run sync:plain-english` | Compiles raw W3C markdown & annotations into `public/data/` JSON catalogs |
| **Type Check** | `npm run check` | Runs `astro check` type diagnostics across all pages and layouts |
| **Build Bundle** | `npm run build` | Builds production bundle into `dist/` |

---

## 📁 Repository Architecture

```
trackingwcag3/
├── guidelines/                # Upstream W3C WCAG 3 markdown guidelines (from w3c/wcag3)
├── plain-english-data/        # Custom WCAG 3 plain-English annotations & schema
├── wcag22-data/               # WCAG 2.2 dataset (68 SCs) & Removals dataset
│   ├── success-criteria.json
│   └── removals-and-omissions.json
├── scripts/
│   ├── sync-wcag-plain-english.mjs   # Upstream sync & catalog compilation engine
│   └── build-full-wcag22-dataset.mjs # Dataset generator for 2.2 criteria
├── public/data/               # Compiled runtime JSON datasets read by Astro
│   ├── wcag3-catalog.json
│   ├── wcag22-catalog.json
│   └── wcag3-removals.json
├── src/
│   ├── layouts/
│   │   └── PlainEnglishLayout.astro # Global accessible layout & navigation bar
│   └── pages/plain-english/
│       ├── index.astro               # WCAG 3 Explorer dashboard & Rating Model
│       ├── provision/[id].astro      # WCAG 3 provision 5-tab detail view
│       ├── wcag22/index.astro        # WCAG 2.2 Reference index
│       ├── wcag22/[id].astro         # WCAG 2.2 criterion detail view
│       └── removals/index.astro      # Removals & Architectural Shifts view
└── README.md
```

---

## 🔄 Updating Upstream W3C Drafts

To update the local WCAG 3 draft source files with the latest changes from the official `w3c/wcag3` repository:

```bash
# Fetch latest W3C guidelines from upstream
git fetch upstream
git merge upstream/main

# Re-run sync script to update compiled datasets
npm run sync:plain-english

# Verify zero Astro build or type errors
npm run check
```

---

## 📄 License & Attribution

- **W3C Source Material**: Content from `guidelines/` is derived from the W3C Web Content Accessibility Guidelines (WCAG) 3.0 Working Draft under the W3C Software and Document License.
- **Educational Plain English Annotations & UI**: Created for `trackingwcag3`.

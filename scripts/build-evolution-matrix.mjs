#!/usr/bin/env node
/**
 * build-evolution-matrix.mjs
 * ------------------------------------------------------------------
 * Compiles a comprehensive side-by-side evolution dataset:
 * public/data/wcag-evolution-matrix.json
 *
 * Links all 87 WCAG 2.2 Success Criteria to their WCAG 3.0 draft
 * equivalents and provides structured change analysis:
 *  - Scope Delta: Does it go further? New modalities, technologies, or contexts?
 *  - Testing Impact: How does testing change? (e.g. easier to test, automated, continuous)
 *  - Change Classification: Expands Scope, Granular Split, New Metric, Easier Testing, Direct Evolution, Redesigned
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WCAG22_PATH = path.join(ROOT, 'public', 'data', 'wcag22-catalog.json');
const WCAG3_PATH = path.join(ROOT, 'public', 'data', 'wcag3-catalog.json');
const OUT_PATH = path.join(ROOT, 'public', 'data', 'wcag-evolution-matrix.json');

const wcag22Catalog = JSON.parse(fs.readFileSync(WCAG22_PATH, 'utf8'));
const wcag3Catalog = JSON.parse(fs.readFileSync(WCAG3_PATH, 'utf8'));

// Map of slug -> WCAG 3 provision
const wcag3BySlug = new Map();
for (const p of wcag3Catalog) {
  wcag3BySlug.set(p.slug, p);
}

// Curated taxonomy and deep comparative analysis for WCAG 2.2 -> WCAG 3
// Grounded in AGWG working drafts, explainer, and Silver task force notes.
const EVOLUTION_ANALYSIS = {
  "1.1.1": {
    changeType: "granular-split",
    changeBadge: "Granular Split",
    scopeDelta: "Goes further by separating text descriptions for static images from interactive element names, and adds a dedicated provision for detectable text in canvas and graphics.",
    testingImpact: "Easier to test: Automated rules can separately verify element naming vs media equivalence rather than bundling them into a single massive checklist rule."
  },
  "1.2.1": {
    changeType: "granular-split",
    changeBadge: "Granular Split",
    scopeDelta: "Splits media alternatives into dedicated transcript requirements with separate provisions for equivalence, findability, and content author review.",
    testingImpact: "Testing verifies transcript completeness and synchronization independently from whether the transcript file merely exists."
  },
  "1.2.2": {
    changeType: "granular-split",
    changeBadge: "Granular Split & Extra Attributes",
    scopeDelta: "Goes further by separating the presence of captions from caption equivalence, and introduces distinct provisions for speaker identification, sound effects, and non-verbal cues.",
    testingImpact: "Enables granular quality testing: auditors can score speaker identification and sound cue accuracy separately from baseline caption timing."
  },
  "1.2.3": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Maintains the dual-path option: either an audio description or a full descriptive transcript satisfies the basic accessibility requirement.",
    testingImpact: "Testing remains identical in verification criteria, but results map into distinct functional outcomes in the WCAG 3 reporting architecture."
  },
  "1.2.4": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Carries live broadcast captions forward into a dedicated provision under the captions guideline, distinct from prerecorded rules.",
    testingImpact: "Auditing focuses strictly on live latency thresholds and caption stream availability without conflating with prerecorded editing standards."
  },
  "1.2.5": {
    changeType: "granular-split",
    changeBadge: "Granular Split",
    scopeDelta: "Splits audio descriptions into separate provisions for availability (is an audio track provided?) and equivalence (does the track convey all visual information?).",
    testingImpact: "Automated checks can verify alternate audio track presence; human evaluation focuses on semantic equivalence."
  },
  "1.2.6": {
    changeType: "expands-scope",
    changeBadge: "Expands Scope",
    scopeDelta: "Gives sign language interpretation its own guideline and introduces provisions for user control over visibility and sizing of the signer video overlay.",
    testingImpact: "Testing checks not only whether sign language video exists, but whether the user can adjust, toggle, or reposition the signer viewport."
  },
  "1.2.7": {
    changeType: "granular-split",
    changeBadge: "Granular Split",
    scopeDelta: "Splits extended audio description into availability and equivalence provisions under the audio descriptions guideline.",
    testingImpact: "Allows discrete verification of pause-and-play audio description systems separately from standard continuous descriptions."
  },
  "1.2.8": {
    changeType: "granular-split",
    changeBadge: "Granular Split",
    scopeDelta: "The WCAG 2.2 full media alternative becomes the descriptive transcript in WCAG 3, accompanied by specific style and findability provisions.",
    testingImpact: "Testing tests transcript equivalence, speaker labeling, and layout placement independently."
  },
  "1.2.9": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Carries live audio-only descriptions and text equivalents into live media provisions.",
    testingImpact: "Testing confirms presence of real-time text streaming alongside live audio broadcasts."
  },
  "1.3.1": {
    changeType: "granular-split",
    changeBadge: "Granular Split & Structural Modeling",
    scopeDelta: "Decomposes general 'Info and Relationships' into component-level information, process-level semantics, section labeling, and relationships-detectable.",
    testingImpact: "Significantly easier to test: Replaces one sprawling catch-all criterion with focused checks for headings, lists, tables, and form associations."
  },
  "1.3.2": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Connects reading order directly to layout reflow and visual presentation outcomes across dynamic viewports.",
    testingImpact: "Testing focuses on DOM-to-visual order alignment, especially when CSS grid and flexbox reorder visual flows."
  },
  "1.3.3": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Carries sensory independence forward, requiring controls and content not to rely solely on shape, color, size, orientation, or sound.",
    testingImpact: "Auditing checks that instructions use textual labels alongside or instead of physical descriptors."
  },
  "1.3.4": {
    changeType: "expands-scope",
    changeBadge: "Expands Scope",
    scopeDelta: "Splits orientation into minimum and enhanced provisions, covering modern foldable, dual-screen, and wearable viewport configurations.",
    testingImpact: "Tests orientation locking across standard desktop/mobile and multi-screen/split-window environments."
  },
  "1.3.5": {
    changeType: "expands-scope",
    changeBadge: "Expands Scope",
    scopeDelta: "Broadens input purpose beyond HTML autocomplete tokens into automated entry support and redundant entry reduction across multi-step processes.",
    testingImpact: "Testing covers both browser autofill attribute validity and application-level persistence of previously entered user data."
  },
  "1.3.6": {
    changeType: "expands-scope",
    changeBadge: "Expands Scope",
    scopeDelta: "Expands landmark and UI component identification into explicit role, value, state, and property detection provisions.",
    testingImpact: "Testing audits full programmatic accessibility trees rather than just HTML5 landmarks."
  },
  "1.4.1": {
    changeType: "granular-split",
    changeBadge: "Granular Split",
    scopeDelta: "Integrates color reliance rules directly into provisions for interactive element distinction and non-text visual indicators.",
    testingImpact: "Testing pairs color audits directly with underline, icon, and shape indicators on links and buttons."
  },
  "1.4.2": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Groups background audio stopping into user media control provisions under the audio-adjustable guideline.",
    testingImpact: "Testing confirms automatic audio plays for less than 3 seconds or provides an immediate keyboard-accessible mute control."
  },
  "1.4.3": {
    changeType: "new-metric",
    changeBadge: "Perceptual Metric (APCA)",
    scopeDelta: "Transitions from a flat 4.5:1 mathematical ratio to the Advanced Perceptual Contrast Algorithm (APCA), which models font weight, size, and polarity.",
    testingImpact: "Replaces rigid pass/fail thresholds with continuous perceptual contrast scoring, resolving false passes for thin fonts and false fails for bold dark text."
  },
  "1.4.4": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Maps text resizing directly to text-size-adjustable outcomes, emphasizing scalable typography without clipping.",
    testingImpact: "Testing measures root rem/em font scaling up to 200% without horizontal container blowouts or truncated content."
  },
  "1.4.5": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Carries text-over-images rules into text-detectable provisions, requiring live CSS/HTML typography whenever possible.",
    testingImpact: "Automated scanning flags raster images containing text; exceptions for logos and brand identity are preserved."
  },
  "1.4.6": {
    changeType: "new-metric",
    changeBadge: "Perceptual Metric (Enhanced APCA)",
    scopeDelta: "Replaces 7:1 ratio with enhanced perceptual contrast levels under the APCA model for optimal readability.",
    testingImpact: "Evaluated using enhanced APCA lightness contrast targets across all text sizes and display weights."
  },
  "1.4.7": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Carries speech-over-background audio rules into media audio control provisions.",
    testingImpact: "Verifies that background audio is 20dB lower than foreground speech or can be completely disabled by the user."
  },
  "1.4.8": {
    changeType: "expands-scope",
    changeBadge: "Expands Scope",
    scopeDelta: "Expands visual presentation options into customizable text color, text style, and user setting retention provisions.",
    testingImpact: "Testing confirms user stylesheet overrides and platform font/spacing settings are respected by the application."
  },
  "1.4.9": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Maintains absolute prohibition of images of text except for branding, logos, and essential visual demonstrations.",
    testingImpact: "Strict automated and manual inspection for rasterized typography in web applications."
  },
  "1.4.10": {
    changeType: "direct",
    changeBadge: "Direct Evolution & Reflow",
    scopeDelta: "Carried forward into layout-reflow-supported and text-reflow-supported provisions under the layout group.",
    testingImpact: "Testing tests responsive viewports at 320px width (vertical scroll) and 256px height (horizontal scroll) without two-dimensional scrollbars."
  },
  "1.4.11": {
    changeType: "easier-testing",
    changeBadge: "Measurable Thresholds",
    scopeDelta: "Maps non-text contrast to interactive-element-contrast-sufficient provisions, clarifying boundary and state indicator requirements.",
    testingImpact: "Testing clarifies ambiguous edge cases around disabled states, hover borders, and graphical icons with precise color contrast guidelines."
  },
  "1.4.12": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Mapped to text-style-adjustable and blocks-of-text-adjustable provisions under the text-and-wording group.",
    testingImpact: "Testing ensures line height (1.5x), paragraph spacing (2x), letter spacing (0.12x), and word spacing (0.16x) do not truncate text."
  },
  "1.4.13": {
    changeType: "easier-testing",
    changeBadge: "Objective Dismissibility",
    scopeDelta: "Subsumes content on hover or focus into overlay-content-dismissible, hover-content-persistent, and hover-or-focus-content-dismissible provisions.",
    testingImpact: "Testing verifies pointer move dismissibility, hover persistence, and Escape key trigger directly on popovers and tooltips."
  },
  "2.1.1": {
    changeType: "expands-scope",
    changeBadge: "Expands Scope",
    scopeDelta: "Expands basic keyboard accessibility into keyboard-accessible, keyboard-operable, and simple-pointer-input outcomes across modern input methods.",
    testingImpact: "Audits keyboard operability across full web components, custom widgets, canvas apps, and virtual cursors."
  },
  "2.1.2": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Preserves the absolute rule against keyboard traps under no-keyboard-traps in the process completion group.",
    testingImpact: "Standard automated and manual keyboard navigation testing: focus must exit any dialog or widget via standard Tab or Escape keys."
  },
  "2.1.3": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Carries keyboard without exception forward as an enhanced input operation provision.",
    testingImpact: "Confirms that zero functions require timed pointer gestures or path-dependent interactions."
  },
  "2.1.4": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Retains character key shortcut controls under navigation-keys-described and no-keyboard-conflicts.",
    testingImpact: "Tests single-key shortcuts for remapping, turn-off mechanisms, or activation only on component focus."
  },
  "2.2.1": {
    changeType: "expands-scope",
    changeBadge: "Expands Scope",
    scopeDelta: "Moves timing adjustment to no-artificial-time-limits and timeout-adjustable, broadening protection to background session logouts.",
    testingImpact: "Tests options to turn off, adjust (10x), or extend time limits with at least 20 seconds of warning."
  },
  "2.2.2": {
    changeType: "granular-split",
    changeBadge: "Granular Split by Motion Type",
    scopeDelta: "Splits general pause/stop/hide into distinct provisions for visual motion, audio changes, and haptic feedback.",
    testingImpact: "Significantly easier testing: animation controls are tested separately from auto-updating news tickers and sound loops."
  },
  "2.2.3": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Carries no-timing exceptions into no-time-limits provisions.",
    testingImpact: "Confirms that time is not an essential aspect of the activity (with exceptions for live auctions and real-time multiplayer games)."
  },
  "2.2.4": {
    changeType: "expands-scope",
    changeBadge: "Expands Scope",
    scopeDelta: "Expands interruption postponement into adjustable notifications and progress saving provisions.",
    testingImpact: "Tests ability of users to suppress non-emergency notifications and alerts."
  },
  "2.2.5": {
    changeType: "expands-scope",
    changeBadge: "Expands Scope",
    scopeDelta: "Carries re-authentication data retention forward into progress-saved and automated-entry-allowed.",
    testingImpact: "Confirms that submitted form data and session progress survive re-authentication without data loss."
  },
  "2.2.6": {
    changeType: "expands-scope",
    changeBadge: "Expands Scope",
    scopeDelta: "Incorporates timeout warnings into explicit time-limits-conveyed and process-instructions-available provisions.",
    testingImpact: "Tests that users are notified of inactivity durations at the start of multi-step forms."
  },
  "2.3.1": {
    changeType: "easier-testing",
    changeBadge: "Measurable Thresholds",
    scopeDelta: "Restates flash thresholds around explicit luminance and red-saturation formulas under no-flashing-over-threshold.",
    testingImpact: "Testing uses automated flash measurement tools with strict quantitative limits (3 flashes per second threshold)."
  },
  "2.3.2": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Maintains zero-flash AAA safety under no-flashing-over-threshold-no-exceptions and single-flash provisions.",
    testingImpact: "Automated scanner flags any content flashing more than 1 time in any 1-second period."
  },
  "2.3.3": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Carries motion animation controls into no-visual-motion and no-visual-motion-no-exceptions.",
    testingImpact: "Tests respects prefers-reduced-motion CSS media query and in-app parallax/scroll-driven animation toggles."
  },
  "2.4.1": {
    changeType: "granular-split",
    changeBadge: "Granular Split",
    scopeDelta: "Groups bypass blocks into navigating-content guidelines, connecting skip links with semantic landmark regions.",
    testingImpact: "Tests skip link visibility upon keyboard focus and valid target container ID anchoring."
  },
  "2.4.2": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Carries page titles into page-view-title-available under navigating content.",
    testingImpact: "Tests unique, descriptive <title> tag on every page view and document state."
  },
  "2.4.3": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Aligns focus order with navigating-content and bidirectional-navigation provisions.",
    testingImpact: "Verifies keyboard Tab order preserves meaning and operability across dynamic DOM updates."
  },
  "2.4.4": {
    changeType: "granular-split",
    changeBadge: "Granular Split",
    scopeDelta: "Maps link purpose in context to interactive-element-names-available provisions.",
    testingImpact: "Tests accessible name calculation on <a> tags (inner text, aria-label, aria-labelledby) for ambiguous strings like 'click here'."
  },
  "2.4.5": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Carried forward into multiple-ways-to-navigate provisions under layout and consistency guidelines.",
    testingImpact: "Verifies site search, sitemaps, table of contents, and hierarchical navigation bars."
  },
  "2.4.6": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Maps headings and labels into sections-labeled and process-instructions-available.",
    testingImpact: "Verifies headings and form labels clearly describe topic or purpose."
  },
  "2.4.7": {
    changeType: "new-metric",
    changeBadge: "Measurable Focus Metrics",
    scopeDelta: "Replaces binary 'focus is visible' check with measurable requirements for indicator thickness, contrast, and bounding geometry.",
    testingImpact: "Testing moves from subjective visual inspection to measurable 3:1 contrast against adjacent background and minimum pixel surface area."
  },
  "2.4.8": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Maps location within site/app to location-within-product-review and breadcrumb structure.",
    testingImpact: "Verifies breadcrumb trails, progress indicators, or active navigation highlighting."
  },
  "2.4.9": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Requires link purpose alone (without needing surrounding context) for complete programmatic clarity.",
    testingImpact: "Tests link accessible names independently of surrounding paragraphs."
  },
  "2.4.10": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Carries section headings into sections-labeled provisions under content structure.",
    testingImpact: "Tests hierarchical heading structure (h1 through h6) across all major content divisions."
  },
  "2.4.11": {
    changeType: "redesigned",
    changeBadge: "Redesigned / Overlay Dismissibility",
    scopeDelta: "No direct 1:1 successor in current draft. The draft replaces obscuring layout rules with overlay-content-dismissible and hover-or-focus-content-dismissible.",
    testingImpact: "Auditors verify that sticky banners, popups, and dialogs can be dismissed without moving focus, rather than auditing partial pixel overlap."
  },
  "2.4.12": {
    changeType: "redesigned",
    changeBadge: "Redesigned / Overlay Dismissibility",
    scopeDelta: "The strict zero-obscuring AAA rule shifts toward comprehensive dismissibility and non-modal overlay management in WCAG 3.",
    testingImpact: "Tests that overlays do not conceal focused elements and provide instant Escape dismissal."
  },
  "2.4.13": {
    changeType: "new-metric",
    changeBadge: "Measurable Focus Appearance",
    scopeDelta: "Directly adopts the 2.4.13 geometric and contrast thresholds into pointer-focus-indicated and interactive-element-contrast-sufficient.",
    testingImpact: "Quantitative testing of focus indicator perimeter, 3:1 contrast against unfocused state, and minimum 2px thickness."
  },
  "2.5.1": {
    changeType: "expands-scope",
    changeBadge: "Expands Scope",
    scopeDelta: "Expands pointer gestures into pointer-accessible and path-based-gesture-not-relied-on across modern touch and spatial interfaces.",
    testingImpact: "Tests single-tap / click alternatives for all multipoint, pinching, or path-based dragging gestures."
  },
  "2.5.2": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Carries pointer cancellation into pointer-activation-controllable and consistent-pointer-cancellation.",
    testingImpact: "Verifies action occurs on pointer up-event, with abort/undo capabilities."
  },
  "2.5.3": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Carried forward directly as 'label-included-in-programmatic-name' under text and wording.",
    testingImpact: "Automated scan confirms visual text label matches the beginning of the element's programmatic accessible name."
  },
  "2.5.4": {
    changeType: "expands-scope",
    changeBadge: "Expands Scope",
    scopeDelta: "Carries motion actuation into sensor independence provisions, covering device shaking, tilting, and spatial gestures.",
    testingImpact: "Tests that shaking or tilting functions can be operated by conventional UI buttons and sensors can be disabled."
  },
  "2.5.5": {
    changeType: "easier-testing",
    changeBadge: "Measurable Target Thresholds",
    scopeDelta: "Carries AAA 44x44px target size into comprehensive pointer control guidelines under interactive components.",
    testingImpact: "Automated testing checks bounding box dimensions of interactive tap targets."
  },
  "2.5.6": {
    changeType: "expands-scope",
    changeBadge: "Expands Scope",
    scopeDelta: "Expanded into input-method-flexible provisions, ensuring users can switch seamlessly between keyboard, mouse, touch, and voice.",
    testingImpact: "Tests that applications do not lock interaction to a single hardware device type."
  },
  "2.5.7": {
    changeType: "easier-testing",
    changeBadge: "Objective Dragging Alternatives",
    scopeDelta: "Carried into simple-pointer-input-available, requiring single pointer tap alternatives for sliders, reordering, and drag-and-drop.",
    testingImpact: "Tests presence of up/down arrow buttons or menu selectors alongside draggable elements."
  },
  "2.5.8": {
    changeType: "easier-testing",
    changeBadge: "Touch Target Floor (24px)",
    scopeDelta: "Mapped to interactive-elements-distinguishable, ensuring targets meet 24x24px floor or have sufficient spacing offset.",
    testingImpact: "Direct geometric bounding box and spacing circle calculation in automated audit rules."
  },
  "3.1.1": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Mapped directly to human-language-detectable under text and wording.",
    testingImpact: "Automated inspection of top-level <html lang> attribute with valid BCP 47 language code."
  },
  "3.1.2": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Includes passage and phrase language switches in human-language-detectable provisions.",
    testingImpact: "Tests inline lang attributes on foreign phrases for screen reader pronunciation switching."
  },
  "3.1.3": {
    changeType: "expands-scope",
    changeBadge: "Expands Scope",
    scopeDelta: "Expands unusual words into non-literal-language-explained and summaries-available provisions.",
    testingImpact: "Verifies glossary links, ruby annotations, or inline definitions for idioms and jargon."
  },
  "3.1.4": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Carries abbreviation expansions into clear text and wording outcomes.",
    testingImpact: "Tests <abbr title> tags or parenthetical expansions upon first mention in text."
  },
  "3.1.5": {
    changeType: "expands-scope",
    changeBadge: "Expands Scope",
    scopeDelta: "Broadens reading level into no-unnecessary-words, no-nested-clauses, and summaries-available provisions.",
    testingImpact: "Testing evaluates sentence length, readability scores, and provision of plain-language executive summaries."
  },
  "3.1.6": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Maintains pronunciation assistance for heteronyms and ambiguous words.",
    testingImpact: "Verifies pronunciation guides or phonetic markups where context alone does not resolve meaning."
  },
  "3.2.1": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Categorized under change-of-focus-notified provisions in consistency guidelines.",
    testingImpact: "Tests that receiving focus does not automatically submit forms, navigate to new URLs, or spawn popups."
  },
  "3.2.2": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Addressed under change-of-content-notified, ensuring input changes do not unexpectedly shift context without advance notice.",
    testingImpact: "Verifies changing radio buttons, checkboxes, or dropdowns does not unexpectedly reload or navigate."
  },
  "3.2.3": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Carried forward into consistent-navigation-order provisions under consistency across views.",
    testingImpact: "Tests that repeated navigation elements appear in the same relative order across multiple pages."
  },
  "3.2.4": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Mapped to consistent-identification provisions under interactive components.",
    testingImpact: "Verifies controls with the same functionality have identical labels and icons across the entire product."
  },
  "3.2.5": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Carries context change on request into user-control and change-of-view-notified provisions.",
    testingImpact: "Confirms context changes only initiate when the user activates an explicit submit button."
  },
  "3.2.6": {
    changeType: "expands-scope",
    changeBadge: "Expands Scope",
    scopeDelta: "Integrates consistent help into support-available and personalizable-help provisions under help-and-feedback.",
    testingImpact: "Tests help links, chat widgets, and support contact items maintain uniform placement across views."
  },
  "3.3.1": {
    changeType: "granular-split",
    changeBadge: "Granular Split",
    scopeDelta: "Splits error identification into input-constraints-used, submission-status-notified, and error message provisions.",
    testingImpact: "Automated checks confirm aria-invalid and error description linking via aria-describedby."
  },
  "3.3.2": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Mapped to input constraints and process instructions under input-operation and error handling.",
    testingImpact: "Tests visible labels, format hints (e.g. DD/MM/YYYY), and required field indicators."
  },
  "3.3.3": {
    changeType: "easier-testing",
    changeBadge: "Actionable Error Advice",
    scopeDelta: "Mapped to actionable error suggestions and error remediation provisions.",
    testingImpact: "Verifies error messages state how to correct the mistake rather than just reporting failure."
  },
  "3.3.4": {
    changeType: "expands-scope",
    changeBadge: "Expands Scope",
    scopeDelta: "Expands error prevention for legal/financial tasks into return-to-start-supported and risk-comparable provisions.",
    testingImpact: "Tests confirmation screens, reversible actions, and review steps before final transaction submission."
  },
  "3.3.5": {
    changeType: "expands-scope",
    changeBadge: "Expands Scope",
    scopeDelta: "Expands context-sensitive help into personalizable-help and support-available provisions.",
    testingImpact: "Tests inline help icons, tooltips, and contextual guidance for complex form inputs."
  },
  "3.3.6": {
    changeType: "expands-scope",
    changeBadge: "Expands Scope",
    scopeDelta: "Extends error prevention across all data submissions (not just legal/financial).",
    testingImpact: "Tests confirmation and edit capabilities across general user profile, comment, and data forms."
  },
  "3.3.7": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Adopts redundant entry directly into 'no-redundant-entry' under process completion.",
    testingImpact: "Tests that information previously entered in a multi-step flow is auto-populated or available for selection."
  },
  "3.3.8": {
    changeType: "granular-split",
    changeBadge: "Granular Authentication",
    scopeDelta: "Breaks accessible authentication into cognitive-test-alternatives-available, automated-entry-allowed, and copying-supported.",
    testingImpact: "Directly tests password manager autofill support, copy-paste allowance, and passkey/biometric alternatives."
  },
  "3.3.9": {
    changeType: "granular-split",
    changeBadge: "Granular Authentication (AAA)",
    scopeDelta: "Carries enhanced cognitive authentication into multiple-biometrics-available and zero-puzzle requirements.",
    testingImpact: "Tests complete absence of cognitive function tests (object recognition, arithmetic) for login."
  },
  "4.1.1": {
    changeType: "redesigned",
    changeBadge: "Obsolete / Integrated in HTML",
    scopeDelta: "Formally removed in WCAG 2.2 and omitted in WCAG 3. Syntactic parsing is handled natively by modern browser HTML parsers.",
    testingImpact: "No longer audited as an accessibility defect; parsing issues that cause AT failures are tested under role/name/value."
  },
  "4.1.2": {
    changeType: "granular-split",
    changeBadge: "Granular Component Semantics",
    scopeDelta: "Maps Name, Role, Value to 'roles-values-states-properties-available' and 'interactive-element-names-available'.",
    testingImpact: "Tests programmatic accessibility tree representation: aria-* states, roles, and values across custom interactive widgets."
  },
  "4.1.3": {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Mapped to changes-to-elements-notified and change-of-content-notified under feedback and messaging.",
    testingImpact: "Tests aria-live regions and role='status' / role='alert' announcements for asynchronous DOM updates without focus change."
  }
};

const evolutionMatrix = [];

for (const sc of wcag22Catalog) {
  const analysis = EVOLUTION_ANALYSIS[sc.num] || {
    changeType: "direct",
    changeBadge: "Direct Evolution",
    scopeDelta: "Carried forward into WCAG 3 draft outcomes with updated terminology.",
    testingImpact: "Standard verification aligned with WCAG 3 functional outcome testing."
  };

  const mappedSlugList = sc.wcag3Mapping?.provisions || [];
  const provisionsData = [];

  for (const slug of mappedSlugList) {
    const prov = wcag3BySlug.get(slug);
    if (prov) {
      provisionsData.push({
        slug: prov.slug,
        title: prov.title,
        type: prov.type || "foundational",
        status: prov.status || "developing",
        groupSlug: prov.groupSlug || "general",
        summary: prov.annotation?.plainEnglish?.summary || "",
        whyItMatters: prov.annotation?.plainEnglish?.whyItMatters || "",
        sourceUrl: prov.derived?.sources?.provision
          ? `https://github.com/w3c/wcag3/blob/main/${prov.derived.sources.provision}`
          : null,
        guideUrl: `/plain-english/provision/${prov.slug}/`
      });
    } else {
      provisionsData.push({
        slug,
        title: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        type: "foundational",
        status: "developing",
        groupSlug: "general",
        summary: "WCAG 3 draft provision in development by AGWG.",
        whyItMatters: "",
        sourceUrl: null,
        guideUrl: `/plain-english/provision/${slug}/`
      });
    }
  }

  evolutionMatrix.push({
    id: sc.num,
    num: sc.num,
    name: sc.name,
    level: sc.level,
    principle: sc.principle,
    w3cSlug: sc.w3cSlug,
    summary: sc.plainEnglish?.summary || "",
    whyItMatters: sc.plainEnglish?.whyItMatters || "",
    trUrl: sc.trUrl || `https://www.w3.org/TR/WCAG22/#${sc.w3cSlug}`,
    understandingUrl: sc.understandingUrl || `https://www.w3.org/WAI/WCAG22/Understanding/${sc.w3cSlug}.html`,
    guideUrl: `/plain-english/wcag22/${sc.id.replace(/\./g, "-")}/`,
    provisions: provisionsData,
    changeAnalysis: {
      changeType: analysis.changeType,
      changeBadge: analysis.changeBadge,
      scopeDelta: analysis.scopeDelta,
      testingImpact: analysis.testingImpact,
      evolutionNote: sc.wcag3Mapping?.evolutionNote || analysis.scopeDelta
    }
  });
}

fs.writeFileSync(OUT_PATH, JSON.stringify(evolutionMatrix, null, 2), "utf8");
console.log(`✅ Generated WCAG Evolution Matrix with all ${evolutionMatrix.length} criteria.`);
console.log(`   Saved to: ${OUT_PATH}`);

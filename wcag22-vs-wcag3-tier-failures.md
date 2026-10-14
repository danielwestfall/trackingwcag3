# WCAG 2.2 vs. WCAG 3: What Can't Be Carried Forward

> **An auditor's and architect's reference guide to common practices allowed in WCAG 2.2 Level AA that fail Tier 1 or Tier 2 in the W3C WCAG 3 draft.**

---

## 1. The WCAG 3 Tiered Conformance Model

In the W3C WCAG 3 draft (10 September 2026 Working Draft), the traditional Level A / AA / AAA classification is eliminated. Conformance is structured around a single baseline threshold surrounded by progressive reporting tiers.

Core requirements are explicitly tagged by their severity and human impact:
* **Physical Harm & Vestibular Disruption**: Causes seizures, nausea, dizziness, migraines, or physical pain $\rightarrow$ **Tier 1: Avoid Physical Harm**.
* **Hard Blockers / Total Lockouts**: Stops a user cold from perceiving, operating, entering, or finishing an essential task $\rightarrow$ **Tier 2: Foundational Access**.
* **Usability Friction**: Slows users down or creates disproportionate cognitive/motor drag $\rightarrow$ **Tier 3: Conformance Baseline** (100% of Core Requirements met).
* **Inclusive Excellence & Assertions**: Documented usability testing with people with disabilities, user assertions, and advanced personalization $\rightarrow$ **Tiers 4–6: Bronze, Silver, Gold**.

### The Conformance Tiers at a Glance

* **Tier 1: Avoid Physical Harm**  
  *Rule*: Satisfies all physical safety and harm requirements (no flashing over threshold, no unrequested motion, honoring user motion settings).  
  *Verdict*: If a product triggers vestibular illness or seizures, **it fails to achieve even Tier 1**.
* **Tier 2: Foundational Access**  
  *Rule*: Satisfies Tier 1 plus all hard blocker requirements.  
  *Verdict*: If an interface completely blocks an assistive technology or disabled user from completing an essential task, **it fails Tier 2**.
* **Tier 3: Conformance Baseline**  
  *Rule*: Satisfies Tier 1 + Tier 2 plus all friction requirements (100% of Core / Foundational Requirements).  
  *Verdict*: Standard required for formal WCAG 3 conformance.
* **Tiers 4–6: Bronze, Silver, Gold**  
  *Rule*: Achievement tiers above conformance requiring supplemental requirements and verified assertions.

---

## 2. Quick-Audit Master Checklist

| Practice (Allowed in WCAG 2.2 AA) | Simple Audit Question | Tier Failure & WCAG 3 Requirement | Root Cause & Mechanism | Probability of Remaining (Based on Discussions) |
| :--- | :--- | :--- | :--- | :--- |
| **Separate "accessible version"** | *Does the primary screen conform on its own?* | **Fails Tier 2**<br>*(No CAV / Conformance Scope)* | Conforming Alternate Versions omitted; primary barriers are unexcused. | **Very High (~90%–95%)** — Strong consensus (Discussion #623, Issue #682) that primary views must conform directly; alternate versions will not return as an escape hatch. |
| **Page-by-page pass/fail vs. task flow** | *Does the entire user journey succeed end-to-end?* | **Fails Tier 2**<br>*(Process Conformance Scope)* | Testing shifts from isolated static pages to complete user tasks and flows. | **Very High (~95%)** — Core architectural pillar across all drafts and the WCAG 3 Explainer; task flow evaluation is non-negotiable. |
| **Author-defined support baseline** | *Does the site work with mainstream standard assistive tech?* | **Fails Tier 2**<br>`assistive-technology-supported` / *Support Sets* | Standardized into formal Default Accessibility Support Sets (Issue #901). | **High (~85%)** — Formal support sets eliminate author-selected unsupported baselines, with broad working group backing. |
| **Breaking virtual cursor & AT navigation** | *Can screen readers navigate and interact using virtual cursors without physical keyboard focus?* | **Fails Tier 2**<br>`virtual-cursor-supported` & `assistive-technology-supported` | Content requiring DOM :focus or hardware key events is unreadable/inoperable to AT virtual buffers. | **Very High (~90%–95%)** — Core foundational provision; closes the loophole between hardware keyboard events and real-world screen reader browse mode. |
| **Synthetic aria-live controls** | *Can voice control say "click [Name]" and braille users feel the button?* | **Fails Tier 2**<br>`interactive-element-names-available` & `roles-values-states-properties-available` | Spoken text strings over aria-live do not create real interactive nodes in the accessibility tree. | **Very High (~95%)** — Strong consensus that screen reader announcements cannot substitute for real semantic controls and names. |
| **Text & focus drawn on a canvas** | *Is all text real DOM text that can be enlarged to 200%, color-customized, selected, and machine-translated?* | **Fails Tier 2**<br>`text-detectable`, `text-color-adjustable`, `user-settings-supported` | Canvas pixel bitmaps cannot reflow, inherit user color schemes, translate, or expose native focus rings. | **Very High (~95%)** — Fundamental WCAG 3 baseline; text and interactive elements must be programmatically exposed. |
| **`tabindex="0"` on static text** | *Does Tab stop only on interactive elements?* | **Fails Tier 2**<br>`focus-relevant` & `keyboard-effort-comparable` | Traps switch-device and keyboard users in impassable navigation clutter. | **High (~85%)** — Solid consensus that non-interactive tab stops break keyboard efficiency and clutter focus navigation (Issues #92, #267, #622). |
| **Autofocus on page load or popup** | *Does focus stay put until the user moves it?* | **Fails Tier 2**<br>`focus-user-controlled` & `focus-placed` | Disorients screen reader users and strips page context upon loading. | **Moderate to High (~75%–80%)** — General prohibition is solid, though narrow exceptions for dedicated single-input pages or modals are debated (Issue #616). |
| **Hijacking OS / browser shortcuts** | *Can users use system/browser shortcuts?* | **Fails Tier 2**<br>`no-keyboard-conflicts` & `shortcuts-controllable` | Overrides assistive technology commands, locking users out of controls. | **Very High (~95%)** — Universal opposition in AGWG to overriding native platform and assistive technology hotkeys (Issue #267). |
| **Autoplaying video / animation loops** | *Does visual motion avoid starting automatically?* | **Fails Tier 1**<br>`motion-autoplay-avoided` & `no-visual-motion` | Causes immediate vestibular illness before pause control can be reached. | **Very High (~95%)** — Overwhelming agreement (Issues #27, #181, #739) that physical harm must fail Tier 1 base safety rather than AAA. |
| **Ignoring OS reduced motion / contrast** | *Does the site respect system-level user settings?* | **Fails Tier 1 / 2**<br>`user-settings-supported` | Physical harm (motion triggers) or severe visual perception barrier. | **High (~85%–90%)** — Subgroup consensus treats OS accessibility flags (`prefers-reduced-motion`, contrast) as foundational safety (Issues #40, #182, #737). |
| **Captions without a text transcript** | *Is a complete text transcript placed with the video?* | **Fails Tier 2**<br>`dialogue-transcripts-available-prerecorded` | Deafblind users reading braille displays are completely blocked from media. | **Moderate to High (~75%–80%)** — Core requirement supported for prerecorded dialogue (Issue #519), but scope boundaries for ambient or non-dialogue media are still being refined. |
| **Puzzle CAPTCHAs & transcription** | *Can login finish without cognitive puzzles?* | **Fails Tier 2**<br>`cognitive-test-alternatives-available` | Puzzles create an absolute exclusion barrier for cognitive disabilities. | **Very High (~95%)** — Unanimous support from COGA and AGWG that cognitive puzzles without cognitive-free alternatives constitute total exclusion (Issues #176, #636). |
| **Blocking input paste** | *Can users paste and use password managers?* | **Fails Tier 2**<br>`automated-entry-allowed` | Prevents password managers and speech-to-text dictation tools from entering data. | **Very High (~95%)** — Unanimously opposed across accessibility and security standards; automated entry is firmly anchored in Tier 2. |
| **Placeholder-only labels** | *Is there a visible label that stays visible while typing?* | **Fails Tier 2**<br>`interactive-element-names-available` | Vanishing labels destroy context for memory-impaired and cognitive users. | **Very High (~90%)** — W3C discussions (Issues #93, #184, #890) show strong agreement that labels must visually persist while typing. |
| **Top-of-page error summary only** | *Is each error linked directly to its specific field?* | **Fails Tier 2**<br>`errors-associated` & `error-notifications-available` | Screen reader users navigating fields cannot tell which input failed. | **High (~85%)** — Subgroup consensus (Issues #669, #789, #790) agrees that field-level error association is required for foundational access. |
| **Multi-step wizard without step list** | *Does the process show total steps and current step?* | **Fails Tier 2**<br>`all-steps-listed` & `current-step-indicated` | Causes procedural disorientation for users unable to retain step context. | **Moderate (~65%–70%)** — Actively debated in Issue #445 whether step indication should be a Tier 2 hard blocker or moved to Tier 3 for simple linear flows. |
| **Hidden pre-selected add-on items** | *Are all default selections visible without expanding?* | **Fails Tier 2**<br>`preselections-visible` | Hiding pre-selected charges behind collapsed trays creates deceptive barriers. | **Moderate (~60%–65%)** — Active debate in Issues #437 and #438 on whether preselection rules belong in accessibility or consumer protection regulation. |
| **Biometric-only authentication** | *Is there a non-biometric alternative to sign in?* | **Fails Tier 2**<br>`biometrics-not-relied-on` | Total lockout for users without compatible biometric sensors or physical traits. | **High (~85%)** — Broad agreement that non-biometric fallbacks are essential to prevent hardware/physical lockout (Issue #572). |
| **Silent SPA route transitions** | *Are view changes announced to assistive tech?* | **Fails Tier 2**<br>`change-of-content-notified` & `page-view-change-notified` | Screen reader users remain stranded in the old view without notification. | **Very High (~90%)** — Universal agreement that view changes must be announced (Issues #421, #430, #889); only exact markup methods remain under discussion. |

---

## 3. Detailed Audit Breakdown

### Part A: Conformance Architecture & Scoping Shifts

#### 1. Conforming Alternate Versions (CAV)
* **What WCAG 2.2 allowed**: §5.2.1 permits an inaccessible webpage to conform if a separate, accessible "conforming alternate version" is available, current, and reachable.
* **WCAG 3 Status**: Omitted from the draft. W3C Working Group discussions (Discussion #623, Issue #682) require all responsive views, breakpoints, and states of the primary experience to conform on their own.
* **The Simple Question**:
  > *"Does every screen and responsive variation of the primary product conform on its own, without relying on an alternate accessible site?"*
* **Why it fails Tier 2 (Foundational Access)**:  
  In WCAG 3, the primary conformance scope cannot contain unexcused barriers. If a user lands on the primary product and encounters an inaccessible blocker, that flow fails foundational access. An alternative secondary URL no longer offsets barriers in the primary product.
* **Who It Affects Most (Pedagogical & Cognitive Equity)**:  
  Students and users with disabilities are segregated into secondary "plain text" experiences that often spoil the activity. For instance, in an interactive flip card, the back of the card is supposed to stay hidden until flipped; in a randomized quiz, one prompt should appear at a time. A separate plain HTML cheat-sheet destroys the learning mechanic.
* **Probability Remaining (Based on Discussions)**: **Very High (~90%–95%)**. Overwhelming consensus in AGWG (Discussion #623, Issue #682) that primary views must conform directly; alternate sub-sites will not return as a general escape hatch.

#### 2. Page-by-Page Binary Pass/Fail vs. Conformance Scope
* **What WCAG 2.2 allowed**: Evaluating compliance on an isolated URL-by-URL basis (e.g. claiming 9 out of 10 pages pass AA).
* **WCAG 3 Status**: Replaced by a **Defined Conformance Scope** covering complete user processes, tasks, products, or component libraries.
* **The Simple Question**:
  > *"Can a user complete the entire end-to-end task (such as checkout, registration, or filing a form) across all its steps without encountering a blocker?"*
* **Why it fails Tier 2 (Foundational Access)**:  
  Under a process or journey scope, an end-to-end task is evaluated as a cohesive unit. If a single step in a five-step checkout blocks a keyboard or screen reader user, the entire process scope fails Tier 2.
* **Probability Remaining (Based on Discussions)**: **Very High (~95%)**. Central architectural thesis across all drafts and the WCAG 3 Explainer; evaluating user journeys and flows rather than disconnected URLs is a core pillar.

#### 3. Author-Defined "Accessibility Supported" Baseline
* **What WCAG 2.2 allowed**: Authors could define an arbitrary browser and assistive technology baseline to excuse unsupported accessibility markup.
* **WCAG 3 Status**: Standardized into explicit **Default and Alternative Accessibility Support Sets** that must be formally declared (Issue #901 / PR #902).
* **The Simple Question**:
  > *"Does every core feature work out of the box with standard, mainstream browsers and screen readers (the default support set)?"*
* **Why it fails Tier 2 (Foundational Access)**:  
  Authors cannot invent niche platform combinations to justify missing standard support. If mainstream screen readers (NVDA, JAWS, VoiceOver, TalkBack) cannot perceive or operate an element, it is an automatic Tier 2 barrier.
* **Probability Remaining (Based on Discussions)**: **High (~85%)**. Issue #901 / PR #902 formalizes Default Support Sets, removing the ability of authors to excuse broken experiences behind niche platform claims.

---

### Part B: Assistive Technology Navigation & Semantic Controls

#### 4. Adding `tabindex="0"` to Static Headings and Paragraphs
* **What WCAG 2.2 allowed**: Putting `tabindex="0"` on static text passes 2.4.3 (Focus Order) as long as the reading order makes sense.
* **WCAG 3 Core Provision**: `focus-relevant`
* **The Simple Question**:
  > *"Does the Tab key stop only on interactive controls, skipping static text and hidden elements?"*
* **Why it fails Tier 2 (Foundational Access)**:  
  Screen reader users already have structural navigation keys (such as `H` for headings and `P` for paragraphs). Forcing keyboard and switch-device users to press Tab hundreds of times through static body copy creates an exhausting barrier that prevents them from reaching interactive controls.
* **Who It Affects Most**:  
  Users with motor impairments using single switches, mouth sticks, or sip-and-puff devices where every key press requires physical effort. Tabbing across every line causes severe fatigue. Screen magnifier users are also disoriented because their zoomed viewport jumps erratically through static text lines.
* **Probability Remaining (Based on Discussions)**: **High (~85%)**. Broad consensus that non-interactive tab stops break keyboard efficiency and create exhausting navigation barriers (Issues #92, #188, #267, #622). Only operable or scrollable elements belong in the tab ring.

#### 5. Autofocus on Page Load or Delayed Popups
* **What WCAG 2.2 allowed**: Applying `autofocus` to a search input or popping focus to a newly loaded chat widget passes 3.2.1.
* **WCAG 3 Core Provision**: `focus-user-controlled`
* **The Simple Question**:
  > *"Does keyboard focus stay put until the user takes an intentional action to move it?"*
* **Why it fails Tier 2 (Foundational Access)**:  
  Stealing focus disorients screen reader and low-vision users by pulling them away from the top of the document without consent. It creates an immediate barrier to exploring and comprehending the page structure.
* **Probability Remaining (Based on Discussions)**: **Moderate to High (~75%–80%)**. Consensus is firm that unexpected focus movement disorients screen reader and low-vision users (Issue #616). Debates center on potential narrow exemptions (e.g. single-input search landing pages or user-triggered modal dialogs).

#### 6. Hijacking Platform & Browser Shortcuts
* **What WCAG 2.2 allowed**: Only single-character shortcuts are constrained under 2.1.4. Intercepting modifier shortcuts (e.g. `Ctrl+S`, `Cmd+K`) passes 2.2.
* **WCAG 3 Core Provision**: `no-keyboard-conflicts`
* **The Simple Question**:
  > *"Can users use standard browser and operating system shortcuts without the web app intercepting them?"*
* **Why it fails Tier 2 (Foundational Access)**:  
  Intercepting operating system or browser hotkeys overrides essential assistive technology keystrokes (such as screen reader virtual cursor toggles or browser zoom commands), locking users out of their assistive software.
* **Probability Remaining (Based on Discussions)**: **Very High (~95%)**. Universal opposition in AGWG to overriding native platform and assistive technology hotkeys (Issue #267), which completely isolates users from their assistive software.

#### 7. Breaking Virtual Cursor Navigation and Alternative Points of Regard
* **What WCAG 2.2 allowed**: SC 2.1.1 (Keyboard) only requires functionality to be operable via a physical keyboard interface. Interfaces that trigger disclosure panels, tooltips, or interactions strictly on DOM `:focus` or native keystrokes pass 2.1.1 even if screen reader browse mode / virtual cursors cannot access or activate them.
* **WCAG 3 Core Provisions**: `virtual-cursor-supported` and `assistive-technology-supported`
* **The Simple Question**:
  > *"Can assistive technologies access, read, and operate all content and interactions using mechanisms that convey alternative points of regard or focus (such as a screen reader virtual cursor or touch exploration), without depending on raw physical keyboard focus or instructions to turn off browse mode?"*
* **Why it fails Tier 2 (Foundational Access)**:  
  Screen reader users read and interact primarily using a virtual cursor (JAWS Virtual PC cursor, NVDA Browse Mode, VoiceOver cursor, or mobile touch exploration) that moves an independent point of regard across the DOM. Content or interactions that only reveal themselves upon physical DOM keyboard focus or native mouse hover are reachable via a physical keyboard but completely unreadable and inoperable to assistive technology.
* **Who It Affects Most**:  
  Blind students and newer screen reader users who only know browse mode. Instructing users to toggle off virtual cursors (or trapping them in Forms Mode) creates an immediate barrier. Refreshable braille readers are also blocked because braille translation displays follow the virtual reading cursor line by line.
* **Probability Remaining (Based on Discussions)**: **Very High (~90%–95%)**. Codified directly in the foundational tier under `user-control/assistive-technology-control`. The AGWG recognizes that decoupling accessibility requirements from hardware keyboard events to support virtual cursors and alternative points of regard is vital to reflect real-world assistive technology usage.

#### 8. Announcing Roles Through aria-live Instead of Real Semantic Controls
* **What WCAG 2.2 allowed**: SC 4.1.2 (Name, Role, Value) requires names and roles, but custom widget engines often simulate controls by injecting spoken strings like *"Button, flip card, 1 of 5"* into an `aria-live` container upon arrow-key presses, without creating a real focusable element.
* **WCAG 3 Core Provisions**: `interactive-element-names-available`, `roles-values-states-properties-available`, and `assistive-technology-supported`
* **The Simple Question**:
  > *"Can a user who navigates by voice control say 'click [Name]' and have it activate, and can braille displays recognize it as an operable control?"*
* **Why it fails Tier 2 (Foundational Access)**:  
  Spoken strings dispatched via `aria-live` do not create interactive nodes in the browser's accessibility tree. While a screen reader user might hear the speech synthesizer speak the word "Button", the software does not register an interactive widget.
* **Who It Affects Most**:  
  Voice-control users (Apple Voice Control, Dragon NaturallySpeaking) are completely locked out because there is no native control node or accessibility label to target by speech. Switch-control users whose devices scan interactive targets cannot find the synthetic control. Braille display users receive no tactile button indicator.
* **Probability Remaining (Based on Discussions)**: **Very High (~95%)**. Universal agreement across the working group that aria-live announcements cannot substitute for programmatic semantics and operable accessibility tree nodes.

#### 9. Text and Focus Indicators Drawn as Pixels on a Canvas
* **What WCAG 2.2 allowed**: SC 1.4.4 requires 200% zoom and 1.4.5 restricts images of text, but canvas-based apps (e.g. Flutter CanvasKit, Godot web exports, HTML5 games) frequently paint text and simulated focus rings directly into an HTML `<canvas>`, sometimes pairing it with an invisible offscreen dummy container.
* **WCAG 3 Core Provisions**: `text-detectable`, `text-color-adjustable`, `text-size-adjustable`, and `user-settings-supported`
* **The Simple Question**:
  > *"Is all interface text real programmatic text that can be highlighted, selected, magnified to 200%, restyled with user color themes, and machine-translated?"*
* **Why it fails Tier 2 (Foundational Access)**:  
  Text drawn on a canvas consists of bitmap pixel data. It is invisible to screen readers, cannot be highlighted by text-to-speech tools, cannot reflow when resized, and ignores user-level contrast and color settings. Simulated canvas focus rings cannot adapt to OS high-contrast modes.
* **Who It Affects Most**:  
  Low-vision students who rely on custom colors or high contrast; students with dyslexia using font extensions (e.g. OpenDyslexic) or read-aloud tools; English language learners relying on automatic browser translation; and screen reader users whose browse mode finds nothing on the canvas.
* **Probability Remaining (Based on Discussions)**: **Very High (~95%)**. Foundational access in WCAG 3 requires programmatic exposure of text and visual state.

---

### Part C: Motion, Media & User System Preferences

#### 10. Autoplaying Motion or Video Loops (with a Pause Button)
* **What WCAG 2.2 allowed**: Looping video backgrounds, banners, and carousels are permitted to start automatically if a mechanism to pause, stop, or hide them exists (2.2.2).
* **WCAG 3 Core Provisions**: `motion-autoplay-avoided` and `no-visual-motion`
* **The Simple Question**:
  > *"Does visual motion or animation avoid starting automatically without user initiation?"*
* **Why it fails Tier 1 (Avoid Physical Harm)**:  
  Visual motion triggers physical vestibular illness (nausea, dizziness, vertigo, and migraines) immediately upon page load—long before a user can locate and activate a pause button. Under WCAG 3's harm model, unrequested motion fails **Tier 1 immediately**.
* **Probability Remaining (Based on Discussions)**: **Very High (~95%)**. Consensus in the user control and harm subgroup (Issues #27, #181, #739) is decisive: physical harm (vestibular illness) cannot be excused by a pause button and belongs at Tier 1 (Avoid Physical Harm), not AAA.

#### 11. Ignoring OS Accessibility Settings (`prefers-reduced-motion`, Dark Mode)
* **What WCAG 2.2 allowed**: Ignoring system-level accessibility settings does not fail Level AA.
* **WCAG 3 Core Provision**: `user-settings-supported`
* **The Simple Question**:
  > *"Does the site respect and adapt to system-level accessibility settings like prefers-reduced-motion and high contrast?"*
* **Why it fails Tier 1 & Tier 2**:  
  * For users with vestibular disorders who configure `prefers-reduced-motion`, forcing animation causes physical illness (**Fails Tier 1**).  
  * For low-vision users who rely on high contrast or inverted colors, overriding these modes creates an impassable visibility barrier (**Fails Tier 2**).
* **Probability Remaining (Based on Discussions)**: **High (~85%–90%)**. Treating system accessibility flags (`prefers-reduced-motion`, high contrast) as mandatory safety baselines has broad backing across working group discussions (Issues #40, #182, #183, #737).

#### 12. Captions Without a Synchronized Text Transcript
* **What WCAG 2.2 allowed**: Prerecorded video at Level AA only requires captions (1.2.2) and audio descriptions (1.2.5). A full transcript is optional.
* **WCAG 3 Core Provision**: `dialogue-transcripts-available-prerecorded`
* **The Simple Question**:
  > *"Is a complete text transcript provided right alongside every video or audio track?"*
* **Why it fails Tier 2 (Foundational Access)**:  
  Deafblind individuals using refreshable braille displays and people with auditory processing impairments cannot read moving captions synchronized to streaming video. The absence of a stationary text transcript represents a total barrier to consuming the media.
* **Probability Remaining (Based on Discussions)**: **Moderate to High (~75%–80%)**. Requiring full transcripts alongside captions for prerecorded dialogue has strong deafblind community support (Issue #519), but discussions continue around potential exemptions for purely ambient or background video.

---

### Part D: Forms, Authentication & Cognitive Assistance

#### 13. Traditional Puzzle CAPTCHAs & Verification Challenges
* **What WCAG 2.2 allowed**: Cognitive tests pass 3.3.8 if an alternative (such as audio or image recognition) is available.
* **WCAG 3 Core Provision**: `cognitive-test-alternatives-available`
* **The Simple Question**:
  > *"Can users complete registration or login without having to solve a puzzle, transcribe distorted text, or take an unaided memory test?"*
* **Why it fails Tier 2 (Foundational Access)**:  
  Cognitive puzzles represent an insurmountable barrier for individuals with learning, intellectual, or memory disabilities. In WCAG 3, an accessible alternative with zero cognitive testing is required for foundational access.
* **Probability Remaining (Based on Discussions)**: **Very High (~95%)**. COGA and AGWG firmly agree that cognitive puzzle challenges without cognitive-free alternatives are an absolute exclusion barrier (Issues #176, #636).

#### 14. Blocking Paste in Form Inputs
* **What WCAG 2.2 allowed**: Disabling paste in "Confirm Password" or email fields is discouraged but technically conforms to AA.
* **WCAG 3 Core Provision**: `automated-entry-allowed`
* **The Simple Question**:
  > *"Can users paste text and use password managers or browser autofill in every input field?"*
* **Why it fails Tier 2 (Foundational Access)**:  
  Blocking paste creates an impassable barrier for users who rely on password managers, virtual clipboards, augmentative communication tools, or voice-dictation software to enter complex strings.
* **Probability Remaining (Based on Discussions)**: **Very High (~95%)**. Universal consensus across AGWG and cybersecurity best practices; blocking automated entry or password managers is recognized as an artificial barrier without justification.

#### 15. Placeholder Text as the Only Form Label
* **What WCAG 2.2 allowed**: Using a placeholder with an invisible programmatic name (e.g. `aria-label`) passes 3.3.2.
* **WCAG 3 Core Provision**: `interactive-element-names-available`
* **The Simple Question**:
  > *"Does every input field have a visible label that stays visible while typing and after the field is filled?"*
* **Why it fails Tier 2 (Foundational Access)**:  
  When placeholder text disappears upon typing, users with cognitive or short-term memory impairments lose all visual context regarding what was requested or how to review what they entered.
* **Probability Remaining (Based on Discussions)**: **Very High (~90%)**. Strong agreement (Issues #93, #184, #890) that labels must visibly persist while typing; disappearing placeholder labels are solidly rejected.

#### 16. Showing Errors Only in a Page-Top Summary
* **What WCAG 2.2 allowed**: Providing a list of errors in a box at the top of the form satisfies 3.3.1.
* **WCAG 3 Core Provision**: `errors-associated`
* **The Simple Question**:
  > *"Is each validation error directly and programmatically linked to the specific input field that caused it?"*
* **Why it fails Tier 2 (Foundational Access)**:  
  Screen reader users and magnifier users navigating through form inputs one by one cannot determine which field is invalid or what correction is needed without a direct programmatic and visual association.
* **Probability Remaining (Based on Discussions)**: **High (~85%)**. Subgroup consensus (Issues #669, #789, #790) agrees that field-level error association is required for foundational access, so top-of-page summaries alone fail Tier 2.

#### 17. Multi-Step Wizards Without a Step List
* **What WCAG 2.2 allowed**: Multi-step checkouts and applications do not need to display a step tracker or progress counter.
* **WCAG 3 Core Provisions**: `all-steps-listed` and `current-step-indicated`
* **The Simple Question**:
  > *"Does a multi-step process clearly display the list of all steps and show which step the user is currently on?"*
* **Why it fails Tier 2 (Foundational Access)**:  
  Navigating multi-step procedures without step landmarks causes disorientation for people with cognitive or executive-functioning impairments who cannot retain procedural context across multiple screen reloads.
* **Probability Remaining (Based on Discussions)**: **Moderate (~65%–70%)**. Actively discussed in Issue #445 ("Location in multi-step process - Reconsider type/level") regarding whether step indication should remain a Tier 2 foundational requirement or be classified as Tier 3 supplemental for brief or simple flows.

#### 18. Hidden Pre-Selected Options & Add-On Items
* **What WCAG 2.2 allowed**: Pre-checked checkboxes tucked into collapsed accordions pass if marked up properly.
* **WCAG 3 Core Provision**: `preselections-visible`
* **The Simple Question**:
  > *"Are all default or pre-ticked options visible without requiring the user to expand hidden accordions or trays?"*
* **Why it fails Tier 2 (Foundational Access)**:  
  Hiding default selections behind collapsed trays creates deceptive, exclusionary barriers that commit disabled users to unwanted charges or terms without their awareness.
* **Probability Remaining (Based on Discussions)**: **Moderate (~60%–65%)**. Issue #437 ("Remove 'No hidden preselections'?") and Issue #438 reflect debate over whether dark-pattern deceptive design belongs within WCAG accessibility guidelines or external consumer protection frameworks.

#### 19. Biometric-Only Authentication
* **What WCAG 2.2 allowed**: Offering facial recognition or fingerprint scanning alone satisfies 3.3.8 as a cognitive alternative.
* **WCAG 3 Core Provision**: `biometrics-not-relied-on`
* **The Simple Question**:
  > *"Is there always a non-biometric alternative for users who lack biometric sensors or compatible physical attributes?"*
* **Why it fails Tier 2 (Foundational Access)**:  
  Users without biometric hardware or individuals whose physical characteristics are not recognized are completely locked out of the service.
* **Probability Remaining (Based on Discussions)**: **High (~85%)**. Issue #572 supports requiring non-biometric alternatives to prevent permanent lockouts for users without biometric sensors or compatible physical traits.

---

### Part E: Single-Page Apps (SPAs) & Dynamic Content

#### 20. Silent Client-Side Route Transitions
* **What WCAG 2.2 allowed**: Swapping screen content in a SPA while updating `<title>` often passes 2.4.2 without an explicit announcement.
* **WCAG 3 Core Provision**: `page-view-change-notified`
* **The Simple Question**:
  > *"When a single-page app switches views or routes, is the change immediately announced to assistive technology and the focus moved appropriately?"*
* **Why it fails Tier 2 (Foundational Access)**:  
  When an app updates the view silently via JavaScript, blind screen reader users receive no feedback that navigation occurred, leaving them stranded in previous content and unable to perceive the new view.
* **Probability Remaining (Based on Discussions)**: **Very High (~90%)**. Wide consensus (Issues #421, #430, #889) that major view updates in single-page apps must be announced to assistive tech; discussions focus solely on implementation mechanics.

---

## 4. Architectural Evaluation: Native HTML/Vue vs. Canvas Engines

Teams selecting front-end architectures for interactive lessons, digital tools, or web applications face critical framework tradeoffs under WCAG 3.

### The Canvas Engine Dilemma (e.g., Godot Web Export, Flutter CanvasKit)
Game engines and canvas-based web renderers draw all controls, text, and focus indicators as raw pixel bitmaps on an HTML5 `<canvas>`.
* **Zero Browser Screen Reader Support**: Libraries like AccessKit provide desktop accessibility (Windows, macOS, Linux), but browser web support for canvas applications remains experimental or planned without firm release schedules. Screen readers in browsers have no DOM tree to read.
* **The Dual-UI Maintenance Trap**: To provide accessibility in canvas, teams are forced to construct a parallel "HTML shadow DOM" alongside the canvas. This creates two distinct user interfaces that must be kept in perfect synchronization—recreating the exact maintenance overhead and divergence risks of legacy Conforming Alternate Versions.
* **Loss of System Personalization**: Canvas text cannot be magnified using browser text-zoom settings, cannot reflow cleanly, cannot inherit operating system High Contrast / Forced Colors themes, cannot be selected for dyslexia read-aloud tools, and breaks automatic browser machine translation.

### The Native Component Advantage (e.g., Vue, React, Astro)
Component frameworks that render standard semantic HTML elements inherently provide the DOM nodes required by assistive technology:
* Native `<button>` and `<a>` elements automatically expose programmatic names, roles, and states without synthetic `aria-live` workarounds.
* Screen reader browse mode and virtual cursors operate natively through DOM text nodes.
* CSS media queries automatically inherit OS preferences (`prefers-reduced-motion`, `prefers-color-scheme`, `forced-colors`).
* Browser magnification, font replacement extensions, and translation services work out of the box.

---

## 5. Prototype & Framework Evaluation Checklist

Before committing an engineering team to a framework or interactive module build, test a minimal interactive prototype (e.g., one flip card, one randomizer, one click-and-place activity) against this 6-point verification gate:

1. **Virtual Cursor in Browse Mode**: Test with NVDA and JAWS with the virtual cursor ON, VoiceOver on macOS and iOS, and TalkBack on Android. Can a student read all text line-by-line and trigger actions with `Enter` / `Space` without encountering instructions to change settings or toggle Forms Mode?
2. **Voice Control Targeting**: Using Apple Voice Control or Dragon NaturallySpeaking, can a user speak the visible text label (e.g., *"click Flip card"*) and have the control activate immediately?
3. **Low-Vision Zoom & Text Scaling**:
   * Enlarge text size to 200% without page zoom. Does text remain readable and reflow without clipping?
   * Zoom page to 400%. Do controls remain operable without horizontal scrolling?
   * Does OS magnification follow keyboard focus seamlessly across all states?
4. **Platform Settings Inheritance**:
   * Turn on High Contrast / Forced Colors in Windows. Are all borders, buttons, and focus indicators clearly visible?
   * Enable `prefers-reduced-motion`. Do animations (such as card flips or transitions) resolve instantly or switch to non-moving state changes?
5. **Keyboard Operability & Focus Geometry**:
   * Press `Tab`: does focus land strictly on interactive controls, skipping static body text?
   * Is the focus indicator prominently visible in all states, and does it avoid being obscured by floating trays or sticky banners?
6. **Accessibility Support Set Documentation**: Formally record the exact browser versions, operating systems, and assistive technologies tested, building the audit trail required by WCAG 3 assertions.

---

## 6. Regulatory Horizon: When Will WCAG 3 Impact Compliance?

While WCAG 3 remains an active Working Draft with Candidate Recommendation slated for late 2027 and final Recommendation estimated around 2029+, historical federal adoption patterns demonstrate why architectural alignment is necessary today:

* **WCAG 2.0 (December 2008)**: Adopted into US Section 508 in January 2017, taking legal effect in January 2018 (a **9-year lag**).
* **WCAG 2.1 (June 2018)**: Adopted by the Department of Justice under ADA Title II (Level AA) in April 2024, with compliance deadlines set for April 2027 (large public entities) and April 2028 (smaller entities) (a **6- to 9-year lag**). HHS Section 504 followed a similar timeline.
* **WCAG 3 Timeline**: If the standard finishes around 2029, federal rule-making and international standard harmonization (EN 301 549) will likely take effect in the **mid-to-late 2030s**.

**Strategic Takeaway**: Enterprise web platforms, higher education course platforms, and learning management systems built over the next few years will still be actively deployed when WCAG 3 becomes the benchmark. Designing architectures now around WCAG 3 Tier 1 (safety) and Tier 2 (foundational access) prevents costly structural refactors down the road.

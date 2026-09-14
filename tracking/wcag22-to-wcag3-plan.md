# Planning against the 2.2 → 3 gap

**Baseline:** W3C editors' draft `1ac7ded`, 2026-09-10 · 245 provisions
**Written:** 2026-09-14 · regenerate the facts with `npm run track:upstream`

Everything below is drawn from the draft at that commit. WCAG 3 is not a
Recommendation and nothing here is a compliance obligation. WCAG 2.2 remains the
standard to conform to today; the draft says explicitly that WCAG 3 **does not
deprecate WCAG 2**.

---

## 1. Where the draft actually stands

| | |
| --- | --- |
| Provisions | 245 |
| Types | foundational 114 · supplemental 86 · assertion 36 · recommended practice 1 · untyped 8 (all exploratory) |
| Maturity | developing 216 · exploratory 29 |
| At *refining* or *mature* | **0** |

Nothing in the draft has reached "ready for wide public review and experimental
adoption" yet. That single number sets the ceiling on how firmly anything here
can be planned. The right posture is *prepare for the shape of the model*, not
*implement the provisions*.

---

## 2. The five structural differences that actually change how you work

These are the parts of WCAG 3 that are not a restatement of WCAG 2.2 in new
words. Each one is now settled enough in the draft to plan around.

### 2.1 Leveling moved off conformance and onto reporting

This changed in the August–September 2026 drafts ([#826], [#827], [#834]) and is
the single most consequential shift for anyone with a WCAG 2.2 programme. The
draft's own words: *"This update to WCAG 3 moves the concept of leveling from
conformance to reporting."*

| Tier | What it requires |
| --- | --- |
| 1 — Avoid physical harm | Physical harm and risk requirements met |
| 2 — Foundational access | …plus barrier requirements |
| **3 — Conformance** | …plus friction requirements (**all core requirements met**) |
| 4 — Bronze | …plus [TBD] supplemental requirements and content assertions |
| 5 — Silver | …plus [TBD greater number of] the same |
| 6 — Gold | …plus [TBD] organizational assertions |

Three things follow:

- **There is one conformance bar, not three.** A/AA/AAA has no successor. You
  either meet all core requirements (tier 3) or you don't. Tiers 1–2 are
  *progress toward* conformance; 4–6 are *beyond* it.
- **Bronze / Silver / Gold are no longer the conformance levels.** They sit
  *above* conformance now. Any internal material describing Bronze as the
  minimum bar is describing an older draft. The draft also flags a competing
  proposal — scoring toward conformance, then Bronze/Silver/Gold awards after —
  and explicitly invites comment on which to keep. **Treat the tier table as
  unsettled.**
- **The tier machinery isn't wired up.** Tiers are driven by tagging each core
  requirement as *physical harm*, *barrier*, or *friction*. As of `1ac7ded`,
  **0 of 245 provisions carry any tag**. You cannot yet work out which tier a
  given provision lands in. The tracker reports this count every run; the first
  non-zero number is the signal that tier planning becomes possible.

### 2.2 Assertions: a requirement class with no 2.2 equivalent

36 of 245 provisions are **assertions** — statements that your organization did
something, not tests against rendered output. They read
`[Title, role, or organization] asserts that:` followed by evidence: who made
the assertion, when the review or usability testing happened, what the scope
was.

Where they cluster:

| Group | Assertions |
| --- | --- |
| images-and-media | 13 |
| layout · policy-and-protection · process-and-task-completion | 4 each |
| interactive-components | 3 |
| help-and-feedback · input-operation · text-and-wording | 2 each |
| animation-and-movement · error-handling | 1 each |

No automated tool will ever satisfy one of these, and no amount of clean markup
will either. They are satisfied by having a style guide, running usability
testing with disabled participants, conducting documented reviews, and keeping
records. Under the tier table, assertions sit at tiers 4–6 — above conformance —
so they are not required to conform, but they are the whole substance of the
tiers a regulator or a procurement process is most likely to reach for.

**This is the longest-lead item on the list.** Building a usability-testing
practice and a documented review habit takes quarters, not sprints, and none of
it depends on the draft settling. It is the one thing worth starting now.

### 2.3 Conformance scope replaces the page

WCAG 2.2 conformance is per-page, with conforming alternate versions as the
escape hatch. WCAG 3 claims apply to a **conformance scope** — *"a clearly
defined part of your content"* — and the draft's phrasing changed in [#834] from
"you must use the process described in this document" to *"you MUST apply the
guidelines to a clearly defined part of your content."*

Claims are also **optional**: *"Your content can conform to WCAG 3, even if you
do not want to make a claim."*

Practical consequence: the unit of audit becomes a product, a flow, or a defined
slice of a site. Per-page pass/fail spreadsheets don't port over. Start thinking
about what your defensible scope boundaries would be — they're a product and
legal question as much as a technical one.

### 2.4 Accessibility support became a claim obligation

In WCAG 2.2, "accessibility supported" is a definition that mostly lives in the
background. In the draft it is load-bearing and explicit: methods *MUST* be
accessibility supported, WCAG 3 defines **accessibility support sets** naming
which browsers and AT count, and *"the accessibility support set MUST be
included in conformance claims."*

If you make claims, you will have to state your AT/browser baseline in them. Most
organizations have this only as tribal knowledge or a stale QA matrix. Writing it
down is cheap, useful independently of WCAG 3, and safe to do now.

### 2.5 Requirements split three ways, plus advisory material

WCAG 2.2 has success criteria at three levels. WCAG 3 has:

- **Core requirements** — MUST, and the whole of conformance (tier 3)
- **Supplemental requirements** — improve accessibility, feed tiers 4–6
- **Assertions** — see 2.2 above
- **Recommended practices** — renamed from "best practices" in [#839]; explicitly
  *not necessary to conform*

The AAA-equivalent instinct ("nice if we get to it") maps roughly onto
supplemental, but the mapping is not clean and the split isn't final — 8
provisions currently carry no type at all.

---

## 3. What your existing 2.2 work buys you

The draft is unusually direct about this:

> Content that conforms to WCAG 2.2 Level A and Level AA is expected to meet most
> of the minimum conformance level of this new standard but, since WCAG 3
> includes additional tests and different scoring mechanics, additional work will
> be needed to reach full conformance.

Read "most of" carefully. A clean 2.2 AA programme is a strong head start on
tier 3 and no guarantee of it. The gap comes from three places: provisions with
no 2.2 ancestor, provisions that restate a 2.2 SC more broadly, and the evidence
requirements that assertions introduce.

The W3C has also committed to *"transition support materials, which may use
mapping and other approaches to facilitate migration."* Those don't exist yet.
Until they do, any 2.2 → 3 mapping — including this repo's — is an
interpretation, not an authority. Label it that way on the site.

---

## 4. Where 2.2 requirements visibly stretched in this draft

Four concrete examples from the 2026-07-31 → 2026-09-10 window, each one a case
where a 2.2 SC does not cover the new provision cleanly:

**Media alternatives fragmented (1.2.1 – 1.2.9).** The single
`media-alternatives` guideline was dissolved into `captions`,
`audio-descriptions`, `transcripts`, `sign-language` and
`accessible-media-player` ([#673], [#796], [#821], `56c3e7f`). images-and-media
is now 68 provisions — 28% of the entire draft. Nine 2.2 SCs used to point at one
slug; they now fan out across roughly forty. Captions and transcripts each carry
separate provisions for speaker identification, non-verbal cues, sounds, spoken
language, equivalence, findability, style guide, author review and usability
testing. Anyone running video at scale should read this section as the largest
single block of new work in the draft.

**Flashing rebuilt around thresholds (2.3.1, 2.3.2).** `no-flashing` and
`no-flashing-no-exceptions` were replaced by `no-flashing-over-threshold`,
`no-flashing-over-threshold-no-exceptions`, and a new *exploratory*
`single-flash` ([#628]). `single-flash` has no 2.2 equivalent at all: *"Content
does not include a change of contrast (over 4.5:1) going from light to dark (or
dark to light) of more than 30% of the visible content area."* That is a
constraint on ordinary page transitions and dark-mode toggles, not just on
seizure-inducing video. It is exploratory, so don't build for it — but know it's
being discussed.

**Adjacent interactive elements generalized.** `no-repetitive-links` became
`no-repetitive-adjacent-interactive-elements` ([#602]), and the text went from
*"Repetitive adjacent links that have the same destination are avoided"* to
*"Adjacent interactive elements that achieve the same outcome are not included
in the page/view."* Broader on both axes — any interactive element, any
same-outcome duplication. The common card pattern (thumbnail link + title link +
"Read more" link, all to the same place) fails the new wording and passes most
2.2 audits today.

**Sensory characteristics broadened (1.3.3).** The enumeration was deleted:
*"Instructions and help do not rely on sensory characteristics such as shape,
color, size, visual location, orientation, or sound"* → *"…do not rely on
sensory characteristics."* Whether that widens the obligation or just moves the
list into a definition is exactly the kind of thing to watch in the glossary.

---

## 5. What to do, in order

**Now — independent of how the draft settles**

1. Start a usability-testing practice with disabled participants, and start
   keeping records of it. 36 assertions are waiting for exactly this evidence and
   it cannot be retrofitted.
2. Write down your accessibility support set: the browser and AT versions you
   actually test against, dated and owned.
3. Write the style guides the assertions ask for — alt text, captions,
   transcripts, audio description, focus indicators. Several assertions are
   satisfied by a documented style guide plus evidence it's followed.
4. Decide what your conformance scopes would be if you had to declare them.

**Next — cheap hedges**

5. Audit your media pipeline against the new images-and-media structure. If you
   publish video, this is where the new work is concentrated.
6. Sweep for same-outcome adjacent interactive elements. It's a real usability
   improvement regardless of what the provision ends up saying.

**Not yet — wait for the draft**

7. Anything tier-specific. Zero provisions are tagged; tier placement is
   unknowable and the tier model itself has a live competing proposal.
8. Anything resting on the 29 exploratory provisions, `single-flash` included.
9. Rewriting a 2.2 audit programme. 2.2 is still the standard; nothing in WCAG 3
   is at *refining* maturity.

---

## 6. Actions for this repo

From the mapping health check in
[`reports/2026-09-14-upstream-changes.md`](reports/2026-09-14-upstream-changes.md):

- **`media-alternatives-available` is a dead slug.** Nine SCs (1.2.1 – 1.2.9)
  point at it and it no longer exists upstream. Retarget across the new
  captions / audio-descriptions / transcripts / sign-language provisions.
- **`focus-indicator-visible` never existed upstream at all** — not renamed,
  never present in the history. 2.4.12 and 2.4.13 point at a slug this repo
  invented. Retarget to real provisions under
  `interactive-components/keyboard-focus-appearance`.
- **8 references resolve to a guideline or group, not a provision** —
  `media-control`, `user-control`, `animation-and-movement`,
  `navigating-content`, `keyboard-focus-appearance`, `clear-language`,
  `consistency-across-views`, `error-handling`. They work, but can't carry a
  provision-level status or type. Worth tightening.
- **41 upstream provisions are missing from `wcag3-catalog.json`**, mostly the
  new media set. Merge upstream, `npm run sync:plain-english`, then annotate.
- **15 catalog entries no longer exist upstream** and should be retired.
- **The site's Bronze/Silver/Gold framing needs rewriting.** The README and the
  plain-English pages present Bronze/Silver/Gold as the conformance rating model.
  In this draft they are reporting tiers *above* conformance, and the model is
  one of two competing proposals. This is the most visible piece of the site that
  is now describing an older draft.
- **The auto-generated `wcag22Comparison` annotations need a caveat or a pass.**
  Every one of the 219 catalogued provisions cites a 2.2 criterion, including
  ones where the match is clearly templated rather than reasoned — `audio-shifting-adjustable`
  mapped to 1.3.1 Info and Relationships, for instance. Either mark them as
  heuristic in the UI or curate them; presenting a generated guess with the same
  confidence as a hand-checked mapping is the kind of thing the accessibility
  community will notice.

---

## 7. What the tracker watches from here

Each run of `npm run track:upstream` will surface, in priority order:

1. Changes to the conformance section in `src/pages/guidelines/index.astro` —
   especially anything resolving the tier-vs-scoring question, or a Call for
   Consensus on conformance
2. The tag count moving off zero — tier planning becomes possible
3. Provisions reaching **refining** status — the first genuinely plannable content
4. New, removed or renamed provisions, and the 2.2 mappings they break
5. Glossary changes, which ripple silently into every provision using `:term[]`

[#602]: https://github.com/w3c/wcag3/pull/602
[#628]: https://github.com/w3c/wcag3/pull/628
[#673]: https://github.com/w3c/wcag3/pull/673
[#796]: https://github.com/w3c/wcag3/pull/796
[#821]: https://github.com/w3c/wcag3/pull/821
[#826]: https://github.com/w3c/wcag3/pull/826
[#827]: https://github.com/w3c/wcag3/pull/827
[#834]: https://github.com/w3c/wcag3/pull/834
[#839]: https://github.com/w3c/wcag3/pull/839

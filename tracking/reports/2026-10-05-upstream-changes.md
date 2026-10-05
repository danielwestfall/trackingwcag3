# WCAG 3 upstream change report

**Range:** `091d074` (2026-09-17) → `18c12bf` (2026-10-02)  
**Upstream:** https://github.com/w3c/wcag3  
**Commits touching tracked spec content:** 1  
**Generated:** 2026-10-05

> Automated diff of the W3C WCAG 3 editors' draft. Everything below is draft
> material and can change again before Candidate Recommendation.

## Summary

| Area | Added | Removed | Renamed | Modified |
| --- | ---: | ---: | ---: | ---: |
| explainer-doc | 0 | 0 | 0 | 1 |

## Conformance model, Requirements & Explainer

This is where WCAG 3 departs from WCAG 2.2 structurally. Read this before the provision lists.

### Explainer

- `18c12bf` 2026-10-02 — Tidy up explainer definitions [#872](https://github.com/w3c/wcag3/pull/872)

**New or rewritten prose** (16 lines; first 16):

> web-based or non-web-based application(s) that can be used by authors (alone or collaboratively) to create or modify web content for use by other people (other authors or end users)
> evaluation conducted using software tools, typically evaluating code-level features and applying heuristics for other tests
> Automated testing is contrasted with other types of testing that involve human judgement or experience. [=Semi-automated evaluation=] allows machines to guide humans to areas that need inspection. The emerging field of testing conducted via machine learning is not included in this definition.
> satisfying all the requirements of the guidelines
> Conformance is an important part of following
> declare something outdated and in the process of being phased out, usually in favor of a specified replacement
> outcome of processes and actions that ensure the spectrum of human reality obtains what is needed to participate, not solely access
> As equity relates to WCAG it is about the impact the standards/guidelines have on people with disabilities, along with actually including people with disabilities in the work.
> process of examining content for conformance to these guidelines
> statement that describes a specific gap in one's ability, or a specific mismatch between ability and the designed environment or context
> sequence of steps that need to be completed to accomplish an activity / task from
> reproducibility and consistency of evaluation results
> The extent to which evaluation results are the same when evaluations of the same resources are carried out in different contexts (different tools, different people, different goals, different time). This would be particularly useful to ensure that similar results are achieved by different testers. It would also be useful to see if different testers would select the same path or off-path decisions. Representative sampling tests also fit in this category.
> Benchmarking Web Accessibility Metrics , Vigo, Lopes, O'Connor, Brajnik, Yesilada 2011.
> software that retrieves, renders and facilitates end user interaction with web content
> Web browsers, browser plug-ins, media players.

**Dropped prose** (15 lines; first 12):

> ~~Any web-based or non-web-based application(s) that can be used by authors (alone or collaboratively) to create or modify web content for use by other people (other authors or end users).~~
> ~~Evaluation conducted using software tools, typically evaluating code-level features and applying~~
> ~~Automated testing is contrasted with other types of testing that involve human judgement or~~
> ~~experience. [=Semi-automated evaluation=] allows machines to guide humans~~
> ~~to areas that need inspection. The emerging field of testing conducted via~~
> ~~machine learning is not included in this definition.~~
> ~~Satisfying all the requirements of the guidelines. Conformance is an important part of following~~
> ~~To declare something outdated and in the process of being phased out, usually in favor of a specified replacement.~~
> ~~the outcome of processes and actions that ensure the spectrum of human reality obtains what is needed to participate, not solely access. As equity relates to WCAG it is about the impact the standards/guidelines have on people with disabilities, along with actually including people with disabilities in the work.~~
> ~~The process of examining content for conformance to these~~
> ~~A statement that describes a specific gap in one’s ability, or a specific mismatch between ability and the designed environment or context.~~
> ~~A sequence of steps that need to be completed to accomplish an activity / task from~~

## Provisions

## Draft shape right now

Upstream publishes **245** provisions.

- **By type:** foundational 114 · supplemental 86 · assertion 36 · none 8 · recommended practice 1
- **By maturity status:** developing 216 · exploratory 29
- **Flagged `needsAdditionalResearch`:** 13
- **Tagged for reporting tiers:** 0 of 245

No provision carries a tag yet. Reporting tiers are described in the conformance
section but the harm / barrier / friction tagging that drives them has not been
applied, so tier placement can't be predicted per provision. Watch this number.

## Impact on your WCAG 2.2 → 3 mapping

No broken provision references. ✔

### References pointing at a guideline or group, not a provision (6)

These resolve upstream, but at a coarser level than a provision, so they can't
carry a provision-level status or type. Worth tightening.

- `media-control` (guideline) — referenced by 1.4.2, 1.4.7
- `user-control` (group) — referenced by 2.1.4, 2.5.4, 2.5.6
- `navigating-content` (guideline) — referenced by 2.4.1, 2.4.2, 2.4.3, 2.4.8, 2.4.5
- `clear-language` (guideline) — referenced by 3.1.3, 3.1.4, 3.1.5, 3.1.6
- `animation-and-movement` (group) — referenced by 2.3.3
- `error-handling` (group) — referenced by 3.3.3

## Commits touching tracked content

- `18c12bf` 2026-10-02 — Tidy up explainer definitions [#872](https://github.com/w3c/wcag3/pull/872)

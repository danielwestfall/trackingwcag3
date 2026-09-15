# WCAG 3 upstream change report

**Range:** `c8c2e77` (2026-07-31) → `1ac7ded` (2026-09-10)  
**Upstream:** https://github.com/w3c/wcag3  
**Commits touching tracked spec content:** 28  
**Generated:** 2026-09-14

> Automated diff of the W3C WCAG 3 editors' draft. Everything below is draft
> material and can change again before Candidate Recommendation.

## Summary

| Area | Added | Removed | Renamed | Modified |
| --- | ---: | ---: | ---: | ---: |
| provision | 36 | 10 | 7 | 134 |
| guideline | 3 | 1 | 0 | 6 |
| group-index | 0 | 0 | 0 | 1 |
| term | 3 | 5 | 0 | 21 |
| conformance-doc | 0 | 0 | 0 | 1 |
| requirements-doc | 0 | 0 | 0 | 1 |
| explainer-doc | 0 | 0 | 0 | 1 |
| informative-doc | 35 | 7 | 11 | 37 |
| method | 0 | 1 | 0 | 0 |
| act-rule | 4 | 1 | 0 | 1 |
| recommended-practice | 0 | 1 | 0 | 0 |
| acknowledgements | 0 | 0 | 0 | 2 |
| other | 1 | 0 | 0 | 0 |

## Conformance model, Requirements & Explainer

This is where WCAG 3 departs from WCAG 2.2 structurally. Read this before the provision lists.

### Guidelines document (carries the normative conformance section)

- `21f5c05` 2026-08-26 — Add explicit darkmode support to account for ReSpec 37.3.3+ [#825](https://github.com/w3c/wcag3/pull/825)
- `730c162` 2026-08-26 — Update conformance section [#826](https://github.com/w3c/wcag3/pull/826)
- `6a9391a` 2026-08-27 — Add “Progress towards and beyond conformance” section [#827](https://github.com/w3c/wcag3/pull/827)
- `3d6ee50` 2026-08-27 — More general on how materials could support policy makers [#832](https://github.com/w3c/wcag3/pull/832)
- `5b22a58` 2026-08-28 — Preparation for Aug 2026 publication
- `77c2cd6` 2026-09-02 — Incorporate pre-CFC conformance section feedback [#834](https://github.com/w3c/wcag3/pull/834)
- `ab2183f` 2026-09-07 — Editorial changes from 842 and 843 [#846](https://github.com/w3c/wcag3/pull/846)
- `7023637` 2026-09-07 — spelling fixes and changes so all instances of tiers align [#849](https://github.com/w3c/wcag3/pull/849)
- `a862fbd` 2026-09-08 — Adjusting editors note to point to intro for questions [#852](https://github.com/w3c/wcag3/pull/852)

**New or rewritten prose** (100 lines; first 25):

> To keep pace with changing technology, this specification is expected to be updated regularly and might introduce new methods, requirements, and guidelines to address new needs as technologies evolve. For entities that make formal claims of conformance to these guidelines, several tiers of reporting are available to address the diverse nature of digital content and the type of testing that is performed.
> This draft includes an updated list of the potential guidelines, requirements, and assertions. It also includes updates to conformance. While this draft has moved closer toward completion, it still has several years of work. Details will change and we encourage comments based on the questions below.
> The conformance model has been updated, there are several questions in the WCAG 3 Introduction
> Do the changes to conformance and reporting better support adoption and use?
> As part of the WCAG 3 drafting process, each normative section of this document is given a status. This status is used to indicate how far along in the development this section is, how ready it is for experimental adoption, and what kind of feedback the Accessibility Guidelines (AG) Working Group is looking for.
> Content that conforms to WCAG 2.2 Level A and Level AA is expected to meet most of the minimum conformance level of this new standard but, since WCAG 3 includes additional tests and different scoring mechanics, additional work will be needed to reach full conformance. Since the new standard will use a different conformance model, the Accessibility Guidelines (AG) Working Group expects that some organizations may wish to continue using WCAG 2, while others may wish to migrate to the new standard. For those that wish to migrate to WCAG 3, the Working Group will provide transition support materials, which may use mapping and other approaches to facilitate migration.
> The individuals and organizations that use WCAG vary widely and include web designers and developers, policymakers, purchasing agents, teachers, and students. To meet the varying needs of this audience, several layers of guidance will be provided including guidelines written as outcome statements, requirements that can be tested, assertions, a rich collection of methods, resource links, and code samples.
> Editor's notes indicate the requirements within this list where the Working Group has not found enough research to fully validate the guidance and create methods to support it or additional work is needed to evaluate existing research. If you know of existing research or if you are interested in conducting research in this area, please file a GitHub issue or send an email to public-agwg-comments@w3.org ( comment archive ).
> To make a formal conformance claim, you MUST apply the guidelines to a clearly defined part of your content. Conformance claims are not required. Your content can conform to WCAG 3, even if you do not want to make a claim.
> Assertions: Statements saying that you have done something to improve the accessibility of your content or product.
> In addition, WCAG 3 provides recommended practices. Recommended practices provide important guidance that often save time and improve accessibility. They might not always apply in every situation. Recommended practices are not necessary to conform to WCAG 3.
> The methods you use to satisfy WCAG 3 MUST be accessibility supported . This means a method only counts toward conformance if browsers and assistive technologies (AT) in general use support it. WCAG 3 uses accessibility support sets to identify which browsers and AT are used to evaluate methods. The default accessibility support set in WCAG 3 is for web methods. The accessibility support set MUST be included in conformance claims.
> This section defines the requirements for conformance to WCAG 3 and explains how to make an optional conformance claim. It also explains what it means to be accessibility supported , since only accessibility supported ways of using technologies can be relied on for conformance.
> Conformance defines how to meet the standard. Conformance with a standard is not the same as compliance with legal requirements. Historically, conformance, reporting, and compliance have often been confused. In WCAG 3, we are setting out to provide clear guidance in each of these areas in a manner that is appropriate for W3C.
> To this end, the AG Working Group will produce the following as part of the WCAG 3 effort:
> a normative, narrowly defined conformance model describing how to conform with WCAG 3,
> informative guidance for reporting and testing progress toward and beyond conformance, and
> informative advice for policymakers on how they could use WCAG 3 when writing policy.
> This approach provides flexibility so the working group can suggest ways to use WCAG to better track progress toward and beyond conformance, and encourage adoption of accessibility practices.
> The provisions of WCAG 3 are normative and define requirements that impact conformance claims. Introductory material, appendices, sections marked as "non-normative", diagrams, examples, and notes are informative (non-normative). Non-normative material provides advisory information to help interpret the guidelines but does not create requirements that impact a conformance claim.
> Core requirements &mdash; requirements that MUST be met to conform. These include requirements that ensure:
> content is detectable by user agents and assistive technologies (AT),
> content can be conveyed to multiple senses and can be operated by multiple input methods,
> content does not cause direct and immediate physical harm, and
> Supplemental requirements &mdash; requirements that build on the core set, not required for conformance. These include:

**Dropped prose** (66 lines; first 12):

> ~~To keep pace with changing technology, this specification is expected to be updated regularly with updates to and new methods, requirements, and guidelines that address new needs as technologies evolve. For entities that make formal claims of conformance to these guidelines, several levels of conformance are available to address the diverse nature of digital content and the type of testing that is performed.~~
> ~~This draft includes an updated list of the potential guidelines, requirements, and assertions that have progressed to Developing status . While this draft has moved closer towards completion, it still has several years of work. Details will change and we encourage comments based on the questions below.~~
> ~~The conformance model has been updated, there are several questions in the conformance section~~
> ~~As part of the WCAG 3 drafting process, each normative section of this document is given a status. This status is used to indicate how far along in the development this section is, how ready it is for experimental adoption, and what kind of feedback the Accessibility Guidelines Working Group is looking for.~~
> ~~Content that conforms to WCAG 2.2 Level A and Level AA is expected to meet most of the minimum conformance level of this new standard but, since WCAG 3 includes additional tests and different scoring mechanics, additional work will be needed to reach full conformance. Since the new standard will use a different conformance model, the Accessibility Guidelines Working Group expects that some organizations may wish to continue using WCAG 2, while others may wish to migrate to the new standard. For those that wish to migrate to WCAG 3, the Working Group will provide transition support materials, which may use mapping and other approaches to facilitate migration.~~
> ~~The individuals and organizations that use WCAG vary widely and include web designers and developers, policy makers, purchasing agents, teachers, and students. To meet the varying needs of this audience, several layers of guidance will be provided including guidelines written as outcome statements, requirements that can be tested, assertions, a rich collection of methods, resource links, and code samples.~~
> ~~Editor's notes indicate the requirements within this list where the Working Group has not found enough research to fully validate the guidance and create methods to support it or additional work is needed to evaluate existing research. If you know of existing research or if you are interested in conducting research in this area, please file a GitHub issue or send email to public-agwg-comments@w3.org ( comment archive ).~~
> ~~To make a formal conformance claim, you must use the process described in this document. Conformance claims are not required. Your content can conform to WCAG 3, even if you don't want to make a claim.~~
> ~~The guidelines use three kinds of provisions that set out what must be done:~~
> ~~Assertions: Things that you can say you did or do to improve the accessibility of your content or product~~
> ~~In addition, WCAG 3 provides Best Practices. These provide important guidance that often save time and improve accessibility but may not always apply in every situation.~~
> ~~The methods you use to satisfy WCAG 3 must be accessibility supported . This means a method only counts toward conformance if browsers and assistive technologies in general use support it. WCAG 3 uses defined accessibility-support sets to identify which technologies are tested against to check whether the methods used meet a requirement. The initial accessibility-support set in WCAG 3 is for HTML methods.~~

### Requirements for WCAG 3.0

- `21f5c05` 2026-08-26 — Add explicit darkmode support to account for ReSpec 37.3.3+ [#825](https://github.com/w3c/wcag3/pull/825)
- `5b22a58` 2026-08-28 — Preparation for Aug 2026 publication

**New or rewritten prose** (1 lines; first 1):

> Additional information about participation in the Accessibility Guidelines Working Group (AGWG) can be found on the Working Group home page .

**Dropped prose** (1 lines; first 1):

> ~~Additional information about participation in the Accessibility Guidelines Working Group (AG WG) can be found on the Working Group home page .~~

### Explainer

- `21f5c05` 2026-08-26 — Add explicit darkmode support to account for ReSpec 37.3.3+ [#825](https://github.com/w3c/wcag3/pull/825)
- `1165a15` 2026-08-27 — Explainer - conformance [#833](https://github.com/w3c/wcag3/pull/833)
- `5b22a58` 2026-08-28 — Preparation for Aug 2026 publication
- `9fe0b11` 2026-09-03 — Rename best practice to recommended practice everywhere [#839](https://github.com/w3c/wcag3/pull/839)
- `ab2183f` 2026-09-07 — Editorial changes from 842 and 843 [#846](https://github.com/w3c/wcag3/pull/846)
- `7023637` 2026-09-07 — spelling fixes and changes so all instances of tiers align [#849](https://github.com/w3c/wcag3/pull/849)

**New or rewritten prose** (81 lines; first 25):

> The Explainer for WCAG 3 accompanies the draft of [[[?WCAG3]]]. This document provides an overview of the history and goals of WCAG 3. It also describes the current thinking on the structure of the guidelines and the conformance model. The guidelines, conformance model, and related work are still evolving.
> For more details about this work and links to WCAG technical and educational material, see WCAG 3 Introduction .
> To comment, file an issue in the W3C wcag3 GitHub repository . The Working Group requests that public comments be filed as new issues, one issue per discrete comment. It is free to create a GitHub account to file issues. If filing issues in GitHub is not feasible, email public-agwg-comments@w3.org ( comment archive ).
> In-progress updates to the guidelines can be viewed in the public editors’ draft .
> The structure, guidelines, and conformance model are still in draft. The Accessibility Guidelines (AG) Working Group welcomes public comments on the proposed approach.
> range of stakeholder groups. Part of our upcoming work will explore ways to broaden support
> whether there are ways the AG Working Group can better support your review, feedback, or inclusion within
> The following are out of scope for WCAG 3:
> early design work carry that project name. The Silver Task Force of the AG Working
> Group and the W3C Silver Community group partnered to produce the needs, requirements, and structure
> for the new accessibility guidance. They worked on Silver from 2017 to 2023. During that time they:
> The Accessibility Guidelines (AG) Working Group uses an iterative approach to creating WCAG 3. Each piece of content will evolve over time,
> increasing in maturity. As a result, the document is a work in progress.
> what kind of feedback the AG Working Group is looking for.
> The status indicators, from least to most mature, are as follows:
> Developing : This content has been roughly agreed on in terms of what is needed for this section, although not all high-level concerns have been settled. Details have been added, but are yet to be worked out. Feedback should be focused on ensuring the section is broadly usable and reasonable.
> The AG Working Group aims to publish two new drafts each year. Each draft will include targeted questions for the
> Details on each type of guidance are below.
> Guidelines are written as plain-language, user-centered outcomes statements.
> Guidelines include high-level, plain-language information for managers, policymakers, individuals who are
> Core Requirements will be required to meet conformance. This set of requirements will cover a similar, but not identical, set of needs as WCAG 2.2 Level AA.
> Supplemental Requirements will not be required to meet conformance, but testers or policymakers will be able to select
> specific technology, such as HTML, or can be technology-agnostic when the advice applies regardless of
> Assertions may be used, in addition to requirements, to support a guideline. Only assertions included in WCAG 3 can be used for conformance. Not all guidelines include assertions. Guidelines that include assertions list them with the requirements.
> The AG Working Group will consider whether assertions may be used to support guidelines when requirements are not available.

**Dropped prose** (74 lines; first 12):

> ~~The Explainer for WCAG 3 accompanies the draft of [[[?WCAG3]]]. It provides an overview of the history and goals of WCAG 3. This document also describes the current thinking on the structure of the guidelines and the conformance model. The guidelines, conformance model, and related work are still evolving.~~
> ~~See WCAG 3 Introduction for more details about this work and links to WCAG technical and educational material.~~
> ~~To comment, file an issue in the W3C wcag3 GitHub repository . The Working Group requests that public comments be filed as new issues, one issue per discrete comment. It is free to create a GitHub account to file issues. If filing issues in GitHub is not feasible, email public-agwg-comments@w3.org ( comment archive ). In-progress updates to the guidelines can be viewed in the public editors’ draft .~~
> ~~The structure, guidelines, and conformance model are still in draft. The Accessibility Guidelines Working Group welcomes public comments on the proposed approach.~~
> ~~range of stakeholder groups. Part of our upcoming focus is exploring using registries to broaden support~~
> ~~whether there are ways the Working Group can better support your review, feedback, or inclusion within~~
> ~~early design work carries that project name. The Silver Task Force of the Accessibility Guidelines Working~~
> ~~Group (AG) and the W3C Silver Community group partnered to produce the needs, requirements, and structure~~
> ~~for the new accessibility guidance. They worked on Silver from 2017-2023. During that time they:~~
> ~~The Accessibility Guidelines Working Group (AGWG) uses an iterative approach to creating WCAG 3. Each piece of content will evolve over time,~~
> ~~increasing in maturity. As a result, the document is a work-in-progress.~~
> ~~what kind of feedback AGWG is looking for.~~

## Provisions

### Added (36)

- **No Flashing Over Threshold No Exceptions** `animation-and-movement/avoid-physical-harm/no-flashing-over-threshold-no-exceptions` — `developing` / `supplemental` — [#628](https://github.com/w3c/wcag3/pull/628), `d95aeb8`
  > :term[Flashes] are below the :term[general flash and red flash thresholds] without a minimum size.
- **No Flashing Over Threshold** `animation-and-movement/avoid-physical-harm/no-flashing-over-threshold` — `developing` / `foundational` — [#628](https://github.com/w3c/wcag3/pull/628), `d95aeb8`
  > :term[Flashes] are below the :term[general flash and red flash thresholds].
- **Single Flash** `animation-and-movement/avoid-physical-harm/single-flash` — `exploratory` / `foundational` — [#628](https://github.com/w3c/wcag3/pull/628)
  > Content does not include a change of contrast (over 4.5:1) going from light to dark (or dark to light) of more than 30% of the visible content area (viewport).
- **Accessible Audio Player Selected** `images-and-media/accessible-media-player/accessible-audio-player-selected` — `developing` / `assertion` — `56c3e7f`, `5b22a58`
  > [Title, role, or organization] asserts that:
- **Accessible Video Player Selected** `images-and-media/accessible-media-player/accessible-video-player-selected` — `developing` / `assertion` — `56c3e7f`, `5b22a58`
  > [Title, role, or organization] asserts that:
- **Audio Descriptions Controllable** `images-and-media/audio-descriptions/audio-descriptions-controllable` — `developing` / `supplemental` — `56c3e7f`
  > A :term[mechanism] is available to turn :term[audio descriptions] on and off.
- **Audio Descriptions Equivalent Prerecorded** `images-and-media/audio-descriptions/audio-descriptions-equivalent-prerecorded` — `developing` / `foundational` — `56c3e7f`, [#821](https://github.com/w3c/wcag3/pull/821)
  > The information conveyed by :term[audio descriptions] is equivalent to the visual :term[content] needed to understand the media.
- **Audio Descriptions Reviewed By Content Authors** `images-and-media/audio-descriptions/audio-descriptions-reviewed-by-content-authors` — `developing` / `assertion` — `56c3e7f`, `5b22a58`, `d95aeb8`
  > [Title, role, or organization] asserts that:
- **Audio Descriptions Style Guide** `images-and-media/audio-descriptions/audio-descriptions-style-guide` — `developing` / `assertion` — `56c3e7f`, `5b22a58`, `d95aeb8`
  > [Title, role, or organization] asserts that:
- **Extended Audio Descriptions Equivalent** `images-and-media/audio-descriptions/extended-audio-descriptions-equivalent` — `developing` / `foundational` — `56c3e7f`, [#821](https://github.com/w3c/wcag3/pull/821)
  > The information conveyed by :term[extended audio descriptions] is equivalent to the visual :term[content] needed to understand the media.
- **Non Verbal Cues Identified In Audio Descriptions** `images-and-media/audio-descriptions/non-verbal-cues-identified-in-audio-descriptions` — `exploratory` / `foundational` — `56c3e7f`, `d95aeb8`, [#856](https://github.com/w3c/wcag3/pull/856)
  > Nonverbal cues needed to understand the media are explained in :term[audio descriptions].
- **Speaker Language Identified In Audio Descriptions** `images-and-media/audio-descriptions/speaker-language-identified-in-audio-descriptions` — `developing` / `supplemental` — `56c3e7f`, `d95aeb8`, [#856](https://github.com/w3c/wcag3/pull/856)
  > When more than one language is spoken in :term[audio] :term[content], the language spoken by each speaker is identified in all :term[audio descriptions].
- **Visual Information Identified In Audio Descriptions** `images-and-media/audio-descriptions/visual-information-identified-in-audio-descriptions` — `developing` / `foundational` — `56c3e7f`, `d95aeb8`, [#856](https://github.com/w3c/wcag3/pull/856)
  > Visual information needed to understand the media is described in :term[audio descriptions].
- **Caption Language Adjustable** `images-and-media/captions/caption-language-adjustable` — `developing` / `supplemental` — `56c3e7f`
  > A :term[mechanism] is available that allows users to change the :term[caption] language if multiple languages are available.
- **Captions Equivalent Prerecorded** `images-and-media/captions/captions-equivalent-prerecorded` — `developing` / `foundational` — `56c3e7f`, [#821](https://github.com/w3c/wcag3/pull/821), `d95aeb8`
  > Equivalent :term[captions] are available for :term[audio] and :term[video] content.
- **Captions Reviewed By Content Authors** `images-and-media/captions/captions-reviewed-by-content-authors` — `developing` / `assertion` — `56c3e7f`, `5b22a58`, `d95aeb8`
  > [Title, role, or organization] asserts that:
- **Captions Style Guide** `images-and-media/captions/captions-style-guide` — `developing` / `assertion` — `56c3e7f`, `5b22a58`, `d95aeb8`
  > [Title, role, or organization] asserts that:
- **Captions Usability Testing** `images-and-media/captions/captions-usability-testing` — `developing` / `assertion` — `56c3e7f`, `5b22a58`, `d95aeb8`
  > [Title, role, or organization] asserts that:
- **Sounds Identified In Captions** `images-and-media/captions/sounds-identified-in-captions` — `developing` / `foundational` — `56c3e7f`, `d95aeb8`
  > Sounds needed to understand the media are identified or described in :term[captions].
- **Speakers Identified In Captions** `images-and-media/captions/speakers-identified-in-captions` — `developing` / `supplemental` — `56c3e7f`, `d95aeb8`
  > Speakers are identified understandably within all :term[captions].
- **Image Alternatives Equivalent** `images-and-media/image-alternatives/image-alternatives-equivalent` — `developing` / `foundational` — `56c3e7f`, `d95aeb8`
  > :term[Text alternatives] for non-:term[decorative] images convey the equivalent purpose to the image.
- **Sign Language Available Prerecorded** `images-and-media/sign-language/sign-language-available-prerecorded` — `developing` / `supplemental` — [#673](https://github.com/w3c/wcag3/pull/673), [#796](https://github.com/w3c/wcag3/pull/796), `5b22a58`
  > :term[Sign language interpretation] is provided for all prerecorded :term[audio] content in the primary sign language that is most appropriate for each intended audience or region.
- **Sign Language Controllable** `images-and-media/sign-language/sign-language-controllable` — `developing` / `supplemental` — [#673](https://github.com/w3c/wcag3/pull/673)
  > A :term[mechanism] is available to show and hide :term[sign language interpretation].
- **Sign Language Policy Live** `images-and-media/sign-language/sign-language-policy-live` — `developing` / `assertion` — [#673](https://github.com/w3c/wcag3/pull/673), `5b22a58`, `d95aeb8`
  > [Title, role, or organization] asserts that: 
- **Descriptive Transcripts Available** `images-and-media/transcripts/descriptive-transcripts-available` — `developing` / `foundational` — `56c3e7f`, `5b22a58`
  > :term[Descriptive transcripts] are provided for prerecorded :term[audio] and :term[video] :term[content].
- **Dialogue Transcripts Available Live** `images-and-media/transcripts/dialogue-transcripts-available-live` — `developing` / `foundational` — [#821](https://github.com/w3c/wcag3/pull/821)
  > :term[Dialogue transcripts] are available for all live :term[audio] and :term[video] :term[content].
- **Dialogue Transcripts Available Prerecorded** `images-and-media/transcripts/dialogue-transcripts-available-prerecorded` — `developing` / `foundational` — [#821](https://github.com/w3c/wcag3/pull/821), `d95aeb8`
  > :term[Dialogue transcripts] are available for all prerecorded :term[audio] and :term[video] :term[content].
- **Non Verbal Cues Identified In Transcripts** `images-and-media/transcripts/non-verbal-cues-identified-in-transcripts` — `exploratory` / `foundational` — `56c3e7f`, `d95aeb8`
  > Nonverbal cues needed to understand the media are explained in :term[transcripts].
- **Sounds Identified In Transcripts** `images-and-media/transcripts/sounds-identified-in-transcripts` — `developing` / `foundational` — `56c3e7f`, `d95aeb8`
  > Sounds needed to understand the media are identified or described in :term[transcripts].
- **Speaker Language Identified In Transcripts** `images-and-media/transcripts/speaker-language-identified-in-transcripts` — `developing` / `supplemental` — `56c3e7f`, `d95aeb8`
  > When more than one language is spoken in :term[audio] :term[content], the language spoken by each speaker is identified in all :term[transcripts].
- **Speakers Identified In Transcripts** `images-and-media/transcripts/speakers-identified-in-transcripts` — `developing` / `supplemental` — `56c3e7f`, `d95aeb8`
  > Speakers are identified understandably within all :term[transcripts].
- **Transcripts Equivalent Prerecorded** `images-and-media/transcripts/transcripts-equivalent-prerecorded` — `developing` / `foundational` — `56c3e7f`, [#821](https://github.com/w3c/wcag3/pull/821), `d95aeb8`
  > Equivalent :term[transcripts] are available for :term[audio] and :term[video] content.
- **Transcripts Findable** `images-and-media/transcripts/transcripts-findable` — `developing` / `foundational` — `56c3e7f`, [#821](https://github.com/w3c/wcag3/pull/821), `d95aeb8`
  > A text :term[transcript] is adjacent to :term[audio] and :term[video] :term[content].
- **Transcripts Reviewed By Content Authors** `images-and-media/transcripts/transcripts-reviewed-by-content-authors` — `developing` / `assertion` — `56c3e7f`, `5b22a58`, `d95aeb8`
  > [Title, role, or organization] asserts that:
- **Transcripts Style Guide** `images-and-media/transcripts/transcripts-style-guide` — `developing` / `assertion` — `56c3e7f`, `5b22a58`, `d95aeb8`
  > [Title, role, or organization] asserts that:
- **Transcripts Usability Testing** `images-and-media/transcripts/transcripts-usability-testing` — `developing` / `assertion` — `56c3e7f`, `5b22a58`, `d95aeb8`
  > [Title, role, or organization] asserts that:

### Removed (10)

- **No Flashing No Exceptions** `animation-and-movement/avoid-physical-harm/no-flashing-no-exceptions` — [#628](https://github.com/w3c/wcag3/pull/628)
  > ~~:term[Content] does not include :term[flashing].~~
- **No Flashing** `animation-and-movement/avoid-physical-harm/no-flashing` — [#628](https://github.com/w3c/wcag3/pull/628)
  > ~~:term[Content] does not include :term[flashing].~~
- **Accessible Video Player Selected** `images-and-media/media-alternatives/accessible-video-player-selected` — `56c3e7f`
  > ~~[Title, role, or organization] asserts that:~~
- **Media Alternatives Equivalent** `images-and-media/media-alternatives/media-alternatives-equivalent` — [#796](https://github.com/w3c/wcag3/pull/796), `56c3e7f`
  > ~~:term[Equivalent] :term[media alternatives] are :term[available] for :term[audio] and :term[video] content.~~
- **Media Alternatives Findable** `images-and-media/media-alternatives/media-alternatives-findable` — [#796](https://github.com/w3c/wcag3/pull/796), `56c3e7f`
  > ~~A :term[mechanism] is :term[available] within the page/view to access the :term[media alternatives] for audio and video.~~
- **Media Alternatives Style Guide** `images-and-media/media-alternatives/media-alternatives-style-guide` — —
  > ~~[Title, role, or organization] asserts that:~~
- **Reviewed By Content Authors** `images-and-media/media-alternatives/reviewed-by-content-authors` — —
  > ~~[Title, role, or organization] asserts that:~~
- **Sign Language Available Live** `images-and-media/media-alternatives/sign-language-available-live` — [#673](https://github.com/w3c/wcag3/pull/673)
  > ~~[Title, role, or organization] asserts that:~~
- **Sign Language Available Prerecorded** `images-and-media/media-alternatives/sign-language-available-prerecorded` — [#673](https://github.com/w3c/wcag3/pull/673)
  > ~~:term[Sign language interpretation] is provided for all :term[prerecorded] :term[audio] content in the primary sign language of the intended audience or region.~~
- **Transcripts Available** `images-and-media/media-alternatives/transcripts-available` — [#796](https://github.com/w3c/wcag3/pull/796), `56c3e7f`
  > ~~:term[Transcripts] are :term[available] for all :term[audio] and :term[video] :term[content].~~

### Renamed / moved (7)

- `images-and-media/media-alternatives/media-alternatives-usability-testing.md` → `images-and-media/audio-descriptions/audio-descriptions-usability-testing.md` — `56c3e7f`, `5b22a58`, `d95aeb8`
  - **text also changed:**
    - was: [Title, role, or organization] asserts that:
    - now: [Title, role, or organization] asserts that:
- `images-and-media/media-alternatives/sounds-identified.md` → `images-and-media/audio-descriptions/sounds-identified-in-audio-descriptions.md` — `56c3e7f`, `d95aeb8`
- `images-and-media/media-alternatives/speakers-identified.md` → `images-and-media/audio-descriptions/speakers-identified-in-audio-descriptions.md` — `56c3e7f`, `d95aeb8`
  - **text also changed:**
    - was: Speakers are identified understandably within all :term[media alternatives].
    - now: Speakers are identified understandably within all :term[audio descriptions].
- `images-and-media/media-alternatives/non-verbal-cues-identified.md` → `images-and-media/captions/non-verbal-cues-identified-in-captions.md` — `56c3e7f`, `d95aeb8`
  - **text also changed:**
    - was: Nonverbal cues needed to understand the media are explained in :term[media alternatives].
    - now: Nonverbal cues needed to understand the media are explained in :term[captions].
- `images-and-media/media-alternatives/speaker-language-identified.md` → `images-and-media/captions/speaker-language-identified-in-captions.md` — `56c3e7f`, `d95aeb8`
  - **text also changed:**
    - was: When more than one language is spoken in :term[audio] :term[content], the language spoken by each speaker is identified in all :term[media alternatives].
    - now: When more than one language is spoken in :term[audio] :term[content], the language spoken by each speaker is identified in all :term[captions].
- `images-and-media/media-alternatives/visual-information-identified.md` → `images-and-media/transcripts/visual-information-identified-in-transcripts.md` — `56c3e7f`, `d95aeb8`
  - **text also changed:**
    - was: Visual information needed to understand the media is described in the :term[transcript] and :term[audio description].
    - now: Visual information needed to understand the media is described in :term[transcripts].
- `input-operation/physical-or-cognitive-effort-when-using-keyboard/no-repetitive-links.md` → `input-operation/physical-or-cognitive-effort-when-using-keyboard/no-repetitive-adjacent-interactive-elements.md` — [#602](https://github.com/w3c/wcag3/pull/602), `d95aeb8`
  - **text also changed:**
    - was: Repetitive adjacent links that have the same destination are avoided.
    - now: Adjacent :term[interactive elements] that achieve the same outcome are not included in the :term[page]/:term[view].

### Status / type changes (1)

- **Return To Start Prominent** `layout/user-orientation/return-to-start-prominent` — type `best practice` → `recommended practice` — `5b22a58`, [#839](https://github.com/w3c/wcag3/pull/839)

### Normative wording changes (23)

Wording that changed in substance, after normalizing away `:term[]` markup and punctuation.

- **Consistent Navigation Labels** `consistency-across-views/consistency/consistent-navigation-labels` — `5b22a58`
  - − The labelling of navigation items within blocks of navigation that are repeated on multiple pages/views in the :term[conformance scope] or process is consistent.
  - + The labeling of navigation items within blocks of navigation that are repeated on multiple pages/views in the :term[conformance scope] or :term[process] is consistent.
- **Error Prevention Review** `error-handling/prevent-errors/error-prevention-review` — `5b22a58`
  - − * automatically correct input errors when possible and reliable, and
  - + * Automatically correct input errors when possible and reliable.
- **Errors Preventable** `error-handling/prevent-errors/errors-preventable` — `5b22a58`
  - − * Review, confirm, and correct all information; or
  - + * Review, confirm, and correct all information.
- **Sensory Characteristics Not Relied On** `help-and-feedback/help-available/sensory-characteristics-not-relied-on` — `5b22a58`
  - − Instructions and help do not rely on sensory characteristics such as shape, color, size, visual location, orientation, or sound.
  - + Instructions and help do not rely on sensory characteristics.
- **Image Alternatives Available** `images-and-media/image-alternatives/image-alternatives-available` — `56c3e7f`
  - − :term[Equivalent] :term[text alternatives] are :term[available] for images that convey :term[content].
  - + :term[Text alternatives] are available for non-:term[decorative] images.
- **Image Alternatives Style Guide** `images-and-media/image-alternatives/image-alternatives-style-guide` — `5b22a58`
  - − * Section labels relevant to image alternatives, or
  - + * section labels relevant to image alternatives
- **Image Types Identified** `images-and-media/image-alternatives/image-types-identified` — [#796](https://github.com/w3c/wcag3/pull/796), `5b22a58`
  - − The :term[image types] (photo, illustration, chart, etc.) are indicated.
  - + The :term[image types] are indicated.
- **Non Text Content Not Relied On** `images-and-media/non-text-alternatives/non-text-content-not-relied-on` — [#849](https://github.com/w3c/wcag3/pull/849)
  - − All :term[non-text content] that is not decorative includes a programmatically determinable equivalent text alternatives.
  - + All :term[non-text content] that is not decorative includes a programmatically determinable equivalent text alternative.
- **Body Movements Not Relied On** `input-operation/input-operation/body-movements-not-relied-on` — `5b22a58`
  - − **Except where**
  - − - Full or gross body movement is :term[essential] to the functionality.
- **Keyboard Effort Comparable** `input-operation/physical-or-cognitive-effort-when-using-keyboard/keyboard-effort-comparable` — `5b22a58`
  - − - A copy of the user interface design principles document.
  - + - copy of the user interface design principles document
- **Changes To Elements Notified** `interactive-components/control-information/changes-to-elements-notified` — [#795](https://github.com/w3c/wcag3/pull/795), `5b22a58`
  - − Changes to :term[interactive elements]' names, roles, values or states are visually and :term[programmatically indicated].
  - + Changes to :term[interactive element] names, roles, values, or :term[states] are visually and :term[programmatically] indicated.
  - 2.2 touchpoints: 1.4.13 (AA), 3.3.1 (A), 4.1.3 (AA)
- **Input Constraints Used** `interactive-components/control-information/input-constraints-used` — [#795](https://github.com/w3c/wcag3/pull/795), `5b22a58`
  - − Field constraints and conditions (required line length, date format, password format, etc.) are available.
  - + Field constraints and conditions are available.
  - 2.2 touchpoints: 3.3.1 (A), 3.3.2 (A)
- **Focus Indicator Style Guide** `interactive-components/keyboard-focus-appearance/focus-indicator-style-guide` — `5b22a58`
  - − - A copy of the design style guide (if any) where focus style has been defined.
  - + - copy of the design style guide (if any) where focus style has been defined
- **Conventional Layout Review** `layout/recognizable-layouts/conventional-layout-review` — `5b22a58`
  - − * If a non-convention layout is used, usability testing results that demonstrate the utility of the approach taken.
  - + * if a non-conventional layout is used, usability testing results that demonstrate the utility of the approach taken
- **Clear Structure Review** `layout/structure/clear-structure-review` — `5b22a58`
  - − * icons are considered as possible ways to help users understand the content structure and identify key parts, and
  - − * A copy of the style guide (if any) where clear structure review has been defined.
  - + * icons are considered as possible ways to help users understand the content structure and identify key parts
  - + * copy of the style guide (if any) where clear structure review has been defined
- **Location Within Product Review** `layout/user-orientation/location-within-product-review` — `5b22a58`
  - − * If a non-convention design pattern is used, usability testing results that demonstrate the utility of the design approach taken.
  - + * if a non-conventional design pattern is used, usability testing results that demonstrate the utility of the design approach taken
- **Risk Comparable** `policy-and-protection/risk/risk-comparable` — `5b22a58`
  - − Use of assistive technology, accessible alternative versions, accessibility-related modifications of digital content, and accessibility-related settings do not expose people with disabilities to additional risk.
  - + Use of :term[assistive technology], accessible alternative versions, accessibility-related modifications of :term[content], and accessibility-related settings do not expose people with disabilities to additional risk.
- **Deceptive Practices Usability Testing** `process-and-task-completion/avoid-deception/deceptive-practices-usability-testing` — `5b22a58`
  - − * Maintain records of usability testing protocol, and results,
  - + * maintained records of usability testing protocol, and results
- **Messaging Expert Review** `process-and-task-completion/avoid-deception/messaging-expert-review` — `5b22a58`
  - − * Maintain records of deceptive practices found, and resolutions.
  - + * maintained records of deceptive practices found, and resolutions
- **Cognitive Test Alternatives Available** `process-and-task-completion/avoid-exclusionary-cognitive-tasks/cognitive-test-alternatives-available` — `5b22a58`
  - − :term[Processes], including authentication, can be completed without a :term[cognitive function test].
  - + :term[Processes] can be completed without a :term[cognitive function test].
  - 2.2 touchpoints: 3.3.8 (AA), 3.3.9 (AAA)
- **Usability Testing For Unnecessary Steps** `process-and-task-completion/unnecessary-steps/usability-testing-for-unnecessary-steps` — `5b22a58`
  - − * Maintain records of usability testing protocol, scope of the testing, and results.
  - + * maintained records of usability testing protocol, scope of the testing, and results
- **Virtual Cursor Supported** `user-control/assistive-technology-control/virtual-cursor-supported` — `5b22a58`, [#849](https://github.com/w3c/wcag3/pull/849)
  - − Assistive technologies can access :term[content] and interactions when using :term[mechanisms] that convey alternative :term[points of regard] or focus (i.e. virtual cursor).
  - + :term[Assistive technologies] can access :term[content] and interactions when using :term[mechanisms] that convey alternative :term[points of regard] or focus.
- **Page View Audio Adjustable** `user-control/media-control/page-view-audio-adjustable` — `5b22a58`
  - − There are mechanisms to pause, stop, and adjust the volume independently of the overall system volume level, of any automatically playing :term[audio] in a page / view.
  - + A :term[mechanism] is available to pause, stop, and adjust the volume independently of the overall system volume level, of any automatically playing :term[audio] in a :term[page]/:term[view].
  - 2.2 touchpoints: 1.4.2 (A)

### Editorial-only changes (53)

`:term[]` markup, punctuation or whitespace only — meaning unchanged. Listed so a
re-sync of the raw bodies stays traceable; none of these need a plain-English rewrite.

`safe-content-review`, `consistent-navigation-order`, `errors-indicated-in-multiple-ways`, `data-entry-validated`, `consistent-help-available`, `disabled-controls-explained`, `help-usability-testing`, `new-interfaces`, `supported-decision-making-review`, `hover-or-focus-content-dismissible`, `input-method-flexible`, `consistent-pointer-cancellation`, `pointer-activation-controllable`, `simple-pointer-input-available`, `generated-speech-testing`, `interactive-element-contrast-sufficient`, `interactive-element-names-available`, `consistent-interactions`, `conventional-pattern-used`, `infinite-scrolling-controllable`, `overlay-content-dismissible`, `blocks-of-content-available-minimum`, `key-information-usability-testing`, `order-detectable`, `relationships-detectable`, `all-steps-listed`, `current-step-indicated`, `page-view-change-notified`, `page-view-title-available`, `return-to-start-prominent`, `algorithm-inclusivity-review`, `diverse-disabilities-considered`, `no-unnecessary-time-limits`, `time-limits-conveyed`, `timeout-adjustable`, `no-artificial-time-limits`, `preselections-visible`, `copying-supported`, `clear-language-review`, `visual-aids-review`, `blocks-of-text-adjustable`, `blocks-of-text-readable-enhanced`, `blocks-of-text-readable-minimum`, `text-style-adjustable`, `text-style-readable-enhanced`, `text-style-readable-minimum`, `layout-reflow-supported`, `orientation-supported-enhanced`, `orientation-supported-minimum`, `notifications-adjustable`, `change-of-content-notified`, `change-of-focus-notified`, `change-of-user-agent-notified`

### Supporting-block edits only (58)

Normative sentence unchanged; `applies-when` / `except-when` / `ednote` / `example` blocks edited.

- **Audio Shifting Adjustable** `animation-and-movement/avoid-physical-harm/audio-shifting-adjustable` — blocks: `ednote` — [#795](https://github.com/w3c/wcag3/pull/795)
- **Haptic Stimulation Adjustable** `animation-and-movement/avoid-physical-harm/haptic-stimulation-adjustable` — blocks: `ednote` — [#795](https://github.com/w3c/wcag3/pull/795)
- **No Visual Motion No Exceptions** `animation-and-movement/avoid-physical-harm/no-visual-motion-no-exceptions` — blocks: `ednote` — `5b22a58`
- **No Visual Motion** `animation-and-movement/avoid-physical-harm/no-visual-motion` — blocks: `ednote` — `5b22a58`
- **Trigger Warning Available** `animation-and-movement/avoid-physical-harm/trigger-warning-available` — blocks: `applies-when`, `note`, `ednote` — [#795](https://github.com/w3c/wcag3/pull/795), [#796](https://github.com/w3c/wcag3/pull/796)
- **Consistent Structural Order** `consistency-across-views/consistency/consistent-structural-order` — blocks: `applies-when` — [#796](https://github.com/w3c/wcag3/pull/796)
- **Error Messages Persistent** `error-handling/correct-errors/error-messages-persistent` — blocks: `ednote` — [#795](https://github.com/w3c/wcag3/pull/795)
- **Error Notifications Available** `error-handling/correct-errors/error-notifications-available` — blocks: `example` — `5b22a58`
- **Errors Associated** `error-handling/correct-errors/errors-associated` — blocks: `example` — `5b22a58`
- **Support Available** `help-and-feedback/help-available/support-available` — blocks: `except-when`, `example` — `5b22a58`
- **Audio Descriptions Available Prerecorded** `images-and-media/audio-descriptions/audio-descriptions-available-prerecorded` — blocks: `ednote`, `except-when` — `5b22a58`
- **Captions Available Prerecorded** `images-and-media/captions/captions-available-prerecorded` — blocks: `except-when` — `5b22a58`
- **Captions Controllable** `images-and-media/captions/captions-controllable` — blocks: `except-when` — [#796](https://github.com/w3c/wcag3/pull/796)
- **Hue Not Relied On** `images-and-media/single-sense/hue-not-relied-on` — blocks: `note` — `5b22a58`
- **Sound Not Relied On** `images-and-media/single-sense/sound-not-relied-on` — blocks: `note` — `5b22a58`
- **Spatial Audio Not Relied On** `images-and-media/single-sense/spatial-audio-not-relied-on` — blocks: `note` — `5b22a58`, [#849](https://github.com/w3c/wcag3/pull/849)
- **Biometrics Not Relied On** `input-operation/authentication/biometrics-not-relied-on` — blocks: `note` — [#795](https://github.com/w3c/wcag3/pull/795)
- **Multiple Biometrics Available** `input-operation/authentication/multiple-biometrics-available` — blocks: `ednote` — [#795](https://github.com/w3c/wcag3/pull/795)
- **Eye Tracking Not Relied On** `input-operation/input-operation/eye-tracking-not-relied-on` — blocks: `note` — `5b22a58`
- **Hover Content Persistent** `input-operation/input-operation/hover-content-persistent` — blocks: `example` — `5b22a58`
- **Hover Or Focus Content Persistent** `input-operation/input-operation/hover-or-focus-content-persistent` — blocks: `example` — `5b22a58`
- **Bidirectional Navigation** `input-operation/keyboard-interface-input/bidirectional-navigation` — blocks: `note` — [#795](https://github.com/w3c/wcag3/pull/795), [#839](https://github.com/w3c/wcag3/pull/839)
- **Focus Placed** `input-operation/keyboard-interface-input/focus-placed` — blocks: `ednote` — [#795](https://github.com/w3c/wcag3/pull/795)
- **Keyboard Accessible** `input-operation/keyboard-interface-input/keyboard-accessible` — blocks: `note` — `5b22a58`
- **No Keyboard Traps** `input-operation/keyboard-interface-input/no-keyboard-traps` — blocks: `except-when`, `example` — [#796](https://github.com/w3c/wcag3/pull/796), `5b22a58`, [#837](https://github.com/w3c/wcag3/pull/837)
- **Pointer Pressure Not Relied On** `input-operation/pointer-input/pointer-pressure-not-relied-on` — blocks: `note` — [#795](https://github.com/w3c/wcag3/pull/795)
- **Real Time Text Available** `input-operation/speech-and-voice-input/real-time-text-available` — blocks: `ednote` — [#795](https://github.com/w3c/wcag3/pull/795)
- **Speech Not Relied On** `input-operation/speech-and-voice-input/speech-not-relied-on` — blocks: `ednote` — [#795](https://github.com/w3c/wcag3/pull/795)
- **Interactive Elements Distinguishable** `interactive-components/control-information/interactive-elements-distinguishable` — blocks: `note` — [#795](https://github.com/w3c/wcag3/pull/795)
- **Label Included In Programmatic Name** `interactive-components/control-information/label-included-in-programmatic-name` — blocks: `ednote` — [#795](https://github.com/w3c/wcag3/pull/795)
- **Roles Values States Properties Available** `interactive-components/control-information/roles-values-states-properties-available` — blocks: `ednote` — [#795](https://github.com/w3c/wcag3/pull/795)
- **Consistent Control Location** `interactive-components/expected-behavior/consistent-control-location` — blocks: `except-when`, `ednote`, `example` — [#795](https://github.com/w3c/wcag3/pull/795), `5b22a58`
- **Focus Indicator Contrast Sufficient** `interactive-components/keyboard-focus-appearance/focus-indicator-contrast-sufficient` — blocks: `applies-when` — `5b22a58`
- **Focus Indicator Size Sufficient** `interactive-components/keyboard-focus-appearance/focus-indicator-size-sufficient` — blocks: `applies-when` — `5b22a58`
- **Focus Order Meaningful** `interactive-components/navigating-content/focus-order-meaningful` — blocks: `note` — `5b22a58`
- **Default Pointer Used** `interactive-components/pointer-focus-appearance/default-pointer-used` — blocks: `ednote` — [#795](https://github.com/w3c/wcag3/pull/795)
- **Enhanced Pointer Available** `interactive-components/pointer-focus-appearance/enhanced-pointer-available` — blocks: `note` — [#795](https://github.com/w3c/wcag3/pull/795)
- **Pointer Activation Indicated Enhanced** `interactive-components/pointer-focus-appearance/pointer-activation-indicated-enhanced` — blocks: `note` — `5b22a58`
- **Pointer Contrast Sufficient** `interactive-components/pointer-focus-appearance/pointer-contrast-sufficient` — blocks: `note` — `5b22a58`
- **Pointer Focus Indicated** `interactive-components/pointer-focus-appearance/pointer-focus-indicated` — blocks: `note` — [#795](https://github.com/w3c/wcag3/pull/795)
- **Pointer Visible** `interactive-components/pointer-focus-appearance/pointer-visible` — blocks: `note` — [#795](https://github.com/w3c/wcag3/pull/795)
- **No Time Limits** `process-and-task-completion/adequate-time/no-time-limits` — blocks: `except-when`, `example` — `5b22a58`
- **Automated Entry Allowed** `process-and-task-completion/avoid-exclusionary-cognitive-tasks/automated-entry-allowed` — blocks: `note` — `5b22a58`
- **Required Action Available** `process-and-task-completion/complete-tasks/required-action-available` — blocks: `applies-when`, `example` — `5b22a58`
- **No Redundant Entry** `process-and-task-completion/retain-information/no-redundant-entry` — blocks: `except-when` — `5b22a58`
- **Progress Saved** `process-and-task-completion/retain-information/progress-saved` — blocks: `except-when`, `example` — `5b22a58`
- **Abbreviations Explained** `text-and-wording/clear-language/abbreviations-explained` — blocks: `except-when`, `example` — [#796](https://github.com/w3c/wcag3/pull/796), `5b22a58`
- **Common Words Used** `text-and-wording/clear-language/common-words-used` — blocks: `applies-when`, `note` — [#796](https://github.com/w3c/wcag3/pull/796), `5b22a58`
- **No Nested Clauses** `text-and-wording/clear-language/no-nested-clauses` — blocks: `example` — `5b22a58`
- **No Unnecessary Words** `text-and-wording/clear-language/no-unnecessary-words` — blocks: `except-when` — `5b22a58`
- **Numerical Alternatives Available** `text-and-wording/clear-language/numerical-alternatives-available` — blocks: `example` — `5b22a58`
- **Text Color Adjustable** `text-and-wording/text-appearance/text-color-adjustable` — blocks: `except-when` — [#796](https://github.com/w3c/wcag3/pull/796), `5b22a58`
- **Text Contrast Sufficient Enhanced** `text-and-wording/text-appearance/text-contrast-sufficient-enhanced` — blocks: `except-when` — [#796](https://github.com/w3c/wcag3/pull/796)
- **Text Contrast Sufficient Minimum** `text-and-wording/text-appearance/text-contrast-sufficient-minimum` — blocks: `except-when` — [#796](https://github.com/w3c/wcag3/pull/796), `5b22a58`
- **Human Language Detectable** `text-and-wording/text-to-speech/human-language-detectable` — blocks: `except-when` — `5b22a58`
- **Numerical Metadata Available** `text-and-wording/text-to-speech/numerical-metadata-available` — blocks: `example` — `5b22a58`, `d95aeb8`
- **Text Appearance Not Relied On** `text-and-wording/text-to-speech/text-appearance-not-relied-on` — blocks: `example` — `5b22a58`
- **Text Reflow Supported** `user-control/adjustable-viewport/text-reflow-supported` — blocks: `except-when`, `example` — `5b22a58`

## Structure (groups, guidelines, tags)

- **modified** `guidelines/groups/animation-and-movement/avoid-physical-harm.md` — [#628](https://github.com/w3c/wcag3/pull/628)
- **modified** `guidelines/groups/images-and-media.json` — [#673](https://github.com/w3c/wcag3/pull/673), `56c3e7f`
- **added** `guidelines/groups/images-and-media/accessible-media-player.md` — `56c3e7f`
- **modified** `guidelines/groups/images-and-media/audio-descriptions.md` — `56c3e7f`
- **modified** `guidelines/groups/images-and-media/captions.md` — `56c3e7f`
- **modified** `guidelines/groups/images-and-media/image-alternatives.md` — `56c3e7f`
- **removed** `guidelines/groups/images-and-media/media-alternatives.md` — [#673](https://github.com/w3c/wcag3/pull/673), `56c3e7f`
- **added** `guidelines/groups/images-and-media/sign-language.md` — [#673](https://github.com/w3c/wcag3/pull/673)
- **added** `guidelines/groups/images-and-media/transcripts.md` — `56c3e7f`, [#821](https://github.com/w3c/wcag3/pull/821)
- **modified** `guidelines/groups/input-operation/physical-or-cognitive-effort-when-using-keyboard.md` — [#602](https://github.com/w3c/wcag3/pull/602)
- **modified** `guidelines/groups/interactive-components/navigating-content.md` — `5b22a58`

## Glossary terms

Definition changes ripple into every provision that uses `:term[...]`.

- **modified** `assistive-technology` — `5b22a58`
  > hardware and/or software that acts as a :term[user agent], or along with a mainstream user agent, to provide functionality to meet the requirements of users with disabilities that go beyond those offered by mainstream us
- **removed** `available` — `56c3e7f`
  > present and, in the context of alternatives, sufficient to understand the content
- **modified** `cognitive-function-test` *(editorial)* — `5b22a58`
  > task that requires the user to remember, manipulate, or transcribe information
- **modified** `complex-pointer-input` *(editorial)* — `5b22a58`
  > any pointer input other than a :term[simple pointer input]
- **modified** `conformance-scope` — [#834](https://github.com/w3c/wcag3/pull/834), [#849](https://github.com/w3c/wcag3/pull/849)
  > A product, set of :term[Pages]/:term[Views], :term[content], functionality, or :term[components] selected to be part of a conformance claim. Where a View or Page is part of a :term[Process], all the Views or Pages in the
- **modified** `decorative` *(editorial)* — `5b22a58`
  > serving only an aesthetic purpose, providing no information, and having no functionality
- **modified** `descriptive-transcript` — `56c3e7f`, [#821](https://github.com/w3c/wcag3/pull/821)
  > A text-based document where the chronological sequence of audio and video information is matched in the text to the sequence of the original media object, combining dialogue and sound tracking with descriptions of meanin
- **added** `dialogue-transcript` — [#821](https://github.com/w3c/wcag3/pull/821)
  > A text-based alternative for time-based media that provides a readable sequence of spoken dialogue.
- **removed** `equivalent` — `56c3e7f`
  > equal, and, in the context of alternatives, includes or conveys the same information as the original.
- **modified** `essential-to-outcome` — `5b22a58`
  > always necessary to achieve the same result
- **modified** `general-flash-and-red-flash-thresholds` — `5b22a58`, [#849](https://github.com/w3c/wcag3/pull/849)
  > a :term[flash] or rapidly-changing image sequence is below the threshold (that is, content **passes**) if any of the following are true: 
- **modified** `guideline` — `5b22a58`, [#849](https://github.com/w3c/wcag3/pull/849)
  > high-level, plain-language outcome statements used to organize :term[requirements]
- **modified** `human-language` — [#673](https://github.com/w3c/wcag3/pull/673)
  > language that is spoken, written, or signed (through visual or tactile means) to communicate with humans
- **added** `interface-sound-effect` — [#673](https://github.com/w3c/wcag3/pull/673)
  > a sound that accompanies activation of an :term[interactive element] or a notification of a change
- **modified** `keyboard-interface` — [#793](https://github.com/w3c/wcag3/pull/793)
  > API (Application Programming Interface) where software gets "keystrokes" from
- **removed** `live` — `5b22a58`
  > information captured from a real-world event and transmitted to the receiver with no more than a broadcast delay
- **modified** `meaningful-blocks-of-content` — `5b22a58`
  > Group of related :term[content] that represents a distinct topic or function, intended to be perceived as a single unit and capable of being programmatically identified and labeled.
- **modified** `platform` — `5b22a58`
  > software, or collection of layers of software, that lies below the subject software and provides services to the subject software and that allows the subject software to be isolated from the hardware, drivers, and other 
- **modified** `point-of-regard` — `5b22a58`
  > position in rendered :term[content] that the user is presumed to be viewing, of which the dimensions can vary
- **removed** `prerecorded` — [#673](https://github.com/w3c/wcag3/pull/673)
  > information that is not :term[live]
- **modified** `private-and-sensitive-information` *(editorial)* — `5b22a58`
  > private and sensitive information
- **modified** `programmatically-determinable` *(editorial)* — `5b22a58`
  > meaning of the content and all its important attributes can be determined by software functionality that is :term[accessibility supported]
- **added** `purely-decorative` — `56c3e7f`, `5b22a58`
  > non-text content that serves only an aesthetic purpose, provides no information, and has no functionality, such that it can be ignored by assistive technology without any loss of meaning or context
- **modified** `sign-language-interpretation` — [#673](https://github.com/w3c/wcag3/pull/673)
  > translation of one language, generally a spoken language, into a sign language
- **removed** `sign-language` — [#673](https://github.com/w3c/wcag3/pull/673)
  > a language using combinations of movements of the hands and arms, facial expressions, or body positions to convey meaning
- **modified** `simple-pointer-input` *(editorial)* — `5b22a58`
  > :term[single pointer input] event that involves only a single 'click' event or a :term[down]-:term[up] pair of events with no pointer movement required between, and no outcome difference based on length of time between :
- **modified** `user-manipulable-text` *(editorial)* — `5b22a58`
  > text which the user can adjust
- **modified** `view` — `5b22a58`
  > :term[content] that is :term[actively available] in a :term[viewport] including that which can be scrolled, zoomed, or panned to, and any additional content that is conditionally shown while leaving the rest of the conte
- **modified** `viewport` — `5b22a58`
  > object in which the :term[platform] presents content

## Informative materials (98 files)

- **act-rule**: 4 added, 1 removed, 0 renamed, 1 modified
- **recommended-practice**: 0 added, 1 removed, 0 renamed, 0 modified
- **informative-doc**: 35 added, 7 removed, 11 renamed, 37 modified
- **method**: 0 added, 1 removed, 0 renamed, 0 modified

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

### Broken references in `public/data/wcag22-catalog.json` (2)

Slugs referenced by `wcag3Mapping.provisions` that resolve to nothing upstream.

- `media-alternatives-available` → **no upstream target, needs a new one**  
  referenced by 1.2.1 Audio-only and Video-only (Prerecorded) (A), 1.2.2 Captions (Prerecorded) (A), 1.2.3 Audio Description or Media Alternative (Prerecorded) (A), 1.2.4 Captions (Live) (AA), 1.2.5 Audio Description (Prerecorded) (AA), 1.2.6 Audio-only (Live) (AAA), 1.2.7 Extended Audio Description (Prerecorded) (AAA), 1.2.8 Media Alternative (Prerecorded) (AAA), 1.2.9 Audio-only (Live) (AAA)
- `focus-indicator-visible` → **no upstream target, needs a new one**  
  referenced by 2.4.12 Focus Not Obscured (Minimum) (AA), 2.4.13 Focus Not Obscured (Enhanced) (AAA)

### References pointing at a guideline or group, not a provision (8)

These resolve upstream, but at a coarser level than a provision, so they can't
carry a provision-level status or type. Worth tightening.

- `media-control` (guideline) — referenced by 1.4.2, 1.4.7
- `user-control` (group) — referenced by 2.1.4, 2.5.4, 2.5.6
- `animation-and-movement` (group) — referenced by 2.2.2, 2.3.1, 2.3.2, 2.3.3
- `navigating-content` (guideline) — referenced by 2.4.1, 2.4.2, 2.4.3, 2.4.8, 2.4.5
- `keyboard-focus-appearance` (guideline) — referenced by 2.4.7, 2.4.11
- `clear-language` (guideline) — referenced by 3.1.3, 3.1.4, 3.1.5, 3.1.6
- `consistency-across-views` (group) — referenced by 3.2.3, 3.2.4
- `error-handling` (group) — referenced by 3.3.3

### Upstream provisions missing from your catalog (41)

Merge upstream, run `npm run sync:plain-english`, then write annotations for:

`no-flashing-over-threshold-no-exceptions`, `no-flashing-over-threshold`, `single-flash`, `accessible-audio-player-selected`, `audio-descriptions-controllable`, `audio-descriptions-equivalent-prerecorded`, `audio-descriptions-reviewed-by-content-authors`, `audio-descriptions-style-guide`, `audio-descriptions-usability-testing`, `extended-audio-descriptions-equivalent`, `non-verbal-cues-identified-in-audio-descriptions`, `sounds-identified-in-audio-descriptions`, `speaker-language-identified-in-audio-descriptions`, `speakers-identified-in-audio-descriptions`, `visual-information-identified-in-audio-descriptions`, `caption-language-adjustable`, `captions-equivalent-prerecorded`, `captions-reviewed-by-content-authors`, `captions-style-guide`, `captions-usability-testing`, `non-verbal-cues-identified-in-captions`, `sounds-identified-in-captions`, `speaker-language-identified-in-captions`, `speakers-identified-in-captions`, `image-alternatives-equivalent`, `sign-language-controllable`, `sign-language-policy-live`, `descriptive-transcripts-available`, `dialogue-transcripts-available-live`, `dialogue-transcripts-available-prerecorded`, `non-verbal-cues-identified-in-transcripts`, `sounds-identified-in-transcripts`, `speaker-language-identified-in-transcripts`, `speakers-identified-in-transcripts`, `transcripts-equivalent-prerecorded`, `transcripts-findable`, `transcripts-reviewed-by-content-authors`, `transcripts-style-guide`, `transcripts-usability-testing`, `visual-information-identified-in-transcripts`, `no-repetitive-adjacent-interactive-elements`

### In your catalog but no longer upstream (15)

`no-flashing-no-exceptions`, `no-flashing`, `media-alternatives-equivalent`, `media-alternatives-findable`, `media-alternatives-style-guide`, `media-alternatives-usability-testing`, `non-verbal-cues-identified`, `reviewed-by-content-authors`, `sign-language-available-live`, `sounds-identified`, `speaker-language-identified`, `speakers-identified`, `transcripts-available`, `visual-information-identified`, `no-repetitive-links`

## Commits touching tracked content

- `1ac7ded` 2026-09-10 — Shorten issue labels that would end up over 50-char limit by default [#856](https://github.com/w3c/wcag3/pull/856)
- `fa80656` 2026-09-09 — fix to contributors [#853](https://github.com/w3c/wcag3/pull/853)
- `a862fbd` 2026-09-08 — Adjusting editors note to point to intro for questions [#852](https://github.com/w3c/wcag3/pull/852)
- `7023637` 2026-09-07 — spelling fixes and changes so all instances of tiers align [#849](https://github.com/w3c/wcag3/pull/849)
- `009f277` 2026-09-07 — Update current-contributors.md [#847](https://github.com/w3c/wcag3/pull/847)
- `ab2183f` 2026-09-07 — Editorial changes from 842 and 843 [#846](https://github.com/w3c/wcag3/pull/846)
- `d95aeb8` 2026-09-07 — 2026 sep publication prep
- `9fe0b11` 2026-09-03 — Rename best practice to recommended practice everywhere [#839](https://github.com/w3c/wcag3/pull/839)
- `77c2cd6` 2026-09-02 — Incorporate pre-CFC conformance section feedback [#834](https://github.com/w3c/wcag3/pull/834)
- `8a66e3f` 2026-09-01 — Fail on common directive mistakes not caught by remark-directive [#837](https://github.com/w3c/wcag3/pull/837)
- `5bea807` 2026-08-28 — Some contributor fixes
- `5b22a58` 2026-08-28 — Preparation for Aug 2026 publication
- `3d6ee50` 2026-08-27 — More general on how materials could support policy makers [#832](https://github.com/w3c/wcag3/pull/832)
- `1165a15` 2026-08-27 — Explainer - conformance [#833](https://github.com/w3c/wcag3/pull/833)
- `6a9391a` 2026-08-27 — Add “Progress towards and beyond conformance” section [#827](https://github.com/w3c/wcag3/pull/827)
- `730c162` 2026-08-26 — Update conformance section [#826](https://github.com/w3c/wcag3/pull/826)
- `21f5c05` 2026-08-26 — Add explicit darkmode support to account for ReSpec 37.3.3+ [#825](https://github.com/w3c/wcag3/pull/825)
- `2c0aeb7` 2026-08-26 — Rework “No repetitive links” as “No adjacent interactive elements” [#602](https://github.com/w3c/wcag3/pull/602)
- `268df8a` 2026-08-26 — Updates to flashing [#628](https://github.com/w3c/wcag3/pull/628)
- `32f5af7` 2026-08-21 — Fix issues with last-minute images and media changes [#821](https://github.com/w3c/wcag3/pull/821)
- `56c3e7f` 2026-08-21 — Reorganize images and media section
- `3750dfd` 2026-08-21 — Develop informative materials for 2.8.1 Consistency
- `d84c2a4` 2026-08-14 — Add build system for ACT working examples [#774](https://github.com/w3c/wcag3/pull/774)
- `fe1e72b` 2026-08-12 — Grammar pass on applies/except when [#796](https://github.com/w3c/wcag3/pull/796)
- `8c9b3eb` 2026-08-11 — Migrate Methods to informative docs [#795](https://github.com/w3c/wcag3/pull/795)
- `22517c2` 2026-08-07 — Sign language updates [#673](https://github.com/w3c/wcag3/pull/673)
- `3b68275` 2026-08-06 — remove "AI of all sorts" [#793](https://github.com/w3c/wcag3/pull/793)
- `f12f219` 2026-08-05 — Add README for informative files; remove unused user-needs directive [#792](https://github.com/w3c/wcag3/pull/792)

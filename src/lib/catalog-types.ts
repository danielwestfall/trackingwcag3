/**
 * Shared TypeScript interfaces for the compiled JSON catalogs in public/data/
 * and wcag22-data/.
 */

export type Wcag3ProvisionType =
  | "foundational"
  | "supplemental"
  | "assertion"
  | "recommended practice"
  | null;

export type Wcag3Status =
  | "exploratory"
  | "developing"
  | "refining"
  | "mature"
  | string;

export interface Wcag22InboundRef {
  num: string;
  name: string;
  level: "A" | "AA" | "AAA" | null;
  obsolete: boolean;
  principle: string;
}

export interface Wcag3DerivedMaterial {
  appliesWhen: string[];
  exceptWhen: string[];
  notes: string[];
  editorNotes: string[];
  examples: string[];
  tests: string | null;
  methods: string | null;
  intent: string | null;
  recommendedPractices: string | null;
  sources: {
    provision: string;
    informative: string | null;
  };
}

export interface Wcag3Annotation {
  slug?: string;
  generated?: boolean;
  translatedFrom?: string;
  plainEnglish?: {
    summary?: string;
    whyItMatters?: string;
    realWorldExample?: string;
  };
  personaBreakdown?: {
    designer?: string;
    developer?: string;
    qa?: string;
    pm?: string;
  };
  testingGuide?: {
    automated?: string;
    manual?: string;
    assistiveTech?: string;
  };
  codeComparison?: {
    bad?: string;
    good?: string;
  };
}

export interface Wcag3CatalogItem {
  slug: string;
  groupSlug: string;
  guidelineSlug: string;
  title: string;
  type: Wcag3ProvisionType;
  status: Wcag3Status;
  issueLabel: string;
  needsAdditionalResearch: boolean;
  tags: string[];
  rawBody: string;
  derived: Wcag3DerivedMaterial;
  annotation: Wcag3Annotation;
  wcag22Inbound: {
    direct: Wcag22InboundRef[];
    viaGuideline: Wcag22InboundRef[];
    viaGroup: Wcag22InboundRef[];
    related: Wcag22InboundRef[];
  };
}

export interface Wcag22CatalogItem {
  id: string;
  num: string;
  name: string;
  level: "A" | "AA" | "AAA" | null;
  obsolete?: boolean;
  principle: string;
  guideline?: string;
  w3cSlug: string;
  trUrl?: string;
  understandingUrl?: string;
  plainEnglish: {
    summary: string;
    whyItMatters: string;
    realWorldExample?: string;
  };
  wcag3Mapping: {
    provisions: string[];
    related?: string[];
    note?: string | null;
    evolutionNote?: string;
  };
}

export interface EvolutionMatrixProvisionCard {
  slug: string;
  title: string;
  type: Wcag3ProvisionType;
  typeLabel: string;
  status: Wcag3Status | null;
  groupSlug: string | null;
  text: string;
  exceptWhen: string[];
  sourceUrl: string | null;
  guideUrl: string;
}

export interface EvolutionMatrixItem {
  id: string;
  num: string;
  name: string;
  level: "A" | "AA" | "AAA" | null;
  obsolete: boolean;
  principle: string;
  w3cSlug: string;
  summary: string;
  whyItMatters: string;
  trUrl: string;
  understandingUrl: string;
  guideUrl: string;
  provisions: EvolutionMatrixProvisionCard[];
  related: EvolutionMatrixProvisionCard[];
  changeAnalysis: {
    changeType: "successor" | "related-only" | "none" | "obsolete";
    changeBadge: string;
    note: string | null;
  };
}

export interface Wcag3RemovalLink {
  title: string;
  url: string;
}

export interface Wcag3RemovalPersonaImpact {
  designer?: string;
  developer?: string;
  qa?: string;
  productManager?: string;
}

export interface Wcag3RemovalItem {
  id: string;
  title: string;
  wcag22Concept: string;
  wcag3Status: string;
  plainEnglishSummary: string;
  workingGroupDebate: string;
  debateLinks: Wcag3RemovalLink[];
  personaImpact: Wcag3RemovalPersonaImpact;
  supportingLinks: Wcag3RemovalLink[];
}

export interface Wcag3StricterCriterion {
  num: string;
  name: string;
  level: "A" | "AA" | "AAA";
}

export interface Wcag3StricterCategory {
  id: string;
  title?: string;
  label?: string;
  icon?: string;
  description?: string;
}

export interface Wcag3StricterAaaResult {
  label: string;
  short: string;
  meaning: string;
}

export interface Wcag3StricterItem {
  id: string;
  category: string;
  practice: string;
  example: string;
  aa: {
    criteria: Wcag3StricterCriterion[];
    explanation: string;
  };
  aaa: {
    result: string;
    criteria: Wcag3StricterCriterion[];
    explanation: string;
  };
  provisions: string[];
  note?: string;
  needsReview?: boolean;
}

export interface Wcag3StricterCurated {
  _about?: string;
  written?: string;
  aaaResults?: Record<string, Wcag3StricterAaaResult>;
  categories: Wcag3StricterCategory[];
  core: Wcag3StricterItem[];
  supplemental: Wcag3StricterItem[];
  notRuledOut: Wcag3StricterItem[];
}

export interface RelatedGroupStat {
  value: string | number;
  label: string;
}

export interface RelatedTrackedDoc {
  title: string;
  status: string;
  publishedDate?: string;
  url?: string;
}

export interface RelatedFutureItem {
  title?: string;
  what?: string;
  when?: string;
  certainty: "planned" | "proposed" | string;
  description?: string;
  notes?: string;
}

export interface RelatedActionItem {
  action: string;
  why: string;
}

export interface RelatedStandardGroup {
  id: string;
  icon: string;
  name: string;
  fullName: string;
  group: string;
  tagline: string;
  statusPill: string;
  stats: RelatedGroupStat[];
  overview: string[];
  current: Array<{ title: string; url: string; note?: string; badge?: string; status?: string; date?: string }>;
  inDevelopment: Array<{ title: string; url: string; note?: string; badge?: string; target?: string; status?: string; date?: string; summary?: string; changes?: string[] }>;
  connection: {
    wcag22?: string;
    wcag3?: string;
    howItWorks?: string;
    provisions?: string[];
  };
  future: RelatedFutureItem[];
  doNow: RelatedActionItem[];
  hedge: RelatedActionItem[];
  wait: RelatedActionItem[];
  watch: string[];
  trackedDocs?: RelatedTrackedDoc[];
  sources: Array<{ title: string; url: string }>;
}

export interface RelatedStandardsData {
  _about?: string;
  lastReviewed?: string;
  certaintyLabels: Record<string, string>;
  act?: {
    approved?: number;
    proposed?: number;
  };
  groups: RelatedStandardGroup[];
}

export interface Wcag22NormativeDlItem {
  term: string;
  html: string;
}

export interface Wcag22NormativeBlock {
  type: "p" | "dl" | "ol" | "ul";
  html?: string;
  items?: any[];
}

export interface Wcag22Definition {
  term: string;
  id: string;
  definition: Wcag22NormativeBlock[];
  informativeNotes: string[];
}

export interface Wcag22NormativeItem {
  num: string;
  id: string;
  name: string;
  obsolete?: boolean;
  level: "A" | "AA" | "AAA" | null;
  principle: string;
  guideline: string;
  wcagVersionAdded?: string;
  newIn22?: boolean;
  normative: Wcag22NormativeBlock[];
  informativeNotes: string[];
  definitions: Wcag22Definition[];
  unresolvedTerms?: string[];
  source?: string;
}

export interface Wcag22GuidanceItem {
  num: string;
  floor: string;
  notRequired: string[];
  gap: string;
  bestPractice: string;
  failsExamples: string[];
}

export interface Wcag3DiscussionPosition {
  label: string;
  who: string;
  detail: string;
}

export interface Wcag3DiscussionSummary {
  headline: string;
  positions: Wcag3DiscussionPosition[];
  agreed: string[];
  open: string[];
  note?: string;
}

export interface Wcag3DiscussionThread {
  number: number;
  title: string;
  url: string;
  state: string;
  comments: number;
  updated: string;
}

export interface Wcag3DiscussionItem {
  slug: string;
  title: string;
  group: string;
  guideline: string;
  status: string;
  type: string;
  threadCount: number;
  noRecordedDiscussion?: boolean;
  commentCount: number;
  openCount: number;
  fingerprint: string;
  summaryOf?: string;
  summary?: Wcag3DiscussionSummary | null;
  threads: Wcag3DiscussionThread[];
}


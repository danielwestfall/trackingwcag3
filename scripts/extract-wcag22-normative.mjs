#!/usr/bin/env node
/**
 * Extract the normative text of every WCAG 2.2 success criterion, and the
 * glossary definitions each one links to, from a checkout of the W3C source
 * (github.com/w3c/wcag) at the tag of the published Recommendation.
 *
 *   git clone https://github.com/w3c/wcag.git /tmp/wcag
 *   git -C /tmp/wcag checkout WCAG22-20241212
 *   node scripts/extract-wcag22-normative.mjs /tmp/wcag
 *
 * Writes wcag22-data/normative-text.json.
 *
 * Why notes are kept apart: WCAG 2.2 section 5.1 says "Introductory material,
 * appendices, sections marked as 'non-normative', diagrams, examples, and
 * notes are informative (non-normative)." A note inside a success criterion or
 * a definition does not create a requirement, so the site must never present
 * one as part of the requirement. Notes are extracted, but labelled informative.
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import * as cheerio from "cheerio";

const TAG = "WCAG22-20241212";
const SOURCE_URL = "https://www.w3.org/TR/2024/REC-WCAG22-20241212/";

const repo = process.argv[2];
if (!repo || !fs.existsSync(path.join(repo, "guidelines", "index.html"))) {
  console.error("Usage: node scripts/extract-wcag22-normative.mjs <path to w3c/wcag checkout>");
  process.exit(1);
}
const G = path.join(repo, "guidelines");

// Refuse to run against anything but the published Recommendation: the main
// branch carries editorial changes that have not been published.
let checkedOut = "";
try {
  checkedOut = execSync(`git -C "${repo}" describe --tags --exact-match`, { encoding: "utf8" }).trim();
} catch {}
if (checkedOut !== TAG) {
  console.error(`Expected the ${TAG} tag to be checked out, found "${checkedOut || "an untagged commit"}".`);
  process.exit(1);
}

// ---- Glossary -------------------------------------------------------------
const terms = new Map(); // lookup key -> term record
const termRecords = [];
const tidy = (s) => s.replace(/\s+/g, " ").trim();

function innerHtmlClean($, el) {
  // Keep only inline markup the site can render safely; turn term links into
  // plain <dfn-ref> markers that the page resolves to its own definitions list.
  const $el = $(el).clone();
  $el.find("a").each((_, a) => {
    const $a = $(a);
    const href = $a.attr("href");
    const text = $a.text();
    if (!href) $a.replaceWith(`<span class="term-ref" data-term="${tidy(text).toLowerCase()}">${text}</span>`);
    else if (href.startsWith("#")) $a.replaceWith(`<span class="xref">${text}</span>`);
    else $a.replaceWith(`<a href="${href}">${text}</a>`);
  });
  $el.find("*").each((_, n) => {
    const keep = ["span", "a", "em", "strong", "code", "abbr", "sub", "sup", "var", "i", "b"];
    if (!keep.includes(n.tagName)) return;
    for (const attr of Object.keys(n.attribs || {})) {
      if (!["class", "data-term", "href", "title"].includes(attr)) $(n).removeAttr(attr);
    }
  });
  return tidy($el.html() || "");
}

for (const ver of ["20", "21", "22"]) {
  const dir = path.join(G, "terms", ver);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".html"))) {
    const $ = cheerio.load(fs.readFileSync(path.join(dir, file), "utf8"), null, false);
    $(".change").remove(); // the spec's "New" marker on 2.2 terms
    const dfn = $("dfn").first();
    if (!dfn.length) continue;
    const name = tidy(dfn.text());
    const alts = (dfn.attr("data-lt") || "").split("|").map((s) => tidy(s)).filter(Boolean);
    const dd = $("dd").first();
    const blocks = [];
    const notes = [];
    dd.children().each((_, c) => {
      const $c = $(c);
      const html = c.tagName === "p" ? innerHtmlClean($, c) : tidy($.html(c));
      if ($c.hasClass("note")) notes.push(innerHtmlClean($, c));
      else if ($c.hasClass("example")) return;
      else if (c.tagName === "p") blocks.push({ type: "p", html });
      else if (c.tagName === "ul" || c.tagName === "ol") blocks.push({ type: c.tagName, items: $c.children("li").map((_, li) => innerHtmlClean($, li)).get() });
      else if (c.tagName === "dl") blocks.push({ type: "dl", items: $c.children("dt").map((_, dt) => ({ term: tidy($(dt).text()), html: innerHtmlClean($, $(dt).next("dd")) })).get() });
    });
    // A definition written as bare text inside <dd> with no <p>.
    if (!blocks.length) {
      const bare = dd.clone(); bare.children(".note, .example").remove();
      const text = innerHtmlClean($, bare);
      if (text) blocks.push({ type: "p", html: text });
    }
    const rec = { term: name, id: dfn.attr("id"), wcagVersion: ver, definition: blocks, notes };
    termRecords.push(rec);
    for (const key of [name, ...alts]) terms.set(key.toLowerCase(), rec);
  }
}

function lookupTerm(raw) {
  const k = raw.toLowerCase();
  const tries = [k, k.replace(/ies$/, "y"), k.replace(/es$/, ""), k.replace(/s$/, ""), k.replace(/'s$/, "")];
  for (const t of tries) if (terms.has(t)) return terms.get(t);
  return null;
}

// Point each term reference at the id of the definition it resolves to, so the
// site can link the term to the definition shown on the same page.
const resolveRefs = (html) =>
  html.replace(/<span class="term-ref" data-term="([^"]*)">/g, (m, t) => {
    const rec = lookupTerm(t);
    return rec ? `<span class="term-ref" data-dfn="${rec.id}">` : `<span class="term-ref">`;
  });
const resolveBlocks = (blocks) =>
  blocks.map((b) =>
    b.type === "p" ? { ...b, html: resolveRefs(b.html) }
    : b.type === "dl" ? { ...b, items: b.items.map((i) => ({ ...i, html: resolveRefs(i.html) })) }
    : { ...b, items: b.items.map(resolveRefs) });

// ---- Success criteria, in document order ---------------------------------
const index = cheerio.load(fs.readFileSync(path.join(G, "index.html"), "utf8"));
const out = [];
index("section.principle").each((pi, principle) => {
  const pName = tidy(index(principle).children("h2").first().text());
  index(principle).children("section.guideline").each((gi, guideline) => {
    const gName = tidy(index(guideline).children("h3").first().text());
    index(guideline).find("section[data-include^='sc/']").each((si, inc) => {
      const file = index(inc).attr("data-include");
      const num = `${pi + 1}.${gi + 1}.${si + 1}`;
      const $ = cheerio.load(fs.readFileSync(path.join(G, file), "utf8"), null, false);
      const sec = $("section.sc").first();
      const name = tidy(sec.children("h4").first().text());
      const level = tidy(sec.children("p.conformance-level").first().text()) || null;
      const normative = [];
      const notes = [];
      const used = new Set();
      sec.children().each((_, c) => {
        const $c = $(c);
        // "change" paragraphs are the spec's own "New" marker, not requirement text.
        if (c.tagName === "h4" || $c.hasClass("conformance-level") || $c.hasClass("change")) return;
        $c.find("a:not([href])").each((_, a) => used.add(tidy($(a).text())));
        if ($c.hasClass("note")) { notes.push(innerHtmlClean($, c)); return; }
        if ($c.hasClass("example")) return;
        if (c.tagName === "p") normative.push({ type: "p", html: innerHtmlClean($, c) });
        else if (c.tagName === "ul" || c.tagName === "ol") normative.push({ type: c.tagName, items: $c.children("li").map((_, li) => innerHtmlClean($, li)).get() });
        else if (c.tagName === "dl") {
          normative.push({
            type: "dl",
            items: $c.children("dt").map((_, dt) => {
              const dd = $(dt).nextAll("dd").first();
              // Notes nested inside an exception are informative too.
              dd.find(".note").each((_, n) => { notes.push(innerHtmlClean($, n)); $(n).remove(); });
              const parts = dd.children("p").length ? dd.children("p").map((_, p) => innerHtmlClean($, p)).get().join(" ") : innerHtmlClean($, dd);
              return { term: tidy($(dt).text()), html: parts };
            }).get(),
          });
        }
      });
      // Terms are resolved one level deep: the definitions this criterion links to.
      const definitions = [];
      const missing = [];
      for (const t of used) {
        const rec = lookupTerm(t);
        if (rec) { if (!definitions.find((d) => d.term === rec.term)) definitions.push(rec); }
        else missing.push(t);
      }
      out.push({
        num,
        id: sec.attr("id"),
        name: name.replace(/\s*\(Obsolete and removed\)\s*$/i, ""),
        obsolete: /obsolete and removed/i.test(name),
        level,
        principle: pName.replace(/^Principle \d+\s*/, ""),
        guideline: gName,
        wcagVersionAdded: file.split("/")[1],
        newIn22: sec.hasClass("new"),
        normative: resolveBlocks(normative),
        informativeNotes: notes.map(resolveRefs),
        definitions: definitions.map(({ term, id, definition, notes }) => ({ term, id, definition: resolveBlocks(definition), informativeNotes: notes.map(resolveRefs) })),
        unresolvedTerms: missing,
        source: `${SOURCE_URL}#${sec.attr("id")}`,
      });
    });
  });
});

const doc = {
  _about: "Normative text of WCAG 2.2, extracted verbatim from the W3C source at the published Recommendation tag. Notes are carried separately as informative, per WCAG 2.2 section 5.1. Regenerate with scripts/extract-wcag22-normative.mjs.",
  recommendation: "WCAG 2.2, W3C Recommendation 12 December 2024",
  sourceTag: TAG,
  sourceUrl: SOURCE_URL,
  normativeStatement: "The main content of WCAG 2.2 is normative and defines requirements that impact conformance claims. Introductory material, appendices, sections marked as \"non-normative\", diagrams, examples, and notes are informative (non-normative). Non-normative material provides advisory information to help interpret the guidelines but does not create requirements that impact a conformance claim.",
  criteria: out,
};
const target = path.join(process.cwd(), "wcag22-data", "normative-text.json");
fs.writeFileSync(target, JSON.stringify(doc, null, 2) + "\n");
const unresolved = out.flatMap((c) => c.unresolvedTerms.map((t) => `${c.num}: ${t}`));
console.log(`Wrote ${out.length} criteria (${out.filter((c) => c.obsolete).length} obsolete) to ${path.relative(process.cwd(), target)}`);
if (unresolved.length) console.log(`Unresolved term links:\n  ${unresolved.join("\n  ")}`);

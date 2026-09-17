import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔄 Running WCAG Plain English Sync & Audit Engine...');

// The upstream draft carries real structure that the site was throwing away:
// scope conditions, editor's notes recording open questions, worked examples,
// and a test procedure in the matching informative document. None of it is
// interpretation — it is the W3C text, extracted and attributed — so it can be
// shown on a provision page that has no hand-written annotation without the
// page claiming anything of its own. Everything here is skipped when the
// upstream section is a stub ("To be added"), because an empty heading is not
// content and rendering it as though it were is the same failure as inventing it.

// Pull ":::name ... :::" blocks out of a markdown body.
function extractDirectives(body) {
  const found = { 'applies-when': [], 'except-when': [], note: [], ednote: [], example: [] };
  // Upstream sometimes leaves trailing spaces after the directive name
  // (":::note "), which a stricter pattern silently skipped over.
  const re = /^:::([a-z-]+)[ \t]*\r?\n([\s\S]*?)^:::/gm;
  let m;
  while ((m = re.exec(body)) !== null) {
    const name = m[1];
    if (!(name in found)) continue;
    const text = m[2].trim();
    if (text) found[name].push(text);
  }
  return found;
}

// Split a markdown document into { heading: body } on "## " headings.
function splitSections(markdown) {
  const out = {};
  const parts = markdown.split(/^## +(.+?)[ \t]*$/m);
  for (let i = 1; i < parts.length; i += 2) out[parts[i].trim()] = parts[i + 1].trim();
  return out;
}

// Upstream marks unwritten sections with "To be added". 194 of 245 provisions
// have a real test procedure; the other 51 have the heading and nothing else.
function hasContent(text) {
  if (!text) return false;
  const flat = text.replace(/\s+/g, ' ').trim().toLowerCase();
  if (flat.length < 4) return false;
  return !/^(to be added|tbd|todo)\.?$/.test(flat);
}

const stripW3cMarkup = (text) => text.replace(/:[a-z]+\[([^\]]+)\](\{[^}]*\})?/gi, '$1');


// Recursive file scanner using native node fs
function scanFilesRecursively(dir, extension = '.md') {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(scanFilesRecursively(fullPath, extension));
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      results.push(fullPath);
    }
  }
  return results;
}

// Helper to parse frontmatter from markdown
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content.trim() };
  
  const yamlBlock = match[1];
  const body = match[2].trim();
  const frontmatter = {};
  
  yamlBlock.split(/\r?\n/).forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      } else {
        val = val.replace(/^['"]|['"]$/g, '');
      }
      frontmatter[key] = val;
    }
  });

  return { frontmatter, body };
}

async function sync() {
  const md = await createMarkdownProcessor({});
  const toHtml = async (markdown) => (await md.render(stripW3cMarkup(markdown))).code.trim();

  const groupsDir = path.join(rootDir, 'guidelines', 'groups');
  const informativeDir = path.join(rootDir, 'informative', 'guidelines');
  const plainEnglishDataDir = path.join(rootDir, 'plain-english-data', 'provisions');
  const wcag22Path = path.join(rootDir, 'wcag22-data', 'success-criteria.json');
  const publicDataDir = path.join(rootDir, 'public', 'data');

  if (!fs.existsSync(publicDataDir)) {
    fs.mkdirSync(publicDataDir, { recursive: true });
  }

  // 1. Scan W3C Provisions
  const allMdFiles = scanFilesRecursively(groupsDir, '.md');
  // Provisions are 3 levels deep: groups/{group}/{guideline}/{provision}.md
  const provisionFiles = allMdFiles.filter(filePath => {
    const rel = path.relative(groupsDir, filePath);
    const parts = rel.split(/[/\\]/);
    return parts.length === 3;
  });

  console.log(`📑 Found ${provisionFiles.length} W3C provision files in guidelines/groups/`);

  const wcag3Catalog = [];
  const missingAnnotations = [];

  for (const fullPath of provisionFiles) {
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(fileContent);

    // Clean W3C custom directive markup like :term[Content] or :term[Word]{#dfn-id}
    const cleanBodyText = body.replace(/:[a-z]+\[([^\]]+)\](\{[^}]*\})?/gi, '$1');

    const rel = path.relative(groupsDir, fullPath);
    const parts = rel.split(/[/\\]/);
    const groupSlug = parts[0];
    const guidelineSlug = parts[1];
    const provisionSlug = path.basename(parts[2], '.md');

    // Read matching plain English annotation if exists
    const annotationPath = path.join(plainEnglishDataDir, `${provisionSlug}.json`);
    let annotation = null;

    if (fs.existsSync(annotationPath)) {
      annotation = JSON.parse(fs.readFileSync(annotationPath, 'utf8'));
    } else {
      missingAnnotations.push(provisionSlug);
      const cleanBody = cleanBodyText.replace(/:::[a-z]+[\s\S]*?:::/gi, '').replace(/[#*`_]/g, '').trim();
      const firstSentence = cleanBody.split(/(?<=[.!?])\s+/)[0] || cleanBody;
      const formattedTitle = frontmatter.title || provisionSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      // A provision with no hand-written annotation gets ONLY what can be
      // derived from the upstream draft: its title and its opening sentence.
      //
      // This block used to manufacture the rest. It asserted, for all 242
      // provisions without an annotation, that "W3C Task Force is refining
      // requirements for <slug> ... Key debates focus on testability and
      // cross-platform AT interoperability"; it published a "W3C Final
      // Recommendation Likelihood" of Medium (70-89%) derived from nothing but
      // the status field; and it picked WCAG 2.2 matching criteria by testing
      // the group slug for the substring "text" or "interactive". None of that
      // was true, and the pages presented it identically to the three
      // provisions that do have researched annotations. On a site whose purpose
      // is trustworthy plain-English translation of a standard, inventing the
      // translation is the one thing it must not do.
      //
      // `generated: true` lets the templates tell the two apart and say so.
      annotation = {
        slug: provisionSlug,
        generated: true,
        plainEnglish: {
          summary: `${formattedTitle}: ${firstSentence}`
        }
      };
    }

    // --- Upstream structure, extracted and attributed ---------------------
    const directives = extractDirectives(body);
    const informativeRel = path.join('informative', 'guidelines', groupSlug, guidelineSlug, `${provisionSlug}.md`);
    const informativePath = path.join(rootDir, informativeRel);
    const informative = fs.existsSync(informativePath)
      ? splitSections(fs.readFileSync(informativePath, 'utf8'))
      : {};
    // Upstream writes the test as a "Procedure" block followed by an
    // "Expected results" block, sometimes under "## Tests" and once under
    // "## Procedure" directly. Both shapes are kept whole rather than parsed
    // apart, so the page shows exactly what the draft says.
    const testsSection = informative['Tests'] || informative['Procedure'] || '';

    const renderAll = async (blocks) => Promise.all(blocks.map(toHtml));
    const derived = {
      appliesWhen: await renderAll(directives['applies-when']),
      exceptWhen: await renderAll(directives['except-when']),
      notes: await renderAll(directives.note),
      // ":::ednote" is the editors' own note in the draft: the open questions
      // the group has written down. It is the only honest source this site has
      // for "what is unsettled about this provision" — the field it used to
      // fill with a manufactured sentence about task-force debate.
      editorNotes: await renderAll(directives.ednote),
      examples: await renderAll(directives.example),
      tests: hasContent(testsSection) ? await toHtml(testsSection) : null,
      methods: hasContent(informative['Methods']) ? await toHtml(informative['Methods']) : null,
      intent: hasContent(informative['Intent']) ? await toHtml(informative['Intent']) : null,
      recommendedPractices: hasContent(informative['Recommended Practices'])
        ? await toHtml(informative['Recommended Practices']) : null,
      sources: {
        provision: path.relative(rootDir, fullPath).split(path.sep).join('/'),
        informative: fs.existsSync(informativePath) ? informativeRel.split(path.sep).join('/') : null
      }
    };

    wcag3Catalog.push({
      slug: provisionSlug,
      groupSlug,
      guidelineSlug,
      title: frontmatter.title || provisionSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      // Upstream leaves some provisions with no type at all. Defaulting them to
      // 'foundational' put the site's LEAST settled provisions — all of them
      // exploratory — under its STRONGEST type label, and disagreed with
      // track-upstream.mjs, which counts the same eight as untyped. They are
      // carried as their own 'exploratory' type instead.
      type: frontmatter.type || 'exploratory',
      status: frontmatter.status || 'exploratory',
      issueLabel: frontmatter.issueLabel || '',
      needsAdditionalResearch: frontmatter.needsAdditionalResearch === 'true',
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : (frontmatter.tags ? [frontmatter.tags] : []),
      rawBody: cleanBodyText,
      derived,
      annotation
    });
  }

  const provisionSlugs = new Set(wcag3Catalog.map((p) => p.slug));
  const guidelineSlugs = new Set(wcag3Catalog.map((p) => p.guidelineSlug));
  const groupSlugs = new Set(wcag3Catalog.map((p) => p.groupSlug));

  // 2. Load WCAG 2.2 Data
  let wcag22Catalog = [];
  if (fs.existsSync(wcag22Path)) {
    wcag22Catalog = JSON.parse(fs.readFileSync(wcag22Path, 'utf8'));
    console.log(`✅ Loaded ${wcag22Catalog.length} WCAG 2.2 Success Criteria entries`);
  }

  // 2b. Invert the curated WCAG 2.2 -> WCAG 3 map.
  //
  // wcag22-catalog.json is hand-maintained and trustworthy: every criterion's
  // wcag3Mapping.provisions was reasoned by a person (0 broken, 0 missing at
  // the last check). The WCAG 3 -> 2.2 direction never was — the old fallback
  // guessed it from the group slug — so it is derived here by inverting the
  // curated data instead of being invented alongside it.
  //
  // Some criteria point at a guideline or group slug rather than a provision
  // (6 of them at the last count). Those are recorded against the guideline so
  // the provision page can say the reference is coarse rather than silently
  // claiming a provision-level match.
  const inboundByProvision = new Map();
  const inboundByGuideline = new Map();
  const inboundByGroup = new Map();
  for (const sc of wcag22Catalog) {
    const targets = sc.wcag3Mapping?.provisions || [];
    for (const slug of targets) {
      const entry = { num: sc.num, name: sc.name, level: sc.level, principle: sc.principle };
      const bucket = provisionSlugs.has(slug) ? inboundByProvision
        : guidelineSlugs.has(slug) ? inboundByGuideline
        : groupSlugs.has(slug) ? inboundByGroup
        : null;
      if (!bucket) continue;                       // dangling reference; the tracker reports these
      if (!bucket.has(slug)) bucket.set(slug, []);
      bucket.get(slug).push(entry);
    }
  }
  const bySc = (a, b) => a.num.localeCompare(b.num, undefined, { numeric: true });
  let directCount = 0;
  let coarseCount = 0;
  for (const provision of wcag3Catalog) {
    const direct = (inboundByProvision.get(provision.slug) || []).slice().sort(bySc);
    const viaGuideline = (inboundByGuideline.get(provision.guidelineSlug) || []).slice().sort(bySc);
    const viaGroup = (inboundByGroup.get(provision.groupSlug) || []).slice().sort(bySc);
    provision.wcag22Inbound = { direct, viaGuideline, viaGroup };
    if (direct.length) directCount += 1;
    if (!direct.length && (viaGuideline.length || viaGroup.length)) coarseCount += 1;
  }
  console.log(`🔗 Inverted the curated 2.2 map: ${directCount} provisions named directly, ${coarseCount} reached only at guideline/group level`);

  // 3. Load WCAG 2.2 vs 3 Removals & Omissions Data
  const removalsPath = path.join(rootDir, 'wcag22-data', 'removals-and-omissions.json');
  let removalsCatalog = [];
  if (fs.existsSync(removalsPath)) {
    removalsCatalog = JSON.parse(fs.readFileSync(removalsPath, 'utf8'));
    console.log(`✅ Loaded ${removalsCatalog.length} WCAG 2.2 vs 3 Removals/Omissions entries`);
  }

  // 4. Load Hottest Debates Data
  const debatesPath = path.join(rootDir, 'wcag22-data', 'hottest-debates.json');
  let debatesCatalog = [];
  if (fs.existsSync(debatesPath)) {
    debatesCatalog = JSON.parse(fs.readFileSync(debatesPath, 'utf8'));
    console.log(`🔥 Loaded ${debatesCatalog.length} Hottest W3C Debates entries`);
  }

  // Write outputs to public/data/
  fs.writeFileSync(path.join(publicDataDir, 'wcag3-catalog.json'), JSON.stringify(wcag3Catalog, null, 2));
  fs.writeFileSync(path.join(publicDataDir, 'wcag22-catalog.json'), JSON.stringify(wcag22Catalog, null, 2));
  fs.writeFileSync(path.join(publicDataDir, 'wcag3-removals.json'), JSON.stringify(removalsCatalog, null, 2));
  fs.writeFileSync(path.join(publicDataDir, 'wcag3-debates.json'), JSON.stringify(debatesCatalog, null, 2));

  console.log(`\n🎉 Sync Complete! Output written to public/data/`);
  console.log(`   - WCAG 3 Provisions: ${wcag3Catalog.length}`);
  console.log(`   - WCAG 2.2 Criteria: ${wcag22Catalog.length}`);
  console.log(`   - Removals & Omissions: ${removalsCatalog.length}`);
  console.log(`   - Hottest W3C Debates: ${debatesCatalog.length}`);
  console.log(`   - Custom Annotations Found: ${wcag3Catalog.length - missingAnnotations.length}`);
  console.log(`   - Fallback Annotations Used: ${missingAnnotations.length}`);

  const withDerived = (key) => wcag3Catalog.filter((p) => Array.isArray(p.derived[key]) ? p.derived[key].length : p.derived[key]).length;
  console.log(`\n📚 Upstream material extracted (no interpretation added):`);
  for (const key of ['tests', 'appliesWhen', 'exceptWhen', 'examples', 'notes', 'editorNotes', 'methods', 'intent', 'recommendedPractices']) {
    console.log(`   - ${key}: ${withDerived(key)} provisions`);
  }
}

sync().catch(err => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});

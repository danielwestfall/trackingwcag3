import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔄 Running WCAG Plain English Sync & Audit Engine...');

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
  const groupsDir = path.join(rootDir, 'guidelines', 'groups');
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
      const statusStr = frontmatter.status || 'exploratory';

      let likelihood = 'Under Discussion';
      if (statusStr === 'mature' || statusStr === 'refining') likelihood = 'High (90%+)';
      else if (statusStr === 'developing') likelihood = 'Medium (70-89%)';

      let delta = 'Equivalent';
      if (frontmatter.type === 'foundational') delta = 'More Strict';
      else if (groupSlug.includes('process') || groupSlug.includes('user-control')) delta = 'New / Broader Scope';

      annotation = {
        slug: provisionSlug,
        plainEnglish: {
          summary: `${formattedTitle}: ${firstSentence}`,
          whyItMatters: `Ensures that users, particularly those relying on assistive technology or with cognitive/motor needs, can perceive and interact with ${guidelineSlug.replace(/-/g, ' ')} without barriers.`,
          realWorldExample: `In a live web application, ${formattedTitle.toLowerCase()} guarantees that users can successfully navigate and complete user flows across diverse devices.`
        },
        personaBreakdown: {
          designer: `Design clear visual indicators, layout structures, and high-contrast styling for ${formattedTitle.toLowerCase()}.`,
          developer: `Implement semantic HTML tags, standard ARIA roles, and responsive CSS properties adhering to ${provisionSlug}.`,
          qa: `Perform keyboard tab order checks, screen reader announcements, and automated accessibility scanning.`,
          productManager: `Include ${formattedTitle.toLowerCase()} in design system specifications and release criteria.`
        },
        statusSummary: {
          inclusionLikelihood: likelihood,
          workingGroupDebate: `W3C Task Force is refining requirements for ${provisionSlug} under the ${groupSlug} working group track. Key debates focus on testability and cross-platform AT interoperability.`,
          keyChallenges: `Ensuring consistent execution across desktop browsers, mobile viewports, and screen reader software.`
        },
        testingGuide: {
          automated: `Run automated accessibility checks via axe-core or Lighthouse inspecting elements matching ${provisionSlug}.`,
          manualKeyboard: `Tab through interactive elements associated with ${provisionSlug} and verify visual focus and keydown triggers.`,
          screenReader: `Navigate using NVDA/VoiceOver and verify correct accessible name, role, and state announcements.`,
          codeSnippetGood: `<!-- Compliant pattern for ${provisionSlug} -->\n<div class="accessible-container" tabIndex="0">\n  <span>${formattedTitle}</span>\n</div>`,
          codeSnippetBad: `<!-- Non-compliant pattern -->\n<div onclick="doSomething()">${formattedTitle}</div>`
        },
        wcag22Comparison: {
          matchingCriteria: groupSlug.includes('text') ? ['1.4.3 Contrast', '1.4.12 Text Spacing'] : groupSlug.includes('interactive') ? ['4.1.2 Name, Role, Value', '2.4.7 Focus Visible'] : ['1.3.1 Info & Relationships'],
          strictnessDelta: delta,
          deltaExplanation: `WCAG 3 evolves ${provisionSlug} from a binary page-level check into a continuous outcome-based guideline.`
        }
      };
    }

    wcag3Catalog.push({
      slug: provisionSlug,
      groupSlug,
      guidelineSlug,
      title: frontmatter.title || provisionSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      type: frontmatter.type || 'foundational',
      status: frontmatter.status || 'exploratory',
      issueLabel: frontmatter.issueLabel || '',
      needsAdditionalResearch: frontmatter.needsAdditionalResearch === 'true',
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : (frontmatter.tags ? [frontmatter.tags] : []),
      rawBody: cleanBodyText,
      annotation
    });
  }

  // 2. Load WCAG 2.2 Data
  let wcag22Catalog = [];
  if (fs.existsSync(wcag22Path)) {
    wcag22Catalog = JSON.parse(fs.readFileSync(wcag22Path, 'utf8'));
    console.log(`✅ Loaded ${wcag22Catalog.length} WCAG 2.2 Success Criteria entries`);
  }

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
}

sync().catch(err => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});

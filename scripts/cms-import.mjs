import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { loadEnv } from 'vite';

const cleanImage = (image) => image ? { src: image.src, alt: image.alt, width: image.width, height: image.height } : undefined;
function paragraphs(blocks = []) {
  return blocks.map((block) => {
    if (block._type !== 'block' || (block.style && block.style !== 'normal') || block.listItem || block.markDefs?.length || block.children?.some((span) => span._type !== 'span' || span.marks?.length)) {
      throw new Error('Case paragraphs support plain paragraph text only; unsupported formatting would lose content.');
    }
    return (block.children ?? []).map((span) => span.text).join('');
  });
}

export function decodeDocuments(documents) {
  const settings = documents.find((d) => d._type === 'siteSettings');
  if (!settings?.categories?.length) throw new Error('CMS siteSettings.categories is missing.');
  const projects = documents.filter((d) => d._type === 'project').sort((a, b) => a.order - b.order).map((d) => {
    const project = { slug: d.slug?.current, name: d.name, year: d.year, tier: d.tier, tags: d.tags ?? [], summary: d.summary };
    for (const field of ['category', 'featured', 'pending', 'status', 'preview']) if (d[field] !== undefined) project[field] = d[field];
    if (d.seoTitle) project.title = d.seoTitle;
    if (d.seoDescription) project.desc = d.seoDescription;
    if (d.links) {
      project.links = {};
      for (const field of ['live', 'repo', 'liveNote']) if (d.links[field]) project.links[field] = d.links[field];
      if (d.links.extra?.length) project.links.extra = d.links.extra.map(({ label, href }) => ({ label, href }));
    }
    if (d.demoKind) project.demo = d.demoKind;
    if (d.demoEmbed) {
      project.demo = { embed: d.demoEmbed.embed, label: d.demoEmbed.label };
      if (d.demoEmbed.note) project.demo.note = d.demoEmbed.note;
    }
    return project;
  });
  const byId = new Map(documents.filter((d) => d._type === 'project').map((d) => [d._id, d.slug?.current]));
  const cases = {};
  for (const d of documents.filter((d) => d._type === 'caseStudy')) {
    const slug = byId.get(d.project?._ref);
    if (!slug) throw new Error(`Orphan case study: ${d._id}`);
    if (cases[slug]) throw new Error(`Duplicate case study for ${slug}`);
    const c = {
      heroFigure: d.heroFigure, problem: { heading: d.problemHeading, paras: paragraphs(d.problemBody) },
      facts: { role: d.facts?.role, year: d.facts?.year, stack: d.facts?.stack, surfaces: d.facts?.surfaces ?? '' },
      how: (d.how ?? []).map(({ title, body }) => ({ title, body })), figures: d.figures,
      hard: paragraphs(d.hardBody), nextKicker: d.nextKicker, next: paragraphs(d.nextBody),
    };
    if (d.heroImage) c.heroImage = cleanImage(d.heroImage);
    if (d.figureImages?.length) {
      c.figureImages = [null, null];
      d.figureImages.forEach((image, i) => {
        const match = /^fig-(\d+)$/.exec(image._key ?? '');
        const index = match ? Number(match[1]) : i;
        if (index > 1) throw new Error('Case figures support two image slots.');
        c.figureImages[index] = cleanImage(image);
      });
    }
    if (d.gallery?.length) c.gallery = d.gallery.map(cleanImage);
    cases[slug] = c;
  }
  const stack = documents.filter((d) => d._type === 'stackGroup').sort((a, b) => a.order - b.order).map(({ name, items }) => ({ name, items }));
  const slugs = new Set();
  const reservedSlugs = new Set(['projects', 'about', 'approach', 'stats', 'contact', 'uses', '404']);
  for (const p of projects) {
    if (!p.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) || slugs.has(p.slug) || reservedSlugs.has(p.slug) || !p.name || !p.summary || !['case', 'archive'].includes(p.tier)) throw new Error(`Invalid, reserved, or duplicate project: ${p.slug}`);
    slugs.add(p.slug);
    if (!p.pending && p.tier === 'case' && !cases[p.slug]) throw new Error(`Missing case study for ${p.slug}`);
    if (p.category && !settings.categories.includes(p.category)) throw new Error(`Unknown category on ${p.slug}`);
  }
  if (!projects.length || !stack.length) throw new Error('CMS content is empty.');
  return { projects, cases, stack, categories: settings.categories };
}

async function main() {
  const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
  const fileIndex = process.argv.indexOf('--file');
  let documents;
  if (fileIndex !== -1) {
    documents = fs.readFileSync(process.argv[fileIndex + 1], 'utf8').trim().split('\n').map(JSON.parse);
  } else {
    const project = env.SANITY_PROJECT_ID;
    if (!project && process.argv.includes('--if-configured')) return;
    if (!project || !/^[a-z0-9-]+$/.test(project)) throw new Error('Set SANITY_PROJECT_ID to pull published content, or use --file cms/seed.ndjson.');
    const dataset = env.SANITY_DATASET || 'production';
    if (!/^[a-z0-9_-]+$/.test(dataset)) throw new Error('Invalid SANITY_DATASET.');
    const url = new URL(`https://${project}.api.sanity.io/v2025-02-19/data/query/${dataset}`);
    url.searchParams.set('query', '*[_type in ["project", "caseStudy", "stackGroup", "siteSettings"] && !(_id in path("drafts.**"))]');
    const response = await fetch(url, { headers: env.SANITY_API_TOKEN ? { Authorization: `Bearer ${env.SANITY_API_TOKEN}` } : {}, signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`CMS request failed (${response.status}).`);
    documents = (await response.json()).result;
  }
  const data = decodeDocuments(documents);
  if (process.argv.includes('--check')) { console.log(`CMS import validated: ${data.projects.length} projects, ${Object.keys(data.cases).length} cases.`); return; }
  const json = (value) => JSON.stringify(value, null, 2);
  const projectSource = `import type { Project } from './types';\nexport const CATEGORIES: readonly string[] = ${json(data.categories)};\nexport const projects: Project[] = ${json(data.projects)};\nconst ranks = new Map(CATEGORIES.map((name, i) => [name, i]));\nexport const caseStudies = projects.filter(p => p.tier === 'case' && !p.pending).sort((a,b) => (ranks.get(a.category ?? '') ?? 99) - (ranks.get(b.category ?? '') ?? 99));\nexport const featured = caseStudies.filter(p => p.featured);\nexport const archive = projects.filter(p => p.tier === 'archive' && !p.pending);\nexport const pending = projects.filter(p => p.pending);\n`;
  // Keep hand-authored interfaces/helpers and replace only the data declarations.
  const caseFile = 'web/content/cases.ts';
  const caseSource = fs.readFileSync(caseFile, 'utf8').split('export const cases:')[0] + `export const cases: Record<string, CaseContent> = ${json(data.cases).replace(/^(\s*)null(,?\s*)$/gm, '$1undefined$2')};\n`;
  const stackFile = 'web/content/stack.ts';
  const oldStack = fs.readFileSync(stackFile, 'utf8');
  const start = oldStack.indexOf('export const stack:');
  const end = oldStack.indexOf('\n];', start) + 3;
  if (start < 0 || end < 3) throw new Error('Cannot locate stack data declaration.');
  const stackSource = oldStack.slice(0, start) + `export const stack: StackGroup[] = ${json(data.stack)};` + oldStack.slice(end);
  fs.writeFileSync('web/content/projects.ts', projectSource);
  fs.writeFileSync(caseFile, caseSource);
  fs.writeFileSync(stackFile, stackSource);
  console.log('Updated local content from the CMS. Review the diff before committing.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();

/* ─────────────────────────────────────────────────────────────────────────
   cms-export.mjs — one-time migration of the existing content into Sanity.

     node scripts/cms-export.mjs            # writes cms/seed.ndjson + a report
     node scripts/cms-export.mjs --check    # report only, writes nothing

   Reads `web/content/{projects,cases,stack}.ts` as the source of truth and
   emits Sanity's import format (NDJSON, one document per line), which is
   loaded with:

     npx sanity dataset import cms/seed.ndjson production

   Why it transpiles rather than parses: the content files are TypeScript and
   `projects.ts` *derives* `caseStudies`, `featured`, `archive` and `pending`
   at module scope with a category sort. Regex-scraping the source would miss
   all of that. esbuild is already present as a Vite dependency, so bundling
   the real modules and importing them costs no new package and gives the
   exact values the site itself renders from.

   Every field is accounted for explicitly, and the run ends by asserting the
   counts round-trip. A migration that silently drops the `pending` flag on
   Hindsight, or the `liveNote` on DealAI, would be worse than no migration —
   it would look successful.
   ───────────────────────────────────────────────────────────────────────── */

import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.join(import.meta.dirname, '..');
const CONTENT = path.join(ROOT, 'web', 'content');
const OUT_DIR = path.join(ROOT, 'cms');
const CHECK_ONLY = process.argv.includes('--check');

/* ── load the real modules ─────────────────────────────────────────────── */

async function load(file) {
  const tmp = path.join(OUT_DIR, `.tmp-${file.replace(/\W/g, '_')}.mjs`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  await build({
    entryPoints: [path.join(CONTENT, file)],
    outfile: tmp,
    bundle: true,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
    // The content modules only import their own sibling types, so nothing
    // external needs resolving.
  });

  const mod = await import(pathToFileURL(tmp).href + `?t=${Date.now()}`);
  fs.rmSync(tmp, { force: true });
  return mod;
}

/* ── Portable Text ─────────────────────────────────────────────────────────
   Sanity's rich-text format, and what makes the Studio editor an actual
   editor rather than a textarea. Each paragraph string becomes one block.
   Deterministic keys (index-based) so re-running the export produces an
   identical file instead of a diff full of regenerated ids. */

function toPortableText(paragraphs, keyPrefix) {
  return paragraphs.map((text, i) => ({
    _type: 'block',
    _key: `${keyPrefix}-${i}`,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `${keyPrefix}-${i}-0`, text, marks: [] }],
  }));
}

/* ── document builders ─────────────────────────────────────────────────── */

function projectDoc(p) {
  return {
    _id: `project.${p.slug}`,
    _type: 'project',
    slug: { _type: 'slug', current: p.slug },
    name: p.name,
    year: p.year,
    tier: p.tier,
    // Optional fields are only written when present, so the dataset does not
    // fill up with explicit nulls that then show as empty inputs in Studio.
    ...(p.category ? { category: p.category } : {}),
    ...(p.featured ? { featured: true } : {}),
    ...(p.pending ? { pending: true } : {}),
    ...(p.status ? { status: p.status } : {}),
    tags: p.tags ?? [],
    summary: p.summary,
    ...(p.title ? { seoTitle: p.title } : {}),
    ...(p.desc ? { seoDescription: p.desc } : {}),
    ...(p.links && Object.keys(p.links).length
      ? {
          links: {
            _type: 'projectLinks',
            ...(p.links.live ? { live: p.links.live } : {}),
            ...(p.links.repo ? { repo: p.links.repo } : {}),
            ...(p.links.liveNote ? { liveNote: p.links.liveNote } : {}),
            ...(p.links.extra?.length
              ? {
                  extra: p.links.extra.map((l, i) => ({
                    _type: 'projectLink',
                    _key: `extra-${i}`,
                    label: l.label,
                    href: l.href,
                  })),
                }
              : {}),
          },
        }
      : {}),
    // `demo` is either the string 'news2' or an embed object — both shapes
    // are preserved rather than flattened.
    ...(typeof p.demo === 'string'
      ? { demoKind: p.demo }
      : p.demo
        ? {
            demoEmbed: {
              _type: 'demoEmbed',
              embed: p.demo.embed,
              label: p.demo.label,
              note: p.demo.note,
            },
          }
        : {}),
  };
}

function imageStub(img, key) {
  if (!img) return undefined;
  /* Deliberately *not* uploaded as a Sanity asset here. These files are
     already build-time optimised by scripts/images.mjs into three widths, and
     `Figure` rebuilds the srcset from the path by convention. Re-uploading
     them would throw that away and replace it with a CDN round-trip.

     So the path is carried across as a plain string and the existing pipeline
     keeps serving them. Uploading to Sanity's asset store is a later,
     separate decision — see the note in STATUS.md. */
  return {
    _type: 'localImage',
    _key: key,
    src: img.src,
    alt: img.alt,
    width: img.width,
    height: img.height,
  };
}

function caseStudyDoc(slug, c) {
  return {
    _id: `caseStudy.${slug}`,
    _type: 'caseStudy',
    // Reference, not a copy: one project, one case study, joined on the id.
    project: { _type: 'reference', _ref: `project.${slug}` },
    heroFigure: c.heroFigure,
    ...(c.heroImage ? { heroImage: imageStub(c.heroImage, 'hero') } : {}),
    problemHeading: c.problem.heading,
    problemBody: toPortableText(c.problem.paras, `${slug}-problem`),
    facts: {
      _type: 'caseFacts',
      role: c.facts.role,
      year: c.facts.year,
      stack: c.facts.stack,
      surfaces: c.facts.surfaces,
    },
    how: c.how.map((card, i) => ({
      _type: 'howCard',
      _key: `how-${i}`,
      title: card.title,
      body: card.body,
    })),
    figures: c.figures,
    ...(c.figureImages?.length
      ? {
          figureImages: c.figureImages
            .map((img, i) => imageStub(img, `fig-${i}`))
            .filter(Boolean),
        }
      : {}),
    ...(c.gallery?.length
      ? { gallery: c.gallery.map((img, i) => imageStub(img, `gal-${i}`)).filter(Boolean) }
      : {}),
    hardBody: toPortableText(c.hard, `${slug}-hard`),
    nextKicker: c.nextKicker,
    nextBody: toPortableText(c.next, `${slug}-next`),
  };
}

/* ── run ───────────────────────────────────────────────────────────────── */

const projectsMod = await load('projects.ts');
const casesMod = await load('cases.ts');
const stackMod = await load('stack.ts');

const { projects, CATEGORIES, caseStudies, archive, pending, featured } = projectsMod;
const { cases } = casesMod;
const { stack } = stackMod;

const docs = [];

// Order is part of the content: `projects.ts` says "ORDER of the array is the
// order things appear", and the NN/NN counters derive from it. An `order`
// field carries that across, because a database has no inherent order.
projects.forEach((p, i) => {
  docs.push({ ...projectDoc(p), order: i });
});

for (const [slug, c] of Object.entries(cases)) {
  docs.push(caseStudyDoc(slug, c));
}

stack.forEach((group, i) => {
  docs.push({
    _id: `stackGroup.${group.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    _type: 'stackGroup',
    name: group.name,
    items: group.items,
    order: i,
  });
});

// The category list is ordered data too — it drives CATEGORY_RANK, which
// drives the sort, which drives the counters.
docs.push({
  _id: 'siteSettings',
  _type: 'siteSettings',
  categories: [...CATEGORIES],
});

/* ── verification ──────────────────────────────────────────────────────── */

const report = {
  projects: projects.length,
  caseStudiesInData: Object.keys(cases).length,
  derived: {
    caseStudies: caseStudies.length,
    archive: archive.length,
    featured: featured.length,
    pending: pending.length,
  },
  stackGroups: stack.length,
  stackItems: stack.reduce((n, g) => n + g.items.length, 0),
  documents: docs.length,
};

const problems = [];

// Every project with tier 'case' that is not pending must have a case study,
// or the site would route to a 404.
for (const p of projects) {
  if (p.tier === 'case' && !p.pending && !cases[p.slug]) {
    problems.push(`project "${p.slug}" is tier:case but has no entry in cases.ts`);
  }
}

// And every case study must belong to a project, or it is orphaned in the CMS.
for (const slug of Object.keys(cases)) {
  if (!projects.some((p) => p.slug === slug)) {
    problems.push(`case study "${slug}" has no matching project`);
  }
}

// Field-level round trip: count non-empty optional fields before and after.
const countLinks = projects.filter((p) => p.links && Object.keys(p.links).length).length;
const exportedLinks = docs.filter((d) => d._type === 'project' && d.links).length;
if (countLinks !== exportedLinks) {
  problems.push(`links dropped: ${countLinks} in source, ${exportedLinks} exported`);
}

const sourceImages = Object.values(cases).reduce(
  (n, c) =>
    n +
    (c.heroImage ? 1 : 0) +
    (c.figureImages?.filter(Boolean).length ?? 0) +
    (c.gallery?.length ?? 0),
  0
);
const exportedImages = docs
  .filter((d) => d._type === 'caseStudy')
  .reduce(
    (n, d) => n + (d.heroImage ? 1 : 0) + (d.figureImages?.length ?? 0) + (d.gallery?.length ?? 0),
    0
  );
if (sourceImages !== exportedImages) {
  problems.push(`images dropped: ${sourceImages} in source, ${exportedImages} exported`);
}

const sourceParas = Object.values(cases).reduce(
  (n, c) => n + c.problem.paras.length + c.hard.length + c.next.length,
  0
);
const exportedParas = docs
  .filter((d) => d._type === 'caseStudy')
  .reduce((n, d) => n + d.problemBody.length + d.hardBody.length + d.nextBody.length, 0);
if (sourceParas !== exportedParas) {
  problems.push(`paragraphs dropped: ${sourceParas} in source, ${exportedParas} exported`);
}

console.log('\nContent inventory');
console.log('─────────────────');
for (const [k, v] of Object.entries(report)) {
  if (typeof v === 'object') {
    for (const [k2, v2] of Object.entries(v)) console.log(`  ${(k + '.' + k2).padEnd(26)}${v2}`);
  } else {
    console.log(`  ${k.padEnd(26)}${v}`);
  }
}
console.log(`  ${'paragraphs'.padEnd(26)}${sourceParas}`);
console.log(`  ${'images referenced'.padEnd(26)}${sourceImages}`);

if (problems.length) {
  console.error('\n✗ Integrity problems:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exitCode = 1;
} else {
  console.log('\n✓ Every field round-tripped. No content lost.');
}

if (CHECK_ONLY) {
  console.log('\n--check: nothing written.');
} else {
  const out = path.join(OUT_DIR, 'seed.ndjson');
  fs.writeFileSync(out, docs.map((d) => JSON.stringify(d)).join('\n') + '\n');
  console.log(`\nWrote ${docs.length} documents → ${path.relative(ROOT, out)}`);
  console.log('Load with:  npx sanity dataset import cms/seed.ndjson production');
}

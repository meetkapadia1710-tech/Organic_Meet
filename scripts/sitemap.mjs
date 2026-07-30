/* ─────────────────────────────────────────────────────────────────────────
   sitemap.mjs — emit sitemap.xml and robots.txt into web/public.

     node scripts/sitemap.mjs

   Runs as part of `npm run build`, before Vite, so the two files are copied
   out of `web/public` like any other static asset.

   The URL list is *derived*, never typed: the fixed routes come from the
   router's own path list and the case-study URLs are read out of
   content/projects.ts. A sitemap maintained by hand is a sitemap that is
   wrong within a month — the whole failure mode is that it silently keeps
   advertising a page that moved.

   ⚠️ SET THE DOMAIN. `VITE_SITE_URL` is the single place the canonical origin
   is defined (see web/content/site.ts). Until it is set to the real
   production domain, this script refuses to write a sitemap rather than
   publishing one full of placeholder URLs — a wrong sitemap is worse than
   none, because search engines act on it.
   ───────────────────────────────────────────────────────────────────────── */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const PUBLIC = path.join(ROOT, 'web', 'public');
const PROJECTS = path.join(ROOT, 'web', 'content', 'projects.ts');

/* Kept in step with router.tsx by hand — it is six strings, and importing a
   .tsx router into a build script to read them would mean standing up JSX
   compilation for no gain. If a route is added there, add it here. */
const FIXED = ['/', '/projects', '/approach', '/stats', '/contact', '/about', '/uses'];

const SITE_URL = (process.env['VITE_SITE_URL'] ?? '').trim().replace(/\/+$/, '');

/* Parsed rather than imported, for the same reason as the routes above.
   `pending: true` entries are known about but deliberately not shown, so they
   must not be advertised — and the count is asserted below, because a regex
   that silently matches nothing would emit a sitemap containing only the
   fixed routes and look like it worked. */
function readSlugs() {
  const src = fs.readFileSync(PROJECTS, 'utf8');
  const blocks = src.split(/\n {2}\{/);
  const slugs = [];
  let pending = 0;

  for (const block of blocks) {
    const match = /slug:\s*'([^']+)'/.exec(block);
    if (!match) continue;
    if (/pending:\s*true/.test(block)) {
      pending += 1;
      continue;
    }
    slugs.push(match[1]);
  }
  return { slugs, pending };
}

const { slugs, pending } = readSlugs();

if (slugs.length < 5) {
  console.error(
    `sitemap: only ${slugs.length} project slugs parsed out of projects.ts — that is far too few.\n` +
      'The file shape probably changed. Fix readSlugs() rather than shipping a partial sitemap.'
  );
  process.exit(1);
}

if (!SITE_URL || !/^https?:\/\//.test(SITE_URL)) {
  console.warn(
    '\nsitemap: VITE_SITE_URL is not set to an absolute URL, so no sitemap.xml was written.\n' +
      '         Set it to the production origin (e.g. https://meetkapadia.com) and rebuild.\n' +
      '         robots.txt is still written, without a Sitemap: line.\n'
  );
}

const today = new Date().toISOString().slice(0, 10);

/* Priorities are relative, and only meaningful against each other: the home
   page above the section pages, the section pages above individual case
   studies. Nothing here claims a change frequency — it is advisory only, and
   every major crawler has said for years that it ignores it. */
const priority = (url) => (url === '/' ? '1.0' : url.startsWith('/') && FIXED.includes(url) ? '0.8' : '0.6');

const urls = [...FIXED, ...slugs.map((s) => `/${s}`)];

if (SITE_URL) {
  const body = urls
    .map(
      (url) =>
        `  <url>\n    <loc>${SITE_URL}${url === '/' ? '/' : url}</loc>\n` +
        `    <lastmod>${today}</lastmod>\n    <priority>${priority(url)}</priority>\n  </url>`
    )
    .join('\n');

  fs.writeFileSync(
    path.join(PUBLIC, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
  );
}

/* Everything is public and indexable; there is no admin surface on this site
   and nothing behind a login. The only reason robots.txt exists is to carry
   the sitemap reference and to answer the request explicitly rather than
   with a 404 that some crawlers treat as a soft error. */
fs.writeFileSync(
  path.join(PUBLIC, 'robots.txt'),
  `User-agent: *\nAllow: /\n` + (SITE_URL ? `\nSitemap: ${SITE_URL}/sitemap.xml\n` : '')
);

console.log(
  `sitemap: ${urls.length} URLs (${FIXED.length} fixed + ${slugs.length} case studies` +
    `${pending ? `, ${pending} pending skipped` : ''})` +
    `${SITE_URL ? ` → ${SITE_URL}` : ' — sitemap.xml skipped, no VITE_SITE_URL'}`
);

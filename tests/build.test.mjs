import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadContent } from '../scripts/load-content.mjs';
import { decodeDocuments } from '../scripts/cms-import.mjs';
import { siteConfig } from '../scripts/site-config.mjs';

const content = await loadContent();
const { siteUrl, base } = siteConfig();
test('every published project has exactly one case and a safe route', () => {
  assert.equal(new Set(content.projects.map((p) => p.slug)).size, content.projects.length);
  for (const p of content.caseStudies) assert.ok(content.cases[p.slug], p.slug);
  for (const slug of Object.keys(content.cases)) assert.ok(content.projects.some((p) => p.slug === slug), slug);
});
test('project slideshow screenshots have responsive preview files', () => {
  for (const project of content.caseStudies) {
    const entry = content.cases[project.slug];
    const images = [entry.heroImage, ...(entry.figureImages ?? []), ...(entry.gallery ?? [])].filter(Boolean);
    for (const image of images) {
      if (!image.src.endsWith('.webp')) continue;
      assert.ok(fs.existsSync(`web/public${image.src.replace(/\.webp$/, '-800.webp')}`), `${project.slug}: missing preview for ${image.src}`);
    }
  }
});
test('all published pages contain content, canonical metadata, and working local assets', () => {
  const pages = ['/', ...Object.keys(content.ROUTE_META).filter((p) => p !== '/'), ...content.caseStudies.map((p) => `/${p.slug}`)];
  const sitemap = fs.readFileSync('site-react/sitemap.xml', 'utf8');
  for (const page of pages) {
    const html = fs.readFileSync(page === '/' ? 'site-react/index.html' : `site-react${page}/index.html`, 'utf8');
    assert.match(html, /<h1\b/);
    assert.ok(html.includes(`<link rel="canonical" href="${siteUrl}${page === '/' ? '/' : page}">`), page);
    assert.match(html, /name="twitter:image"/);
    assert.match(html, /property="og:image" content="https:\/\//);
    assert.ok(!html.includes('example.test'));
    for (const match of html.matchAll(/(?:src|href)="(\/[^"#?]*)"/g)) {
      if (match[1].startsWith('//')) continue;
      assert.ok(match[1].startsWith(base), `${page}: asset outside base path: ${match[1]}`);
      const file = `site-react/${match[1].slice(base.length)}`;
      assert.ok(fs.existsSync(file) || fs.existsSync(`${file}/index.html`), `${page}: ${match[1]}`);
    }
    assert.ok(sitemap.includes(`${siteUrl}${page === '/' ? '/' : page}<`));
  }
  for (const p of content.pending) assert.ok(!sitemap.includes(`/${p.slug}<`));
  assert.ok(!sitemap.includes('/locateme'));
});
test('404 is index-excluded and contact CTA links to a real page', () => {
  const html = fs.readFileSync('site-react/404.html', 'utf8');
  assert.match(html, /name="robots" content="noindex, follow"/);
  assert.ok(!html.includes('rel="canonical"'));
  assert.ok(html.includes(`href="${base}contact"`));
});
test('CMS seed round trip preserves data, previews and optional image positions', () => {
  const documents = fs.readFileSync('cms/seed.ndjson', 'utf8').trim().split('\n').map(JSON.parse);
  const decoded = decodeDocuments(documents);
  for (const p of content.projects) {
    const actual = decoded.projects.find((item) => item.slug === p.slug);
    const expected = { ...p };
    if (expected.links && !Object.keys(expected.links).length) delete expected.links;
    assert.deepEqual(actual, expected);
  }
  assert.deepEqual(Object.keys(decoded.cases).sort(), Object.keys(content.cases).sort());
  for (const [slug, expected] of Object.entries(content.cases)) {
    const actual = decoded.cases[slug];
    if (actual.figureImages) actual.figureImages = actual.figureImages.map((image) => image ?? undefined);
    assert.deepEqual(actual, expected, slug);
  }
  const invalid = structuredClone(documents);
  invalid.find((d) => d._type === 'project').slug.current = 'about';
  assert.throws(() => decodeDocuments(invalid), /reserved/);
});

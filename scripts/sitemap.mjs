import fs from 'node:fs';
import { loadContent } from './load-content.mjs';
import { siteConfig } from './site-config.mjs';

const { siteUrl } = siteConfig();
const { ROUTE_META, caseStudies } = await loadContent();
const output = 'site-react';
fs.mkdirSync(output, { recursive: true });
const sitemap = `${output}/sitemap.xml`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
if (!siteUrl) {
  fs.rmSync(sitemap, { force: true });
  console.warn('No site URL configured: omitted sitemap and canonical URLs.');
} else {
  const routes = [...Object.keys(ROUTE_META), ...caseStudies.map((p) => `/${p.slug}`)];
  const body = routes.map((route) => `  <url><loc>${esc(`${siteUrl}${route === '/' ? '/' : route}`)}</loc></url>`).join('\n');
  fs.writeFileSync(sitemap, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
  console.log(`Sitemap: ${routes.length} public URLs at ${siteUrl}`);
}
fs.writeFileSync(`${output}/robots.txt`, `User-agent: *\nAllow: /\n${siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml\n` : ''}`);

import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';
import { loadContent } from './load-content.mjs';
import { siteConfig } from './site-config.mjs';

const { siteUrl, base } = siteConfig();
const { ROUTE_META, caseStudies, cases } = await loadContent();
const bundle = await build({
  entryPoints: ['web/prerender.tsx'], bundle: true, format: 'esm', platform: 'node', write: false,
  packages: 'external', jsx: 'automatic',
  define: { 'import.meta.env': JSON.stringify({ BASE_URL: base, VITE_SITE_URL: siteUrl }) },
});
const temp = path.resolve('.prerender.mjs');
fs.writeFileSync(temp, bundle.outputFiles[0].text);
const esc = (value) => value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
try {
  const { render } = await import(new URL(`../.prerender.mjs?t=${Date.now()}`, import.meta.url));
  const shell = fs.readFileSync('site-react/index.html', 'utf8');
  const routes = [
    ...Object.entries(ROUTE_META).map(([route, meta]) => ({ route, ...meta })),
    ...caseStudies.map((p) => ({ route: `/${p.slug}`, title: p.title ?? p.name, description: p.desc ?? p.summary, image: p.preview ?? cases[p.slug]?.heroImage?.src })),
    { route: '/404', title: 'Page not found', description: 'That page does not exist.', noindex: true },
  ];
  for (const item of routes) {
    const title = item.title === 'Meet Kapadia' ? item.title : `${item.title} — Meet Kapadia`;
    const image = item.image ?? '/og.png';
    const imageUrl = /^https?:\/\//.test(image) ? image : siteUrl ? `${siteUrl}${image}` : `${base}${image.slice(1)}`;
    const url = siteUrl ? `${siteUrl}${item.route === '/' ? '/' : item.route}` : '';
    let html = shell.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(title)}</title>`)
      .replace(/<meta (?:name="description"|property="og:(?:title|description|image)")[^>]*>/g, '')
      .replace('<div id="root"></div>', () => `<div id="root">${render(item.route)}</div>`);
    const tags = [
      ['name', 'description', item.description], ['property', 'og:title', title], ['property', 'og:description', item.description],
      ['property', 'og:image', imageUrl], ['name', 'twitter:title', title], ['name', 'twitter:description', item.description],
      ['name', 'twitter:image', imageUrl], ['name', 'robots', item.noindex ? 'noindex, follow' : 'index, follow'],
      ...(!item.noindex && url ? [['property', 'og:url', url]] : []),
    ].map(([attr, key, value]) => `<meta ${attr}="${key}" content="${esc(value)}">`).join('\n');
    html = html.replace('</head>', () => `${tags}\n${!item.noindex && url ? `<link rel="canonical" href="${esc(url)}">\n` : ''}<noscript><style>[data-reveal],.wi,.split>span{opacity:1!important;transform:none!important}.scramble-live{display:none}.scramble-size{visibility:visible!important}#preloader{display:none!important}</style></noscript>\n</head>`);
    const file = item.route === '/' ? 'site-react/index.html' : item.noindex ? 'site-react/404.html' : `site-react${item.route}/index.html`;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
  }
  console.log(`Prerendered ${routes.length} pages, including the 404 fallback.`);
} finally { fs.rmSync(temp, { force: true }); }

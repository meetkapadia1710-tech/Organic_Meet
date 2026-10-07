import { loadEnv } from 'vite';

export function siteConfig(root = process.cwd()) {
  const env = { ...loadEnv('production', root, ''), ...process.env };
  const raw = env.VITE_SITE_URL || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : '');
  let siteUrl = '';
  if (raw) {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.hostname === 'example.test') {
      throw new Error('VITE_SITE_URL must be a real HTTP(S) site URL without credentials, query, or hash.');
    }
    siteUrl = url.href.replace(/\/+$/, '');
  }
  const base = env.VITE_BASE_PATH || (siteUrl ? new URL(siteUrl).pathname : '/');
  if (!base.startsWith('/') || base.includes('..') || /[?#\\]/.test(base)) throw new Error('VITE_BASE_PATH must be an absolute URL path.');
  return { siteUrl, base: `${base.replace(/\/+$/, '')}/` };
}

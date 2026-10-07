import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { SITE_URL } from '../content/site';
import { assetUrl } from '../lib/assets';

/* A single-page app keeps whatever <title> and description index.html shipped
   with, so every route looked identical to a browser tab, a bookmark, a
   history entry, a shared link and a screen reader announcing the page. The
   static build wrote these per page; this restores that.

   og:title / og:description are updated too. Crawlers that don't run JS still
   won't see them — that's the SPA trade-off, and the prerender step is the
   real answer — but anything that does (and every human-facing surface) gets
   the right values. */

const AUTHOR = 'Meet Kapadia';
/** The fallback og:image, set in index.html. Restored when a per-page
 *  image is not provided so navigating back to a non-case page resets
 *  the tag rather than keeping the last case study's screenshot. */
const DEFAULT_OG_IMAGE = '/og.png';

function setMeta(selector: string, attribute: string, value: string): void {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    const match = /\[(name|property)="([^"]+)"\]/.exec(selector);
    if (match) tag.setAttribute(match[1]!, match[2]!);
    document.head.appendChild(tag);
  }
  tag.setAttribute(attribute, value);
}

export function useDocumentMeta(title: string, description: string, image?: string): void {
  const { pathname } = useLocation();
  useEffect(() => {
    const notFound = title === 'Page not found';
    const full = title === AUTHOR ? title : `${title} — ${AUTHOR}`;
    document.title = full;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', full);
    setMeta('meta[property="og:description"]', 'content', description);
    /* Use the per-page screenshot when available (case studies); fall back
       to the global og.png for every other route. */
    const imagePath = image ?? DEFAULT_OG_IMAGE;
    const absoluteImage = SITE_URL && imagePath.startsWith('/') ? `${SITE_URL}${imagePath}` : assetUrl(imagePath);
    setMeta('meta[property="og:image"]', 'content', absoluteImage);
    setMeta('meta[name="twitter:title"]', 'content', full);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]', 'content', absoluteImage);
    setMeta('meta[name="robots"]', 'content', notFound ? 'noindex, follow' : 'index, follow');
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (SITE_URL && !notFound) {
      const url = `${SITE_URL}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}`;
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
      canonical.href = url;
      setMeta('meta[property="og:url"]', 'content', url);
    } else {
      canonical?.remove();
      document.head.querySelector('meta[property="og:url"]')?.remove();
    }
  }, [title, description, image, pathname]);
}

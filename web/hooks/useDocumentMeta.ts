import { useEffect } from 'react';

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
  const tag = document.head.querySelector(selector);
  if (tag) tag.setAttribute(attribute, value);
}

export function useDocumentMeta(title: string, description: string, image?: string): void {
  useEffect(() => {
    const full = title === AUTHOR ? title : `${title} — ${AUTHOR}`;
    document.title = full;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', full);
    setMeta('meta[property="og:description"]', 'content', description);
    /* Use the per-page screenshot when available (case studies); fall back
       to the global og.png for every other route. */
    setMeta('meta[property="og:image"]', 'content', image ?? DEFAULT_OG_IMAGE);
  }, [title, description, image]);
}

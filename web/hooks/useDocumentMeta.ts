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

function setMeta(selector: string, attribute: string, value: string): void {
  const tag = document.head.querySelector(selector);
  if (tag) tag.setAttribute(attribute, value);
}

export function useDocumentMeta(title: string, description: string): void {
  useEffect(() => {
    const full = title === AUTHOR ? title : `${title} — ${AUTHOR}`;
    document.title = full;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', full);
    setMeta('meta[property="og:description"]', 'content', description);
  }, [title, description]);
}

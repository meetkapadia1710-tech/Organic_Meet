/* ─────────────────────────────────────────────────────────────────────────
   CaseToc — the contents bar on a case study.

   Three jobs in one strip, which is the point: it is already the element that
   says where you are, so position, progress and navigation belong together
   rather than as three separate indicators competing for the same page.

   - **Sticky.** A case study is long and the contents were previously a bar
     you scrolled past once and never saw again.
   - **A progress line** across its top edge, measuring the *article* — first
     section heading to the end of the last one — not the document. The
     global `#progress` bar already measures the document; a second copy of
     that would be noise, and the useful number on a long read is how much of
     the piece is left, not how much of the page.
   - **A marker that slides** between sections instead of four borders
     recolouring in place.

   Why `.toc-wrap` is the sticky element and not `.toc`: sticky is bounded by
   its containing block, and the section wrapping the contents is only as tall
   as the contents. Sticking the inner nav would unstick it a pixel later. The
   section itself has the page as its containing block, so it can travel.

   The marker is opt-in through `.has-marker`, added only once JS has measured
   something. Without it the original per-item active border is untouched —
   which is also exactly what reduced motion falls back to.
   ───────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from 'react';

export interface TocSection {
  id: string;
  label: string;
}

/** Scroll-spy over the sections, pinned near the top of the viewport rather
 *  than the middle so the highlight matches what's being read. */
function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!targets.length) return;

    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting));
        setActive(targets.find((t) => visible.get(t.id))?.id ?? null);
      },
      { rootMargin: '-96px 0px -65% 0px' }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [ids.join('|')]);

  return active;
}

export function CaseToc({ sections, readingMinutes }: { sections: TocSection[]; readingMinutes: number }) {
  const active = useActiveSection(sections.map((s) => s.id));
  const listRef = useRef<HTMLUListElement>(null);
  const wrapRef = useRef<HTMLElement>(null);
  const [marker, setMarker] = useState(false);

  /* Marker geometry. Re-measured when the active section changes and on
     resize — never per frame. The list scrolls horizontally on narrow
     screens, so the marker is a child of the list and positioned in its
     content box; it then scrolls with the items rather than detaching from
     them. */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const list = listRef.current;
    if (!list) return;

    const place = () => {
      const el = list.querySelector<HTMLElement>('a.is-active');
      if (!el) return;
      list.style.setProperty('--toc-x', `${el.offsetLeft}px`);
      list.style.setProperty('--toc-w', `${el.offsetWidth}px`);
      setMarker(true);
    };

    place();
    window.addEventListener('resize', place, { passive: true });
    return () => window.removeEventListener('resize', place);
  }, [active, sections.length]);

  /* Publish the bar's real height so the sticky section kickers can pin
     directly below it.

     This was hardcoded first and it was wrong: the guess was 74px against an
     actual 104px, which stuck every kicker 30px *inside* the contents bar.
     The height is not guessable — the bar wraps to two lines on narrow
     viewports and the meta line changes with the reading time — so it is
     measured. Set synchronously on mount as well as observed, because a
     ResizeObserver's first delivery is a frame away and the kickers would
     otherwise pin to the fallback for that frame. */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const publish = () => {
      document.documentElement.style.setProperty('--toc-h', `${Math.round(wrap.getBoundingClientRect().height)}px`);
    };
    publish();

    if (typeof ResizeObserver !== 'function') return;
    const ro = new ResizeObserver(publish);
    ro.observe(wrap);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty('--toc-h');
    };
  }, []);

  /* Reading progress, 0 to 1, across the span of the article's own sections.
     rAF-throttled and written as a custom property so the fill is a compositor
     transform rather than a layout-affecting width. */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const wrap = wrapRef.current;
    const first = document.getElementById(sections[0]?.id ?? '');
    const last = document.getElementById(sections[sections.length - 1]?.id ?? '');
    if (!wrap || !first || !last) return;

    let pending = false;
    const frame = () => {
      pending = false;
      const start = first.getBoundingClientRect().top + window.scrollY;
      // The last heading is a heading, not the end of its prose — give it a
      // viewport of run-out so the bar does not fill while text remains.
      const end = last.getBoundingClientRect().top + window.scrollY + window.innerHeight;
      const span = Math.max(1, end - start);
      const read = (window.scrollY + window.innerHeight * 0.5 - start) / span;
      wrap.style.setProperty('--read', String(Math.min(1, Math.max(0, read))));
    };
    const onScroll = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(frame);
    };

    frame();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sections]);

  return (
    <section className="toc-wrap" ref={wrapRef}>
      <nav className="toc" aria-label="On this page">
        <div className="toc-meta">On this page · {readingMinutes} min read</div>
        <ul className={`toc-list${marker ? ' has-marker' : ''}`} ref={listRef}>
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className={active === section.id ? 'is-active' : undefined}>
                {section.label}
              </a>
            </li>
          ))}
          {/* An <li> rather than a bare <span>: only <li> is valid directly
              inside <ul>, and it is taken out of flow so it claims no grid
              column. */}
          <li className="toc-marker" aria-hidden="true" />
        </ul>
      </nav>
    </section>
  );
}

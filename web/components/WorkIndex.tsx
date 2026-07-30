/* ─────────────────────────────────────────────────────────────────────────
   WorkIndex — the pinned counter beside Selected Works.

   Shows which of the five featured projects is currently under the reading
   line, cross-fading `01 → 02 → 03` as the rows pass. The number uses the
   same mask reveal as every other headline here, so the digit rides up out of
   a clip rather than swapping.

   **It lives in the section's own sticky header (`.works-head`), not in a
   rail and not in a fixed badge.** Both of those were built first and both
   were wrong for the same reason: this is a full-width list, so anything
   floating beside or over it eventually crosses a row title.

   - A left rail wants ~225px of margin; a centred 1400px column leaves ~128px
     at this viewport, and the indicator measured overlapping rows at x=257.
   - A fixed bottom-left pill needs no margin, but being fixed it travels
     straight across the rows as they scroll past — it landed on top of the
     "AI Text Detector" title, which reads as a bug rather than as layering.

   The sticky header has neither problem: it is already full-width and still
   in the flow, so nothing can collide with it, and rows passing beneath are
   masked by its own background. **If another indicator is ever added here,
   start with the header.**

   It only shows while the section is on screen.
   ───────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from 'react';
import type { Project } from '../content/types';

export function WorkIndex({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const section = host.current?.closest('section');
    const rows = section ? Array.from(section.querySelectorAll<HTMLElement>('.work')) : [];
    if (!rows.length || !section) return;

    /* Which row is active: the last one whose top has passed the reading
       line. A plain "is intersecting" test picks whichever row entered most
       recently, which flickers between two when both are on screen. */
    const line = () => window.innerHeight * 0.45;

    const rowObserver = new IntersectionObserver(
      () => {
        const y = line();
        let next = 0;
        rows.forEach((row, i) => {
          if (row.getBoundingClientRect().top <= y) next = i;
        });
        setActive(next);
      },
      // A tall stack of thresholds so the callback fires as rows travel, not
      // only when they cross an edge.
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '-10% 0px -40% 0px' }
    );
    rows.forEach((row) => rowObserver.observe(row));

    // The indicator only exists while the section does.
    const sectionObserver = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? false),
      { rootMargin: '-15% 0px -25% 0px' }
    );
    sectionObserver.observe(section);

    return () => {
      rowObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, [projects.length]);

  const current = projects[active];
  const label = String(active + 1).padStart(2, '0');

  return (
    <div ref={host} className={`workdex${visible ? ' is-on' : ''}`} aria-hidden="true">
      {/* Keyed so React remounts the digit and the mask reveal replays on
          every change, instead of mutating text in place. */}
      <span className="workdex-num" key={label}>
        {label}
      </span>
      <span className="workdex-rule" />
      <span className="workdex-name" key={current?.slug ?? active}>
        {current?.name ?? ''}
      </span>
      <span className="workdex-total">/ {String(projects.length).padStart(2, '0')}</span>
    </div>
  );
}

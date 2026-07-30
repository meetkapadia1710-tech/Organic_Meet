/* ─────────────────────────────────────────────────────────────────────────
   WorkIndex — the pinned counter beside Selected Works.

   Shows which of the five featured projects is currently under the reading
   line, cross-fading `01 → 02 → 03` as the rows pass. The number uses the
   same mask reveal as every other headline here, so the digit rides up out of
   a clip rather than swapping.

   **Fixed, not `position: sticky` in a rail.** A sticky column is the more
   obvious build, but it needs the works section to become a two-column grid —
   and those rows already carry a tuned three-breakpoint layout
   (`.g-work` at 720px and 1100px, plus a stacked mobile case). Restructuring
   that to hang an indicator off the side risks the thing the indicator is
   pointing at. Fixed positioning gets the same effect with zero layout
   impact: nothing reflows, no breakpoint moves.

   It only exists while the section is on screen, and only on viewports with
   room to spare beside a 1400px column.
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

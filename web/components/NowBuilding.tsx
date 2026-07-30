/* "Currently building" — the one thing on a portfolio hero that dates itself
   the moment it is written by hand.

   So it isn't written by hand. It reads the projects marked
   `status: 'In progress'` and cycles them. Finish one, change its status in
   projects.ts, and this follows; there is no second place to remember.

   It cycles rather than listing all three because the hero has one line of
   room, and a list of three would compete with the headline for it.

   The rotation is a timer, which this site is otherwise careful about — a
   ticking clock was removed from this page for re-rendering it once a
   second. The difference is the interval: this changes every six seconds,
   only while the tab is visible, and it re-renders one span rather than the
   page. Under reduced motion it does not rotate at all and simply names the
   first one. */

import { useEffect, useState } from 'react';
import { caseStudies } from '../content/projects';

const ROTATE_MS = 6000;

const BUILDING = caseStudies.filter((p) => p.status === 'In progress');

export function NowBuilding() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (BUILDING.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = window.setInterval(() => {
      // A background tab should not be advancing a carousel nobody is
      // looking at — it would come back showing a random entry.
      if (document.hidden) return;
      setI((n) => (n + 1) % BUILDING.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  if (!BUILDING.length) return null;
  const project = BUILDING[i] ?? BUILDING[0];
  if (!project) return null;

  return (
    <span className="now-building">
      <span className="now-building-kicker">Currently building</span>
      {/* Keyed so React swaps the element and the entrance replays, rather
          than mutating text in place. */}
      <span className="now-building-name" key={project.slug}>
        {project.name}
      </span>
    </span>
  );
}

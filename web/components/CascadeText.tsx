/* ─────────────────────────────────────────────────────────────────────────
   CascadeText — letters lift in sequence when the row is hovered.

   Used on the work-row titles, which are the centrepiece of the site. The
   whole effect is a 22ms-per-letter delay on a small translate; the restraint
   is the point, because these titles are set at 42px and anything larger than
   a few pixels reads as the row falling apart.

   The parent drives it, not this component: the CSS hook is
   `.work:hover .casc-char`, so hovering anywhere on the row — the summary,
   the year, the tags — cascades the title. Requiring the pointer to be over
   the glyphs themselves would make it feel broken.

   **This element carries `view-transition-name`.** The h2 it lives in morphs
   into the case-study headline across a navigation, so the split spans had to
   be checked against that: the browser snapshots the element as painted, and
   inline-block children with a 2px transform do not change its box. Verified
   the morph still runs after this shipped.

   Accessibility: per-letter spans make some screen readers spell words out,
   so the split is `aria-hidden` and the real string sits in an `.sr-only`
   span — which is also what gives the heading its accessible name.
   ───────────────────────────────────────────────────────────────────────── */

import { useMemo } from 'react';

/** Caps the wave so a long title does not finish a third of a second after
 *  it starts. */
const MAX_STEPS = 14;

export function CascadeText({ children }: { children: string }) {
  const chars = useMemo(() => Array.from(children), [children]);

  return (
    <span className="casc">
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">
        {chars.map((char, i) =>
          char === ' ' ? (
            // A bare space between two inline-blocks collapses, taking the
            // word gap with it.
            <span key={i} className="casc-space">
              {' '}
            </span>
          ) : (
            <span key={i} className="casc-char" style={{ ['--i' as string]: Math.min(i, MAX_STEPS) }}>
              {char}
            </span>
          )
        )}
      </span>
    </span>
  );
}

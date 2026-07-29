/* ─────────────────────────────────────────────────────────────────────────
   TechMarquee — the stack as rolling rows of icons.

   Replaces the five Core Tools cards. Those carried a paragraph each, which
   meant the list could only ever hold five things; as rows it holds the whole
   stack in less vertical space than the cards used.

   Same trick as the hero marquee: the track holds two identical halves and
   translates by -50%, so the loop has no seam. Rows alternate direction,
   which reads as motion rather than as drift.

   The label stays next to each icon. "Icons only" would be a guessing game —
   a monogram is recognisable once you know what it stands for, not before.
   ───────────────────────────────────────────────────────────────────────── */

import { TechIcon } from './TechIcon';
import type { StackGroup } from '../content/stack';

/* Each half repeats its items twice. One pass of the shortest row is about
   1700px of chips, which is narrower than a wide desktop — and a half that is
   narrower than the viewport leaves a visible gap as the track translates.
   Two passes clears any realistic screen. */
function Row({ items }: { items: string[] }) {
  return (
    <span className="tech-half" aria-hidden="true">
      {[0, 1].flatMap((pass) =>
        items.map((item) => (
          <span key={`${pass}-${item}`} className="tech-chip">
            <span className="tech-chip-icon">
              <TechIcon name={item} size={19} />
            </span>
            {item}
          </span>
        ))
      )}
    </span>
  );
}

export function TechMarquee({ rows, groups }: { rows: string[][]; groups: StackGroup[] }) {
  return (
    <>
      {/* The rolling rows are decoration: they duplicate every chip, scramble
          the reading order and drop the category each item belongs to. So the
          real list is rendered once for assistive tech and visually hidden,
          and the animation is hidden from it.

          This is not the same case as the hero marquee, which is aria-hidden
          with no replacement because the paragraph above it already says the
          same thing. Nothing else on the page states the stack. */}
      <ul className="sr-only">
        {groups.map((group) => (
          <li key={group.name}>
            {group.name}: {group.items.join(', ')}
          </li>
        ))}
      </ul>

      <div className="tech-rows">
        {rows.map((items, i) => (
          <div className="tech-mask" key={i}>
            {/* Two halves per track — the -50% translate needs an identical
                second copy or the loop jumps at the seam. */}
            <div className={`tech-track${i % 2 === 1 ? ' is-rev' : ''}`} style={{ ['--dur' as string]: `${38 + i * 9}s` }}>
              <Row items={items} />
              <Row items={items} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

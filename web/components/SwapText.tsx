/* ─────────────────────────────────────────────────────────────────────────
   SwapText — the hover where the word changes typeface.

   Two copies of the same string stacked in a clipping mask. On hover the top
   copy rides up and out while the second rides up into its place — and the
   second is set in the *display* face rather than the body face, so the word
   does not merely move, it changes voice. That swap is the whole point; a
   plain slide is a slide.

   Per-character stagger, left to right, so it cascades instead of switching.
   The delay is small (18ms) and capped, because past about a fifth of a
   second the eye stops reading it as one word changing and starts reading it
   as letters arriving separately.

   Accessibility — the part this pattern usually gets wrong, because it puts
   the same text on the page twice:
   - Both visible layers are `aria-hidden` and `user-select: none`, so a
     screen reader is never read the word twice and a copy-paste never yields
     "ProjectsProjects".
   - The real string sits in an `.sr-only` span, which is what assistive tech
     and the clipboard actually get.

   Only for short labels — nav items, buttons, calls to action. Doubling body
   copy would be wasteful and the mask would clip descenders across lines.
   ───────────────────────────────────────────────────────────────────────── */

import { useMemo } from 'react';

/** Caps the cascade so a long label never turns into a slow wave. */
const MAX_STAGGER_STEPS = 11;

function Layer({ text, alt }: { text: string; alt?: boolean }) {
  const chars = useMemo(() => Array.from(text), [text]);

  return (
    <span className={alt ? 'swap-layer swap-alt' : 'swap-layer'} aria-hidden="true">
      {chars.map((char, i) => (
        <span
          key={i}
          className="swap-char"
          style={{ ['--i' as string]: Math.min(i, MAX_STAGGER_STEPS) }}
        >
          {/* A literal space collapses inside an inline-block, taking the
              word spacing with it. */}
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </span>
  );
}

export function SwapText({
  children,
  className,
}: {
  /** Plain text only — this splits into characters. */
  children: string;
  className?: string;
}) {
  return (
    <span className={['swap', className].filter(Boolean).join(' ')}>
      <span className="sr-only">{children}</span>
      <Layer text={children} />
      <Layer text={children} alt />
    </span>
  );
}

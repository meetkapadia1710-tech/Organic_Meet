/* ─────────────────────────────────────────────────────────────────────────
   ScrambleText — the label decodes itself when it scrolls into view.

   Characters resolve left to right; everything not yet resolved shows a
   random glyph, re-rolled a few times a second. It settles rather than
   types.

   Two decisions that keep it from feeling like a gimmick:

   - **The alphabet is Latin uppercase, not katakana.** Matrix glyphs are the
     cliché this effect usually arrives wrapped in, and they would be the only
     non-Latin thing on the site.
   - **Width is locked before it starts.** A scrambling label changes width on
     every frame as glyph advances differ, and `.kicker-rule` is a flex row
     whose hairline starts where the label ends — so the rule would twitch for
     the whole animation. A hidden copy of the final string holds the box open
     (same grid-stack trick as SwapText), and the animating copy is painted
     over it. Nothing can move.

   Accessibility: the animating copy is `aria-hidden`, and the real string
   sits in the sizing copy, which is what a screen reader and the clipboard
   get. Nobody is ever read a line of random letters.
   ───────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from 'react';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** How long each character waits before it locks, and how often the
 *  unresolved ones re-roll. Slow enough to read as a decode, short enough
 *  that a section heading is never illegible for long. */
const PER_CHAR_MS = 55;
const ROLL_MS = 45;

export function ScrambleText({ children, className }: { children: string; className?: string }) {
  const host = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(children);

  useEffect(() => {
    const node = host.current;
    if (!node) return;

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver !== 'function'
    ) {
      setDisplay(children);
      return;
    }

    const chars = Array.from(children);
    let raf = 0;
    let started = 0;
    let done = false;

    const tick = (now: number) => {
      if (!started) started = now;
      const elapsed = now - started;
      const resolved = Math.floor(elapsed / PER_CHAR_MS);

      if (resolved >= chars.length) {
        setDisplay(children);
        done = true;
        return;
      }

      // Re-roll unresolved positions on a slower clock than the frame rate,
      // or the noise is too fast to read as characters at all.
      const roll = Math.floor(elapsed / ROLL_MS);
      setDisplay(
        chars
          .map((char, i) => {
            if (i < resolved || char === ' ') return char;
            // Deterministic per (index, roll) so it does not re-randomise on
            // an unrelated React re-render mid-animation.
            const seed = (i * 31 + roll * 17) % GLYPHS.length;
            return GLYPHS[seed] ?? char;
          })
          .join('')
      );

      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || done) return;
        io.disconnect();
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );

    io.observe(node);

    // The same promise every reveal on this site makes: never leave content
    // unreadable because an observer or a frame loop did not run.
    const net = window.setTimeout(() => {
      if (!done) setDisplay(children);
    }, 4000);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(net);
    };
  }, [children]);

  return (
    <span ref={host} className={['scramble', className].filter(Boolean).join(' ')}>
      {/* Holds the box open at the final width, and carries the real text for
          assistive tech and copy-paste. */}
      <span className="scramble-size">{children}</span>
      <span className="scramble-live" aria-hidden="true">
        {display}
      </span>
    </span>
  );
}

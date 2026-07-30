/* ─────────────────────────────────────────────────────────────────────────
   DigitalRain — the anti-Matrix.

   Words drift down and sideways with a slight tumble, like leaves, instead of
   falling in rigid green columns. The brief was explicit about not shipping
   the cliché, and the difference is mostly in the horizontal drift and the
   rotation: vertical-only motion at a constant rate reads as code rain no
   matter what glyphs you use.

   The vocabulary is Meet's actual stack, pulled from `content/stack.ts`, plus
   the three ideas from the brief that are not technologies. A hardcoded list
   would drift out of step with the Stack section on the homepage the first
   time he learns something new.

   Every element is a CSS animation, not a JS loop. Transform and opacity
   only, so the whole field lives on the compositor and costs no main-thread
   work — which is the only way this coexists with the WebGL hero.
   ───────────────────────────────────────────────────────────────────────── */

import { useMemo } from 'react';
import { stack } from '../../content/stack';

const IDEAS = ['Accessibility', 'Performance', 'Creativity', 'Craft'];

interface Drop {
  word: string;
  left: number;
  delay: number;
  duration: number;
  drift: number;
  size: number;
  opacity: number;
}

/* Deterministic per mount, so nothing re-randomises on a React re-render and
   makes the field visibly jump. */
function build(count: number, words: string[]): Drop[] {
  const drops: Drop[] = [];
  for (let i = 0; i < count; i += 1) {
    drops.push({
      word: words[Math.floor(Math.random() * words.length)] ?? 'React',
      left: Math.random() * 100,
      delay: Math.random() * 14,
      duration: 16 + Math.random() * 16,
      // Signed, so they scatter both ways rather than all listing to one side.
      drift: (Math.random() - 0.5) * 22,
      size: 11 + Math.random() * 5,
      opacity: 0.16 + Math.random() * 0.24,
    });
  }
  return drops;
}

export function DigitalRain({ count }: { count: number }) {
  const words = useMemo(() => [...stack.flatMap((g) => g.items), ...IDEAS], []);
  const drops = useMemo(() => build(count, words), [count, words]);

  return (
    <div className="devrain" aria-hidden="true">
      {drops.map((drop, i) => (
        <span
          key={i}
          className="devrain-word"
          style={{
            left: `${drop.left}%`,
            fontSize: `${drop.size}px`,
            ['--drift' as string]: `${drop.drift}vw`,
            ['--dur' as string]: `${drop.duration}s`,
            ['--delay' as string]: `${drop.delay}s`,
            ['--o' as string]: drop.opacity,
          }}
        >
          {drop.word}
        </span>
      ))}
    </div>
  );
}

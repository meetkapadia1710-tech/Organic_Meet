/* ─────────────────────────────────────────────────────────────────────────
   SecretQuotes — one line at a time, rotating.

   Order is shuffled once per activation so a second visit is not the same
   sequence, and the crossfade is keyed on the index so React actually
   remounts the line and the CSS animation replays.

   Under reduced motion it shows one quote and stops rotating: text that
   replaces itself on a timer is exactly the kind of motion that preference
   is asking about.
   ───────────────────────────────────────────────────────────────────────── */

import { useEffect, useMemo, useState } from 'react';

const QUOTES = [
  'Good software grows.',
  'Code is planted before it is shipped.',
  'Every bug teaches something.',
  'Design is how code feels.',
  'The schema is the contract.',
  'Ship the ugly version, then finish the seams.',
];

const INTERVAL = 5200;

export function SecretQuotes() {
  const quotes = useMemo(() => {
    const copy = [...QUOTES];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j] as string, copy[i] as string];
    }
    return copy;
  }, []);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % quotes.length), INTERVAL);
    return () => window.clearInterval(id);
  }, [quotes.length]);

  return (
    <div className="devquote" aria-hidden="true">
      {/* Keyed so the fade-in animation restarts on each change. */}
      <span key={index} className="devquote-line">
        {quotes[index]}
      </span>
    </div>
  );
}

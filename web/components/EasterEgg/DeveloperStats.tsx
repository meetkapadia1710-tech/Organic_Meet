/* ─────────────────────────────────────────────────────────────────────────
   DeveloperStats — the floating glass card.

   Every number here is derived from the content files, not typed in. That
   matters more than it sounds: the brief asked for "Years Coding" and "GitHub
   Repositories", and neither exists anywhere in this repository. Inventing
   "6 years" for a third-year undergraduate would be putting a false claim on
   his portfolio, in the one place a curious developer is most likely to
   scrutinise it. So those two are gone, replaced by things that are true and
   recomputed on every build.

   "Coffee" stays, because it is transparently a joke rather than a claim.

   The counters animate with `requestAnimationFrame` toward the real value —
   and the markup holds the final number from the first paint, so if the
   animation never runs (reduced motion, a background tab) the correct value
   is simply what is already there. Same contract as the count-up on /stats.
   ───────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from 'react';
import { archive, caseStudies } from '../../content/projects';
import { stackCount } from '../../content/stack';

const shipped = caseStudies.length + archive.length;
const live = [...caseStudies, ...archive].filter((p) => p.links?.live).length;
const earliest = [...caseStudies, ...archive]
  .map((p) => Number(p.year))
  .filter((y) => Number.isFinite(y))
  .sort((a, b) => a - b)[0];

const clientWork = [...caseStudies, ...archive].filter((p) => p.category === 'Client work').length;

interface Stat {
  label: string;
  value: number;
  /** Rendered verbatim instead of counted. */
  text?: string;
  /** Years must not get a thousands separator — 2025 is not "2,025". */
  plain?: boolean;
}

const STATS: Stat[] = [
  { label: 'Projects shipped', value: shipped },
  /* Was "Written up", which is currently identical to "Projects shipped"
     because every project has a case study — two tiles showing 18 read as a
     bug. Client work is distinct, derived, and the more interesting number. */
  { label: 'Client projects', value: clientWork },
  { label: 'Live to click', value: live },
  { label: 'Technologies', value: stackCount },
  { label: 'Shipping since', value: earliest ?? 2025, plain: true },
  { label: 'Coffee', value: 0, text: '∞' },
];

const FOCUS = ['Distributed systems', 'Rust', 'On-device inference'];

function useCountUp(target: number, active: boolean): number {
  const [value, setValue] = useState(target);
  const started = useRef(false);

  useEffect(() => {
    if (!active || started.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    started.current = true;

    /* A background tab never fires rAF. Zeroing the value first and trusting
       the loop to refill it meant the card could sit showing 0 for every
       stat — which is exactly the failure the comment at the top of this file
       claims cannot happen. So: don't animate at all if the document is
       hidden, and back the animation with the same kind of timeout net the
       reveals use, so the true value lands even if frames stop midway. */
    if (document.hidden) return;

    const from = performance.now();
    const duration = 900;
    let raf = 0;

    const step = (now: number) => {
      const t = Math.min(1, (now - from) / duration);
      // easeOutExpo — commits fast, settles slowly.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };

    setValue(0);
    raf = requestAnimationFrame(step);
    const net = window.setTimeout(() => setValue(target), duration + 400);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(net);
    };
  }, [target, active]);

  return value;
}

function Counter({ stat }: { stat: Stat }) {
  const value = useCountUp(stat.value, true);
  return (
    <div className="devstat">
      <div className="devstat-value">
        {stat.text ?? (stat.plain ? String(value) : value.toLocaleString())}
      </div>
      <div className="devstat-label">{stat.label}</div>
    </div>
  );
}

export function DeveloperStats() {
  return (
    <aside className="devstats" aria-label="Developer statistics">
      <div className="devstats-head">
        <span className="devstats-pulse" aria-hidden="true" />
        System status
      </div>

      <div className="devstats-grid">
        {STATS.map((stat) => (
          <Counter key={stat.label} stat={stat} />
        ))}
      </div>

      <dl className="devstats-meta">
        <div>
          <dt>Focus</dt>
          <dd>{FOCUS.join(' · ')}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd className="is-live">Available now</dd>
        </div>
      </dl>
    </aside>
  );
}

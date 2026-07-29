import { useEffect, useState } from 'react';

/* Counts to 100 and leaves, in a little under a second, once per session —
   the head script marks the document `.seen` on every page after the first,
   so clicking into a case study is instant.

   The 2.5s timer is the guarantee: whatever happens to the interval, the
   page gets uncovered. */
export function Preloader() {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const seen = document.documentElement.classList.contains('seen');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (seen) { setGone(true); return; }

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setDone(true);
      window.setTimeout(() => setGone(true), 1000);
    };

    const guarantee = window.setTimeout(finish, 2500);
    if (reduced) { finish(); return () => window.clearTimeout(guarantee); }

    let p = 0;
    const tick = window.setInterval(() => {
      p = Math.min(100, p + Math.ceil(Math.random() * 7) + 3);
      setPct(p);
      if (p >= 100) {
        window.clearInterval(tick);
        window.setTimeout(finish, 380);
      }
    }, 45);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(guarantee);
    };
  }, []);

  if (gone) return null;

  return (
    <div id="preloader" aria-hidden="true" className={done ? 'is-done' : undefined}>
      <div className="pre-mark">MK</div>
      <div id="pct">{pct}%</div>
    </div>
  );
}

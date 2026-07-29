/* ─────────────────────────────────────────────────────────────────────────
   Hero3D — the gate.

   This file is in the main bundle, so it must never touch three.js. It
   decides whether the scene is wanted, and only then reaches for the chunk
   that contains it. A phone, a reduced-motion visitor or a machine without
   WebGL2 gets `null` here and never downloads a byte of the renderer.

   The scene is decoration layered *behind* the hero, never a replacement for
   it. The headline, the paragraph and every link render identically whether
   this returns a canvas or nothing at all — which is what keeps the hero
   selectable, searchable, screen-reader-legible and, above all, still there
   if WebGL falls over.
   ───────────────────────────────────────────────────────────────────────── */

import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { getDeviceProfile } from '../../hooks/useDeviceProfile';

/* The whole Three.js stack lives behind this import. It is only ever
   evaluated inside the `tier !== 'none'` branch below. */
const HeroCanvas = lazy(() => import('./HeroCanvas'));

export function Hero3D() {
  const profile = getDeviceProfile();
  const host = useRef<HTMLDivElement>(null);

  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [ready, setReady] = useState(false);

  /* Two independent reasons to stop rendering: the hero has scrolled away,
     or the tab is in the background. Either one should park the loop. */
  useEffect(() => {
    if (profile.tier === 'none') return;

    const node = host.current;
    let observer: IntersectionObserver | undefined;

    if (node && typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver(
        ([entry]) => setOnScreen(entry?.isIntersecting ?? true),
        { rootMargin: '120px' }
      );
      observer.observe(node);
    }

    const onVisibility = () => setTabVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [profile.tier]);

  if (profile.tier === 'none') return null;

  return (
    <div
      ref={host}
      className={`hero3d${ready ? ' is-ready' : ''}`}
      aria-hidden="true"
      data-tier={profile.tier}
    >
      {/* The loading state is a seed, not a spinner. It is one CSS gradient
          that breathes in the accent colour and dissolves as the real scene
          fades over it — a loader that blocked the hero would contradict the
          point of lazy-loading it in the first place. */}
      <Suspense fallback={<div className="hero3d-seed" />}>
        <HeroCanvas profile={profile} active={onScreen && tabVisible} onReady={() => setReady(true)} />
      </Suspense>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   EasterEgg — the doors, and the lazy boundary.

   This is the only file from the Easter Egg that ships in the main bundle,
   and it is intentionally almost nothing: two key/tap listeners and a lazy
   import that is never evaluated until the egg is unlocked. The measured cost
   of the whole feature to a visitor who never finds it is this file plus two
   hooks.

   Mounted once in `Layout`, above the router outlet, so the egg survives
   navigation — unlocking it on the homepage and then opening a case study
   should not quietly close it.
   ───────────────────────────────────────────────────────────────────────── */

import { Suspense, lazy } from 'react';
import { useKonamiCode } from '../../hooks/useKonamiCode';
import { isFirstRun, setDevMode, useDevMode } from '../../state/devmode';

const DeveloperMode = lazy(() => import('./DeveloperMode'));

export function EasterEgg() {
  const on = useDevMode();

  /* The desktop door. The mobile one lives on the nav wordmark — see
     `useLogoTap` and its use in Nav.tsx — because that is where the tap
     target has to be. */
  useKonamiCode(() => setDevMode(true));

  if (!on) return null;

  /* No Suspense fallback. The chunk is small and the page underneath is
     already complete and interactive: flashing a loading state over a working
     hero would be a downgrade, and the activation is *supposed* to arrive
     gradually. The CSS transition on `html.dev-mode` starts the moment the
     class lands, so the wash is already underway while this resolves. */
  return (
    <Suspense fallback={null}>
      <DeveloperMode celebrate={isFirstRun()} />
    </Suspense>
  );
}

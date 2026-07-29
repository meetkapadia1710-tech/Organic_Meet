import { useCallback } from 'react';
import { useNavigate } from 'react-router';

/* Navigation that produces a correct shared-element morph.

   Getting here took three wrong turns, and the constraint that decides it is
   ordering:

   - The browser captures the "old" snapshot the moment startViewTransition()
     is called, and the "new" one after the update callback settles.
   - Driving the transition by hand — startViewTransition(() => navigate())
     — does not work with a data router. navigate() is asynchronous and has
     not committed when the callback returns, even wrapped in flushSync or
     awaited, so both snapshots capture the outgoing page and the morph
     animates nowhere.
   - Letting the router own the transition (navigate with viewTransition)
     does capture the incoming DOM correctly, because the router knows when
     its own commit happens. But a scroll reset afterwards lands after the
     new snapshot is measured, so the incoming headline gets measured
     thousands of pixels above the fold and the title flies off the screen.

   So: reset the scroll first, synchronously, then let the router run the
   transition. Both snapshots are then measured at the same scroll offset,
   and the morph animates between two positions that actually exist. */
export function useTransitionNavigate() {
  const navigate = useNavigate();

  return useCallback(
    (to: string) => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduced || !document.startViewTransition) {
        navigate(to);
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }

      // Explicitly instant: the stylesheet sets scroll-behavior: smooth, which
      // would animate this reset over several hundred milliseconds — long after
      // the browser has measured both view-transition snapshots.
      window.scrollTo({ top: 0, behavior: 'instant' });
      navigate(to, { viewTransition: true });
    },
    [navigate]
  );
}

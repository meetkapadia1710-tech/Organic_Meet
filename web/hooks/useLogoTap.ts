/* ─────────────────────────────────────────────────────────────────────────
   useLogoTap — seven taps on the wordmark inside five seconds.

   The mobile door, since a phone has no Konami code to enter. Returns props
   to spread onto the brand link in the nav.

   The hard part is not counting taps, it is not breaking the link. That
   wordmark is the way home, and it has to keep being that: taps one through
   six do nothing at all, so the first tap still navigates and a visitor who
   pokes it twice by accident is unaffected. Only the seventh tap suppresses
   its own navigation — by which point nobody has tapped a logo seven times
   in five seconds while intending to go to the homepage.
   ───────────────────────────────────────────────────────────────────────── */

import { useCallback, useRef } from 'react';

const NEEDED = 7;
const WINDOW_MS = 5000;

export interface LogoTapProps {
  onClick: (e: React.MouseEvent) => void;
}

export function useLogoTap(onUnlock: () => void): LogoTapProps {
  const taps = useRef<number[]>([]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      // Never interfere with an intentional new-tab or middle click.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const now = Date.now();
      // Keep only the taps still inside the window, then add this one.
      taps.current = taps.current.filter((t) => now - t < WINDOW_MS);
      taps.current.push(now);

      if (taps.current.length >= NEEDED) {
        taps.current = [];
        // Only now is it safe to claim the click — the visitor has been
        // unambiguous.
        e.preventDefault();
        onUnlock();
      }
    },
    [onUnlock]
  );

  return { onClick };
}

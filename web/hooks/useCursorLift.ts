/* ─────────────────────────────────────────────────────────────────────────
   useCursorLift — letters rise as the pointer passes over them.

   Applied to the hero headline only. Each character gets a `--lift` in
   pixels, falling off with distance from the cursor, so the line behaves like
   something physical passing under a hand rather than a hover state that
   switches on.

   Why this does not fight the reveal: `SplitText` animates `.split > span`
   (the word) to run its mask reveal. The lift is written to
   `.split > span > .lift-char` — a *different* element, one level deeper — so
   the two transforms compose instead of overwriting each other. That
   separation is the whole reason this could be added to a working, verified
   component without rewriting it.

   Cost control:
   - Rects are measured once and re-measured only on resize or scroll, never
     per frame. Reading layout on pointermove is the classic way to make an
     effect like this stutter.
   - The rAF loop parks itself once every character has settled, and wakes on
     the next move.
   - Fine pointers only, and off entirely under reduced motion.
   ───────────────────────────────────────────────────────────────────────── */

import { useEffect } from 'react';
import { useLocation } from 'react-router';

/** How far the influence reaches, and how high the nearest letter goes. */
const RADIUS = 170;
const MAX_LIFT = 11;
/** Easing toward the target, per frame. Low enough that the line settles
 *  behind the cursor rather than tracking it exactly. */
const EASE = 0.14;

export function useCursorLift(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      return;
    }

    const chars = Array.from(document.querySelectorAll<HTMLElement>('[data-cursor-lift] .lift-char'));
    if (!chars.length) return;

    // Cached centres, in viewport coordinates.
    let centres: Array<{ x: number; y: number }> = [];
    const measure = () => {
      centres = chars.map((el) => {
        const box = el.getBoundingClientRect();
        return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
      });
    };
    measure();

    const current = new Float32Array(chars.length);
    let pointerX = -9999;
    let pointerY = -9999;
    let raf = 0;
    let idle = 0;

    const frame = () => {
      let moving = false;

      for (let i = 0; i < chars.length; i += 1) {
        const centre = centres[i];
        const el = chars[i];
        if (!centre || !el) continue;

        const distance = Math.hypot(centre.x - pointerX, centre.y - pointerY);
        // Cosine falloff — no hard edge where the effect stops.
        const strength = distance > RADIUS ? 0 : (Math.cos((distance / RADIUS) * Math.PI) + 1) / 2;
        const target = -strength * MAX_LIFT;

        const next = current[i]! + (target - current[i]!) * EASE;
        current[i] = next;

        if (Math.abs(next - target) > 0.05 || Math.abs(next) > 0.05) moving = true;
        el.style.setProperty('--lift', `${next.toFixed(2)}px`);
      }

      // Park after a moment of everything being at rest, rather than running
      // a loop for the life of the page.
      idle = moving ? 0 : idle + 1;
      raf = idle > 20 ? 0 : requestAnimationFrame(frame);
    };

    const wake = () => {
      idle = 0;
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      wake();
    };

    // The pointer leaving should release the line, not freeze it mid-lift.
    const onLeave = () => {
      pointerX = -9999;
      pointerY = -9999;
      wake();
    };

    let remeasure = 0;
    const onLayoutChange = () => {
      window.clearTimeout(remeasure);
      remeasure = window.setTimeout(() => {
        measure();
        wake();
      }, 120);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', onLayoutChange, { passive: true });
    window.addEventListener('scroll', onLayoutChange, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', onLayoutChange);
      window.removeEventListener('scroll', onLayoutChange);
      window.clearTimeout(remeasure);
      if (raf) cancelAnimationFrame(raf);
      chars.forEach((el) => el.style.removeProperty('--lift'));
    };
  }, [pathname]);
}

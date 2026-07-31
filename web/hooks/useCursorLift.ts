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

/* ── the weight axis ────────────────────────────────────────────────────
   Figtree is requested as a variable font (`wght@300..900` in index.html),
   so the same falloff that lifts a character can also thicken it. The wave
   of weight travelling along the line is the effect; the lift is what stops
   it reading as a hover state.

   REST is what a character weighs with the pointer nowhere near it, and it
   is deliberately lighter than the headline's static weight. PEAK is the
   heaviest the axis goes.

   The static CSS weight stays 800 and is the fallback everywhere this hook
   does not run — touch devices, reduced motion, no JS. That matters: if REST
   were the fallback, every phone visitor would get a 600-weight headline
   instead of the 800 the design is built around. The variation is additive
   to a design that is already correct without it. */
const REST_WGHT = 600;
const PEAK_WGHT = 900;
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

    /* ── pin the boxes ───────────────────────────────────────────────────
       A weight axis changes glyph advance widths, so animating it reflows
       the text. Measured on this headline: each character is about 1.2px
       wider at 900 than at 600, which sounds harmless until it is multiplied
       by 33 characters — enough to push a word onto a new line. The title
       measured 212px tall at 600 and 318px at 900. A headline that gains a
       line as the pointer crosses it is not an effect, it is a bug.

       So each character's box is frozen at the width it has at the static
       800 in the stylesheet, and the glyph varies inside a box that never
       changes. Wrapping is then decided once and cannot move.

       Pinned at 800 rather than at either extreme because it sits between
       them: the error is roughly ±0.6px per character either way, which is
       invisible at this size, where pinning at 600 or 900 would put the
       whole error on one side and read as loose or cramped tracking. */
    const pin = () => {
      // Clear first, so the measurement is of the static weight and not of
      // whatever the last frame happened to leave behind.
      chars.forEach((el) => {
        el.style.removeProperty('width');
        el.style.removeProperty('--wght');
      });
      // One read pass, then one write pass — interleaving them would force a
      // layout per character.
      const widths = chars.map((el) => el.getBoundingClientRect().width);
      chars.forEach((el, i) => {
        el.style.width = `${(widths[i] ?? 0).toFixed(2)}px`;
      });
    };

    // Cached centres, in viewport coordinates.
    let centres: Array<{ x: number; y: number }> = [];
    const measure = () => {
      centres = chars.map((el) => {
        const box = el.getBoundingClientRect();
        return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
      });
    };

    pin();
    measure();

    /* Widths measured before the webfont arrives are the fallback face's,
       and every box would be wrong. `fonts.ready` resolves immediately when
       the font is already cached, so this is not a delay on repeat visits. */
    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (cancelled) return;
      pin();
      measure();
    });

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

        /* The weight rides the *eased* value, not the raw strength, so the
           thickening trails the pointer exactly as far as the lift does and
           the two read as one gesture. `next` is 0 to -MAX_LIFT, so its
           magnitude over MAX_LIFT is the eased 0..1 the axis wants.

           Rounded to whole units: the axis is quantised in practice, and
           writing 763.4218 every frame only makes the browser re-parse a
           longer string to reach the same glyph. */
        const eased = Math.min(1, Math.abs(next) / MAX_LIFT);
        el.style.setProperty('--wght', String(Math.round(REST_WGHT + eased * (PEAK_WGHT - REST_WGHT))));
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

    /* ⚠️ Scroll and resize are NOT the same job here, and treating them as
       one made scrolling stutter.

       `pin()` clears the width off 33 characters, reads 33 rects — a forced
       synchronous layout of a three-line 116px headline — and writes them
       back. That is fine once, and fine on resize, where the clamp really has
       changed every glyph's width.

       On scroll it is pure waste: scrolling moves the headline, it does not
       reflow it, so every measured width comes back identical. Running it
       from the shared handler meant a forced relayout 120ms after every
       scroll, plus a `wake()` starting the rAF loop with nothing to animate.

       Scrolling only invalidates the cached *centres*, so scroll gets
       `measure()` alone — and not `wake()` either: the pointer has not moved,
       so no character has a new target to ease toward. */
    let remeasure = 0;
    const onResize = () => {
      window.clearTimeout(remeasure);
      remeasure = window.setTimeout(() => {
        pin();
        measure();
        wake();
      }, 120);
    };

    let recentre = 0;
    const onScroll = () => {
      window.clearTimeout(recentre);
      recentre = window.setTimeout(measure, 120);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(recentre);
      window.clearTimeout(remeasure);
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      chars.forEach((el) => {
        el.style.removeProperty('--lift');
        // Dropping this returns the character to the static 800 in the
        // stylesheet, not to REST — see the note on REST_WGHT.
        el.style.removeProperty('--wght');
        el.style.removeProperty('width');
      });
    };
  }, [pathname]);
}

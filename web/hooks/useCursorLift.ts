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

/* ── per-character style ────────────────────────────────────────────────
   Every letter used to do the same thing: rise, and thicken toward 900. The
   wave was legible but uniform — thirty-three characters performing one
   gesture in sequence. Each character now draws its *own* variant as the
   pointer reaches it, and forgets it again once the pointer has gone, so no
   two passes over the headline produce the same line twice.

   What a variant may change is limited to things that cannot move the text
   *and* can be interpolated — see the note on smoothness below:

   - `slant` is a skew, and `stretch` a scaleX. Transforms do not affect
     layout, so neither can reflow a headline whose boxes are pinned.
   - `wght` is the axis that was already being driven — the difference is
     that its destination is now per-character, so some letters thin out to
     300 while their neighbours go to 900. That is the "random boldness":
     previously every letter agreed to get heavier, which is a wave, not a
     variation.

   Swapping `font-family` was tried and rejected. Caprasimo's advance widths
   are far wider than Figtree's at the same size, and the boxes here are
   pinned — so a letter that changed face would render its glyph straight
   through its neighbour. A ransom-note headline is a legitimate look; one
   with overlapping glyphs is just broken.

   `normal` appears twice in the pool on purpose. If every letter does
   something, nothing reads as an event; leaving roughly a fifth of them
   untouched is what makes the ones that do move register as deliberate. */
type Variant = { slant: number; stretch: number; wght: number };

/* ⚠️ Everything here must be continuous.

   `font-variant-caps: small-caps` was in this pool and had to come out. It
   is a glyph *substitution*, not a value on a scale: there is no halfway
   between `p` and a small-cap `P`, so it could only ever snap in at the
   threshold while the slant, the stretch and the weight were all still
   easing. With the pointer sitting between two characters, one letter
   changing shape instantly while its neighbour eased was the whole reason
   the effect read as abrupt.

   Anything added here later needs the same property: if it cannot be
   multiplied by a 0..1 falloff and mean something at 0.4, it does not
   belong in this hook. */

/* ⚠️ The ranges are bounded by collision, not by taste.

   A skew shears a character by its own height, and this headline's
   characters are ~136px tall against a ~130px box. At 16° that is 39px of
   extra ink, and a 1.16 stretch adds 21px more: measured, one character
   rendered 198px of ink out of a 130px box, which lands squarely on top of
   its neighbours at a size where the collision is unmissable.

   Halved to ±9° and ±10%, the worst case is about 34px over the box, split
   either side — read as tension against the headline's already-tight
   -0.045em tracking rather than as letters crashing into each other. If you
   want this louder, these two numbers are the dial, and the thing to watch
   is the letter pair that both peak at once. */
const VARIANTS: Variant[] = [
  { slant: 0, stretch: 1, wght: 900 },
  { slant: 0, stretch: 1, wght: 300 },
  { slant: -8, stretch: 1, wght: 800 },
  { slant: 6, stretch: 1, wght: 400 },
  { slant: -5, stretch: 0.9, wght: 900 },
  { slant: 0, stretch: 1.1, wght: 500 },
  { slant: 4, stretch: 0.94, wght: 700 },
  { slant: 7, stretch: 0.92, wght: 300 },
  { slant: -9, stretch: 1.06, wght: 900 },
];

/* Both thresholds sit at the very bottom of the falloff, and that is the
   other half of the smoothness fix.

   Drawing a variant switches the character's weight destination — from the
   default peak to whatever it drew. At the old 0.12 that switch was worth
   about 70 units of weight *instantly*, because the change was multiplied by
   an eased value that was already non-trivial. Down here the same switch is
   multiplied by 0.02, so it is arithmetically invisible: the letter is
   effectively still at rest at the moment its future is decided.

   They stay apart from each other so a character hovering exactly on the
   line cannot draw and discard on alternate frames. */
const ENGAGE = 0.02;
const RELEASE = 0.005;
/** Easing toward the target, per frame. Lowered from 0.14: the line now has
 *  more to say on the way in — three axes rather than one — and giving it
 *  longer to arrive is what turns a switch into a gesture. */
const EASE = 0.1;

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
        /* Nothing else needs clearing before the read: the slant and the
           stretch are transforms, and transforms do not participate in
           layout, so they cannot influence a measurement. */
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
    /* What each character is wearing now, and what it wore last time. The
       second one is why a letter cannot be handed the same style twice in a
       row: an independent random pick per hover repeats about one time in
       nine, which is often enough that the effect reads as "sometimes
       nothing happens" rather than as new every pass. */
    const worn: Array<number | null> = chars.map(() => null);
    const previous: Array<number | null> = chars.map(() => null);

    /* ── drawing without repetition ──────────────────────────────────────
       A shuffled deck rather than a die. Drawing without replacement means
       all nine styles are dealt before any of them comes round again, so a
       pass over the headline uses the whole pool instead of landing on the
       same two or three by chance — which is what independent random picks
       actually look like over eleven characters.

       On top of the deck, two exclusions:

       - a character never redraws what it wore on the previous hover, so
         moving back and forth over one letter always changes it;
       - it never draws what either neighbour is wearing right now, because
         two adjacent letters doing the identical thing is the one case that
         reads as a repeat even when the rest of the line is varied.

       If the remaining deck is entirely excluded — possible with a short
       deck and two engaged neighbours — it reshuffles and takes the best it
       can. Correctness here is "never looks repetitive", not a guarantee
       worth deadlocking over. */
    let deck: number[] = [];
    const shuffle = () => {
      deck = VARIANTS.map((_, i) => i);
      for (let i = deck.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j]!, deck[i]!];
      }
    };
    shuffle();

    const drawFor = (i: number): number => {
      const banned = new Set<number>();
      if (previous[i] != null) banned.add(previous[i]!);
      if (worn[i - 1] != null) banned.add(worn[i - 1]!);
      if (worn[i + 1] != null) banned.add(worn[i + 1]!);

      for (let pass = 0; pass < 2; pass += 1) {
        if (!deck.length) shuffle();
        const at = deck.findIndex((v) => !banned.has(v));
        if (at !== -1) return deck.splice(at, 1)[0]!;
        // Nothing in what is left is allowed — reshuffle and look once more.
        shuffle();
      }
      return deck.pop() ?? 0;
    };
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

        /* Draw a variant on the way in, discard it on the way out. The two
           thresholds are apart rather than being one line, so a character
           sitting exactly on the boundary cannot flicker between drawing and
           discarding on alternate frames. */
        if (eased > ENGAGE && worn[i] == null) {
          const drawn = drawFor(i);
          worn[i] = drawn;
          /* Remembered before release, not after: the character has to know
             what it wore even while it is wearing it, so a neighbour drawing
             at the same moment can avoid matching it. */
          previous[i] = drawn;
        } else if (eased < RELEASE && worn[i] != null) {
          worn[i] = null;
        }

        /* Everything continuous is multiplied by the same eased value the
           lift uses. That is what keeps this one gesture: the letter slants,
           stretches and changes weight *as* it rises, arriving at its variant
           at the same moment it reaches full height, and unwinding all of it
           together. Applied raw, the styles would snap on at the threshold
           while the lift was still travelling, and it would read as two
           unrelated effects sharing a headline.

           The weight destination is the variant's, not a global peak — so a
           letter can thin toward 300 while the one beside it goes to 900. */
        /* Smoothstep, not the raw eased value. The cosine falloff already
           has no hard edge in *space*, but the strength still climbs
           linearly once a character is inside the radius, so the distortion
           began at its fastest rate the instant it began at all. `3t² - 2t³`
           leaves and arrives with zero slope: a letter eases out of normal
           and into its variant instead of setting off immediately.

           It matters most in exactly the case that prompted this — the
           pointer sitting between two characters. Both are partly engaged,
           and under a linear ramp both are moving at full rate while looking
           only half-committed, which is what reads as twitchy. Here, partly
           engaged also means slowly moving.

           All three axes share the curve, which is the point: the letter
           slants, stretches and thickens as one gesture rather than three
           properties that happen to have started together. */
        const shaped = eased * eased * (3 - 2 * eased);

        const variant = worn[i] == null ? null : VARIANTS[worn[i]!]!;
        const peak = variant ? variant.wght : PEAK_WGHT;
        el.style.setProperty('--wght', String(Math.round(REST_WGHT + shaped * (peak - REST_WGHT))));
        el.style.setProperty('--slant', `${((variant?.slant ?? 0) * shaped).toFixed(2)}deg`);
        el.style.setProperty('--stretch', String((1 + ((variant?.stretch ?? 1) - 1) * shaped).toFixed(3)));
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
        // Same reasoning: the variant axes go back to their CSS no-ops, so a
        // navigation cannot leave a letter skewed or stretched.
        el.style.removeProperty('--slant');
        el.style.removeProperty('--stretch');
      });
    };
  }, [pathname]);
}

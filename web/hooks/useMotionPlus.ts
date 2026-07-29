/* ─────────────────────────────────────────────────────────────────────────
   useMotionPlus — the second motion layer, added on top of useMotion.

   Everything here is additive and opt-in. Nothing in this file changes an
   existing behaviour: the effects attach to attributes that did not exist
   before (`data-lines`, `data-countup`, `data-velocity`) or to a class that
   did not exist before (`.hl`). Remove the import and the site is exactly
   what it was.

   Every effect is off under `prefers-reduced-motion`, and every one of them
   leaves the content readable if it never runs — the reveal states are the
   *finished* state in CSS, and the JS only adds a class that plays them from
   a starting position. Nothing here can strand content invisible.
   ───────────────────────────────────────────────────────────────────────── */

import { useEffect } from 'react';
import { useLocation } from 'react-router';

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* ── inertial scrolling ─────────────────────────────────────────────────
   The wheel moves a *target*; the page eases toward it. This is the single
   biggest difference between a site that feels engineered and one that feels
   like a document, and it is also the easiest thing to get catastrophically
   wrong, so the rules are strict:

   - Wheel only, fine pointer only. Touch already has momentum from the OS
     and it is better than anything reimplemented here.
   - Any scroll this loop did not cause wins immediately. Scroll restoration,
     the instant reset before a view transition, anchor jumps, keyboard paging
     and find-in-page all move the page from outside; the loop notices the
     position it did not set and adopts it rather than fighting it.
   - `behavior: 'instant'` on every write. The stylesheet sets
     `scroll-behavior: smooth`, so a plain scrollTo would animate each frame
     toward a target that is itself animating — the page would crawl.
   - Nested scrollers keep their own wheel: the command palette list, the
     table of contents, the heatmap strip. */

const NESTED = '.cmdk, .cmdk-list, .toc-list, .hm-scroll, .deck-viewport, [data-native-scroll]';

export function useSmoothScroll(): void {
  useEffect(() => {
    if (prefersReduced() || !finePointer()) return;

    const root = document.documentElement;
    let target = window.scrollY;
    let current = window.scrollY;
    let lastWritten = -1;
    let running = false;
    let disabled = false;
    let watchdog = 0;

    const maxScroll = () => Math.max(0, root.scrollHeight - window.innerHeight);

    /* This hook calls preventDefault on the wheel. If the animation loop then
       fails to run, the page becomes completely unscrollable — the worst
       failure this file could possibly have, and one that a background tab,
       a throttled rAF or a thrown frame could cause. So every wheel event
       arms a timer that the first frame disarms; if no frame arrives, the
       hijack switches itself off for good and native scrolling returns. */
    const arm = () => {
      if (watchdog) return;
      watchdog = window.setTimeout(() => {
        disabled = true;
        running = false;
        window.removeEventListener('wheel', onWheel);
        root.classList.remove('has-smooth-scroll');
      }, 400);
    };

    const disarm = () => {
      if (!watchdog) return;
      window.clearTimeout(watchdog);
      watchdog = 0;
    };

    const tick = () => {
      disarm();

      // Something else moved the page. Adopt it and stand down; the next
      // wheel event will re-seed from wherever we now are.
      if (lastWritten >= 0 && Math.abs(window.scrollY - lastWritten) > 2) {
        running = false;
        lastWritten = -1;
        return;
      }

      current = lerp(current, target, 0.115);

      if (Math.abs(target - current) < 0.4) {
        current = target;
        running = false;
      }

      window.scrollTo({ top: current, behavior: 'instant' });
      lastWritten = window.scrollY;

      if (running) requestAnimationFrame(tick);
    };

    function onWheel(e: WheelEvent) {
      if (disabled) return;
      // Scroll is locked (command palette) — leave the page alone entirely.
      if (document.body.style.overflow === 'hidden') return;
      if (e.ctrlKey) return; // pinch-zoom
      if ((e.target as Element | null)?.closest?.(NESTED)) return;

      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;

      e.preventDefault();

      // Re-seed whenever we are idle, so the gesture always starts from where
      // the page actually is rather than from a stale target.
      if (!running) {
        target = window.scrollY;
        current = window.scrollY;
      }

      target = clamp(target + delta, 0, maxScroll());

      arm();
      if (!running) {
        running = true;
        requestAnimationFrame(tick);
      }
    }

    /* Taking the wheel means turning off the stylesheet's `scroll-behavior:
       smooth`, or every frame's write would itself animate. That would leave
       in-page anchors — "Get in touch", "Index" — jumping instantly, which is
       a regression in feel, so they are eased by this loop instead. The hash
       is still written to the URL, so back still works and the link is still
       copyable. */
    const onAnchorClick = (e: MouseEvent) => {
      if (disabled || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;

      const anchor = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
      const hash = anchor?.getAttribute('href');
      if (!anchor || !hash || hash === '#') return;

      const destination = document.getElementById(hash.slice(1));
      if (!destination) return;

      e.preventDefault();
      target = clamp(window.scrollY + destination.getBoundingClientRect().top, 0, maxScroll());

      if (!running) {
        current = window.scrollY;
        running = true;
        arm();
        requestAnimationFrame(tick);
      }
      if (window.location.hash !== hash) history.pushState(null, '', hash);
    };

    root.classList.add('has-smooth-scroll');
    window.addEventListener('wheel', onWheel, { passive: false });
    document.addEventListener('click', onAnchorClick);

    return () => {
      disarm();
      document.removeEventListener('click', onAnchorClick);
      window.removeEventListener('wheel', onWheel);
      root.classList.remove('has-smooth-scroll');
      running = false;
    };
  }, []);
}

/* ── word-by-word text reveal ───────────────────────────────────────────
   `data-lines` on a paragraph. Each word is wrapped in a clipping span so it
   rises out of its own mask rather than fading in place.

   The wrapping is done once per element and marked, because the observer
   re-sweeps on every mutation and re-splitting would destroy the spans it
   just animated. Only plain text nodes are split — an element child (a link,
   an <em>) is left exactly as it is, so no markup is ever discarded. */

function splitWords(el: HTMLElement) {
  if (el.dataset['split'] === 'done') return;
  el.dataset['split'] = 'done';

  const nodes = Array.from(el.childNodes);
  let index = 0;

  for (const node of nodes) {
    if (node.nodeType !== Node.TEXT_NODE) continue;
    const text = node.textContent ?? '';
    if (!text.trim()) continue;

    const fragment = document.createDocumentFragment();
    for (const chunk of text.split(/(\s+)/)) {
      if (!chunk) continue;
      if (!chunk.trim()) {
        fragment.appendChild(document.createTextNode(chunk));
        continue;
      }
      const outer = document.createElement('span');
      outer.className = 'wr';
      const inner = document.createElement('span');
      inner.className = 'wi';
      inner.style.setProperty('--i', String(index));
      inner.textContent = chunk;
      outer.appendChild(inner);
      fragment.appendChild(outer);
      index += 1;
    }
    node.parentNode?.replaceChild(fragment, node);
  }
}

export function useTextReveal(): void {
  useEffect(() => {
    if (prefersReduced() || typeof IntersectionObserver !== 'function') return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    );

    const seen = new WeakSet<Element>();
    const timers: number[] = [];

    const sweep = () => {
      document.querySelectorAll<HTMLElement>('[data-lines]').forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        splitWords(el);
        el.classList.add('is-split');
        io.observe(el);
        // Same promise the base reveal makes: text is never left hidden
        // because an observer did not fire.
        timers.push(window.setTimeout(() => el.classList.add('is-in'), 4000));
      });
    };

    sweep();
    const mo = new MutationObserver(sweep);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);
}

/* ── highlight sweep ────────────────────────────────────────────────────
   `.hl` draws a marker stroke behind a phrase when it scrolls into view. The
   colour is a palette step, so it inverts with the theme like everything
   else, and the text sits above it — a highlight that reduces contrast is a
   worse sentence, not a better one. */

export function useHighlights(): void {
  useEffect(() => {
    if (prefersReduced() || typeof IntersectionObserver !== 'function') return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-on');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.9 }
    );

    const seen = new WeakSet<Element>();
    const sweep = () => {
      document.querySelectorAll('.hl').forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    };

    sweep();
    const mo = new MutationObserver(sweep);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);
}

/* ── count-up ───────────────────────────────────────────────────────────
   `data-countup` on an element whose text is already the final number. The
   number in the markup is the truth; this only animates toward it, so if the
   script never runs the correct value is what was there all along. */

export function useCountUp(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    if (prefersReduced() || typeof IntersectionObserver !== 'function') return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          io.unobserve(el);

          const final = Number((el.textContent ?? '').replace(/[^\d.-]/g, ''));
          if (!Number.isFinite(final) || final === 0) return;

          const suffix = (el.textContent ?? '').replace(/[\d,.\s-]/g, '');
          const started = performance.now();
          const duration = 1100;

          const step = (now: number) => {
            const t = Math.min(1, (now - started) / duration);
            // easeOutExpo: fast commitment, slow settle.
            const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            el.textContent = `${Math.round(final * eased).toLocaleString()}${suffix}`;
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.6 }
    );

    document.querySelectorAll('[data-countup]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
}

/* ── scroll-velocity skew ───────────────────────────────────────────────
   useMotion already publishes `--scroll-velocity` on the root. This reads it
   and applies a small counter-skew to anything marked `data-velocity`, which
   is what makes fast scrolling feel like it has weight. Capped hard: past a
   couple of degrees it stops reading as momentum and starts reading as a
   rendering bug. */

export function useVelocitySkew(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    if (prefersReduced()) return;
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-velocity]'));
    if (!targets.length) return;

    const root = document.documentElement;
    let raf = 0;
    let idle = 0;

    const tick = () => {
      const velocity = Number(getComputedStyle(root).getPropertyValue('--scroll-velocity')) || 0;
      const skew = clamp(velocity * 0.05, -2.2, 2.2);

      targets.forEach((el) => {
        el.style.setProperty('--skew', `${skew.toFixed(3)}deg`);
      });

      // Park after a second of stillness rather than running a frame loop for
      // the life of the page.
      idle = Math.abs(velocity) < 0.05 ? idle + 1 : 0;
      raf = idle > 60 ? 0 : requestAnimationFrame(tick);
    };

    const wake = () => {
      idle = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener('scroll', wake, { passive: true });

    return () => {
      window.removeEventListener('scroll', wake);
      if (raf) cancelAnimationFrame(raf);
      targets.forEach((el) => el.style.removeProperty('--skew'));
    };
  }, [pathname]);
}

/** The second layer, in one call. Additive to useSiteMotion. */
export function useMotionPlus(): void {
  useSmoothScroll();
  useTextReveal();
  useHighlights();
  useCountUp();
  useVelocitySkew();
}

/* ─────────────────────────────────────────────────────────────────────────
   useMotion — the pointer, scroll and reveal behaviour, ported from the
   static site's motion.js.

   Two things change in React and both are deliberate:

   1. Magnetic and tilt are delegated from the document rather than bound per
      element. The static site bound listeners at startup because the DOM
      never changed; here elements come and go with every route, and
      re-binding on each navigation would leak. Delegation is bound once and
      behaves identically.

   2. The reveal observer re-scans after every navigation, because a route
      change swaps the whole page under it.

   Everything else — the parking rAF loop, the spring constants, the scroll
   velocity, the nav hysteresis — is the same arithmetic as before.
   ───────────────────────────────────────────────────────────────────────── */

import { useEffect } from 'react';
import { useLocation } from 'react-router';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** One rAF loop shared by the cursor and the parallax, parked when idle. */
function createLoop() {
  const tasks: Array<() => boolean> = [];
  let running = false;

  function tick() {
    running = false;
    let again = false;
    for (const task of tasks) if (task()) again = true;
    if (again) schedule();
  }
  function schedule() {
    if (running) return;
    running = true;
    requestAnimationFrame(tick);
  }
  return {
    add(task: () => boolean) {
      tasks.push(task);
      schedule();
    },
    schedule,
  };
}

/* ── cursor ────────────────────────────────────────────────────────────── */

export function useCursor(): void {
  useEffect(() => {
    if (!finePointer() || prefersReduced()) return;

    const dot = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    const label = document.getElementById('cursor-label');
    if (!dot) return;

    const root = document.documentElement;
    root.classList.add('has-cursor');

    const loop = createLoop();
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let rx = tx;
    let ry = ty;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      loop.schedule();
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as Element | null;
      const target = el?.closest?.('[data-cursor], a, button') ?? null;
      const text = target?.getAttribute('data-cursor') ?? null;
      ring?.classList.toggle('is-link', !!target && !text);
      ring?.classList.toggle('is-labelled', !!text);
      if (label) {
        label.textContent = text ?? '';
        label.classList.toggle('is-on', !!text);
      }
      dot.classList.toggle('is-hidden', !!text);
    };

    loop.add(() => {
      rx = lerp(rx, tx, 0.16);
      ry = lerp(ry, ty, 0.16);
      dot.style.transform = `translate3d(${tx}px,${ty}px,0) translate(-50%,-50%)`;
      if (ring) ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      if (label) label.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      return Math.abs(rx - tx) > 0.1 || Math.abs(ry - ty) > 0.1;
    });

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      root.classList.remove('has-cursor');
    };
  }, []);
}

/* ── magnetic and tilt, delegated ──────────────────────────────────────── */

export function usePointerEffects(): void {
  useEffect(() => {
    if (!finePointer() || prefersReduced()) return;

    // Cached per hovered element so a pointermove never reads layout.
    let current: HTMLElement | null = null;
    let box: DOMRect | null = null;
    let kind: 'magnetic' | 'tilt' | null = null;

    const onOver = (e: MouseEvent) => {
      const el = e.target as Element | null;
      const magnetic = el?.closest?.<HTMLElement>('[data-magnetic]') ?? null;
      const tilt = el?.closest?.<HTMLElement>('[data-tilt]') ?? null;
      const next = magnetic ?? tilt;
      if (next === current) return;

      if (current) reset(current);
      current = next;
      kind = magnetic ? 'magnetic' : tilt ? 'tilt' : null;
      box = next ? next.getBoundingClientRect() : null;
    };

    const reset = (el: HTMLElement) => {
      el.style.setProperty('--mx', '0');
      el.style.setProperty('--my', '0');
      el.style.setProperty('--rx', '0');
      el.style.setProperty('--ry', '0');
    };

    const onMove = (e: MouseEvent) => {
      if (!current || !box) return;
      if (kind === 'magnetic') {
        const strength = Number(current.getAttribute('data-magnetic')) || 0.32;
        const dx = (e.clientX - (box.left + box.width / 2)) * strength;
        const dy = (e.clientY - (box.top + box.height / 2)) * strength;
        current.style.setProperty('--mx', clamp(dx, -18, 18).toFixed(2));
        current.style.setProperty('--my', clamp(dy, -14, 14).toFixed(2));
      } else if (kind === 'tilt') {
        const px = (e.clientX - box.left) / box.width - 0.5;
        const py = (e.clientY - box.top) / box.height - 0.5;
        current.style.setProperty('--ry', (px * 7).toFixed(2));
        current.style.setProperty('--rx', (-py * 7).toFixed(2));
      }
    };

    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mousemove', onMove);
    };
  }, []);
}

/* ── parallax: pointer on desktop, gyroscope on a phone ─────────────────── */

export function useParallax(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    if (prefersReduced()) return;
    const shapes = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
    if (!shapes.length) return;

    const loop = createLoop();
    let tiltX = 0;
    let tiltY = 0;
    let curX = 0;
    let curY = 0;

    loop.add(() => {
      curX = lerp(curX, tiltX, 0.07);
      curY = lerp(curY, tiltY, 0.07);
      shapes.forEach((el, i) => {
        const depth = (i % 3) * 8 + 14;
        el.style.translate = `${(curX * depth).toFixed(1)}px ${(curY * depth).toFixed(1)}px`;
      });
      return Math.abs(curX - tiltX) > 0.002 || Math.abs(curY - tiltY) > 0.002;
    });

    let cleanup = () => {};

    if (finePointer()) {
      const onMove = (e: MouseEvent) => {
        tiltX = (e.clientX / window.innerWidth - 0.5) * 2;
        tiltY = (e.clientY / window.innerHeight - 0.5) * 2;
        loop.schedule();
      };
      window.addEventListener('mousemove', onMove, { passive: true });
      cleanup = () => window.removeEventListener('mousemove', onMove);
    } else {
      const onTilt = (e: DeviceOrientationEvent) => {
        if (e.gamma === null || e.beta === null) return;
        tiltX = clamp((e.gamma ?? 0) / 45, -1, 1);
        tiltY = clamp(((e.beta ?? 0) - 45) / 45, -1, 1);
        loop.schedule();
      };
      // iOS gates this behind a prompt that may only be raised by a gesture;
      // asking unprompted is worse than the effect is worth.
      const request = (window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<PermissionState | 'granted' | 'denied'>;
      })?.requestPermission;

      if (typeof request !== 'function') {
        window.addEventListener('deviceorientation', onTilt, { passive: true });
        cleanup = () => window.removeEventListener('deviceorientation', onTilt);
      } else {
        const ask = () => {
          window.removeEventListener('pointerdown', ask);
          request()
            .then((state) => {
              if (state === 'granted') window.addEventListener('deviceorientation', onTilt, { passive: true });
            })
            .catch(() => {});
        };
        window.addEventListener('pointerdown', ask, { once: true });
        cleanup = () => {
          window.removeEventListener('pointerdown', ask);
          window.removeEventListener('deviceorientation', onTilt);
        };
      }
    }

    return () => {
      cleanup();
      shapes.forEach((el) => { el.style.translate = ''; });
    };
  }, [pathname]);
}

/* ── scroll: progress, velocity, nav tuck ───────────────────────────────── */

export function useScrollEffects(): void {
  useEffect(() => {
    const root = document.documentElement;
    const bar = document.getElementById('progress');
    const reduced = prefersReduced();
    // Under reduced motion the CSS hands the bar back to JS; otherwise the
    // scroll timeline already drives it on the compositor.
    const nativeProgress = !reduced && CSS.supports?.('animation-timeline: scroll()');

    let last = window.scrollY;
    let velocity = 0;
    let pending = false;

    const frame = () => {
      pending = false;
      const y = window.scrollY;
      const delta = y - last;
      last = y;

      velocity = lerp(velocity, clamp(delta, -60, 60), 0.2);
      root.style.setProperty('--scroll-velocity', velocity.toFixed(2));

      if (bar && !nativeProgress) {
        const max = root.scrollHeight - window.innerHeight;
        bar.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : '0');
      }

      const nav = document.querySelector('.site-nav');
      if (nav) {
        nav.classList.toggle('is-scrolled', y > 24);
        // Hysteresis, not a toggle: tuck on a decisive scroll down, return on
        // a decisive scroll up, hold position in between.
        if (delta > 4 && y > 400) nav.classList.add('is-tucked');
        else if (delta < -4 || y <= 400) nav.classList.remove('is-tucked');
      }
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(frame);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    frame();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}

/* ── reveals ────────────────────────────────────────────────────────────
   CSS hides [data-reveal] only under .js, so this owes every one of them a
   reveal. Re-scans per route, and the 4s sweep is the same promise the
   static site made: content never stays hidden because an observer didn't
   fire. */

export function useReveals(): void {
  useEffect(() => {
    const reveal = (el: Element) => el.classList.add('is-in');

    if (prefersReduced() || typeof IntersectionObserver !== 'function') {
      const showEverything = () => document.querySelectorAll('[data-reveal]').forEach(reveal);
      showEverything();
      const mo = new MutationObserver(showEverything);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
    );

    // Elements mount at any time, not just on navigation — switching the work
    // list to the deck and back is the obvious case, and the CSS hides an
    // unobserved [data-reveal] indefinitely. Watching the tree means nothing
    // can appear without being picked up.
    const known = new WeakSet<Element>();
    const timers: number[] = [];

    const claim = (node: HTMLElement) => {
      if (known.has(node) || node.classList.contains('is-in')) return;
      known.add(node);
      io.observe(node);
      // Each node carries its own safety net, so late arrivals get the same
      // promise as the ones present at load: never permanently hidden.
      timers.push(window.setTimeout(() => reveal(node), 4000));
    };

    // Initial pass covers whatever the route already rendered.
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(claim);

    /* The observer used to re-run this same full-document query on every
       mutation anywhere in <body> — including ones with nothing to do with
       reveals, like the command palette re-rendering its filtered list on
       every keystroke. That is a full-tree querySelectorAll per keypress.
       Restricting the scan to each mutation's own addedNodes finds exactly
       the same elements (nothing with [data-reveal] can appear except by
       being added), for a cost proportional to what actually changed. */
    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches('[data-reveal]')) claim(node);
          node.querySelectorAll<HTMLElement>('[data-reveal]').forEach(claim);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);
}

/** Everything the layout needs, in one call. */
export function useSiteMotion(): void {
  useCursor();
  usePointerEffects();
  useParallax();
  useScrollEffects();
  useReveals();
}

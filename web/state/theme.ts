/* Theme as a shared store rather than component state.

   It was a hook holding its own useState, which was fine while the nav was
   the only thing that could change the theme. The command palette can now
   change it too, and two independent copies of the same state drift the
   moment either one moves. The DOM attribute is the single source of truth;
   this just lets React subscribe to it. */

import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function apply(next: Theme): void {
  document.documentElement.setAttribute('data-theme', next);
  try {
    localStorage.setItem('mk-theme', next);
  } catch {
    /* storage disabled */
  }
  notify();
}

/** Swap the theme, wiping from `origin` if the browser can. */
export function toggleTheme(origin?: { x: number; y: number }): void {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Touch devices have a tighter animation budget and the circular wipe
     can feel sluggish on mid-range phones. Skip the transition there — the
     instant apply is actually snappier than a 520ms composited wipe on a
     device that's already GPU-bound rendering the page. */
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

  if (reduced || coarsePointer || !document.startViewTransition || !origin) {
    apply(next);
    return;
  }

  const root = document.documentElement;
  const { x, y } = origin;
  const reach = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  root.classList.add('theme-switching');
  const transition = document.startViewTransition(() => apply(next));
  transition.ready
    .then(() =>
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${reach}px at ${x}px ${y}px)`] },
        { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)', pseudoElement: '::view-transition-new(root)' }
      ).finished
    )
    .catch(() => { /* the swap happened; only the wipe failed */ })
    .then(() => root.classList.remove('theme-switching'));
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => 'light' as Theme);
}

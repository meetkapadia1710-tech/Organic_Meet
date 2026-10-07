/* Theme as a shared store rather than component state.

   It was a hook holding its own useState, which was fine while the nav was
   the only thing that could change the theme. The command palette can now
   change it too, and two independent copies of the same state drift the
   moment either one moves. The DOM attribute is the single source of truth;
   this just lets React subscribe to it. */

import { useSyncExternalStore } from 'react';
import { motionReduced } from './motion';
import { transitionBusy } from '../lib/transitions';

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

let pendingTheme: Theme | null = null;
let wipe: ViewTransition | undefined;
let generation = 0;

/** Rapid toggles still apply every requested state; only the optional wipe is skipped. */
export function toggleTheme(origin?: { x: number; y: number }): void {
  const next: Theme = (pendingTheme ?? getTheme()) === 'dark' ? 'light' : 'dark';
  const token = ++generation;
  pendingTheme = next;
  wipe?.skipTransition();
  const root = document.documentElement;
  if (motionReduced() || window.matchMedia('(pointer: coarse)').matches || !document.startViewTransition || !origin || transitionBusy()) {
    apply(next); pendingTheme = null; root.classList.remove('theme-switching'); return;
  }
  const { x, y } = origin;
  const reach = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.classList.add('theme-switching');
  const transition = document.startViewTransition(() => { if (token === generation) { apply(next); pendingTheme = null; } });
  wipe = transition;
  transition.ready.then(async () => {
    if (token !== generation || motionReduced()) { transition.skipTransition(); return; }
    await root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${reach}px at ${x}px ${y}px)`] },
      { duration: 360, easing: 'cubic-bezier(.16,1,.3,1)', pseudoElement: '::view-transition-new(root)' }).finished;
  }).catch(() => {}).finally(() => {
    if (token === generation) { root.classList.remove('theme-switching'); pendingTheme = null; wipe = undefined; }
  });
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => 'light' as Theme);
}

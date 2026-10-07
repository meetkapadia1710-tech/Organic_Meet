/* Which rendering of the work the homepage is showing.

   A store rather than local state because the command palette can switch it
   too, and the switch is remembered between visits. */

import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import { motionReduced } from './motion';
import { transitionBusy } from '../lib/transitions';

export type WorkView = 'list' | 'deck';

const listeners = new Set<() => void>();
let current: WorkView = read();
let selected: string | undefined;

export function getSelectedProject(): string | undefined { return selected; }
export function setSelectedProject(slug: string): void { selected = slug; }

function read(): WorkView {
  try {
    return localStorage.getItem('mk-view') === 'deck' ? 'deck' : 'list';
  } catch {
    return 'list';
  }
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getView(): WorkView {
  return current;
}

export function setView(next: WorkView): void {
  if (next === current) return;
  const apply = () => {
  current = next;
  try {
    localStorage.setItem('mk-view', next);
  } catch {
    /* storage disabled */
  }
  listeners.forEach((fn) => fn());
  };
  if (typeof document === 'undefined' || motionReduced() || !document.startViewTransition || transitionBusy()) { apply(); return; }
  const root = document.documentElement;
  root.classList.add('view-switching');
  const transition = document.startViewTransition(() => flushSync(apply));
  transition.finished.catch(() => {}).finally(() => root.classList.remove('view-switching'));
}

export function useWorkView(): WorkView {
  return useSyncExternalStore(subscribe, getView, () => 'list' as WorkView);
}

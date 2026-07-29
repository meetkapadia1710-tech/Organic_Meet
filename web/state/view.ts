/* Which rendering of the work the homepage is showing.

   A store rather than local state because the command palette can switch it
   too, and the switch is remembered between visits. */

import { useSyncExternalStore } from 'react';

export type WorkView = 'list' | 'deck';

const listeners = new Set<() => void>();
let current: WorkView = read();

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
  current = next;
  try {
    localStorage.setItem('mk-view', next);
  } catch {
    /* storage disabled */
  }
  listeners.forEach((fn) => fn());
}

export function useWorkView(): WorkView {
  return useSyncExternalStore(subscribe, getView, () => 'list' as WorkView);
}

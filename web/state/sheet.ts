/* Whether the keyboard-shortcuts sheet is showing.

   It used to be local state in useKeyboard that built its own DOM node, with
   the command palette poking it through a CustomEvent. That indirection was
   the source of a bug where the event fired but the sheet never appeared,
   and it was never worth the coupling it avoided — this is a boolean. */

import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();
let open = false;

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function isSheetOpen(): boolean {
  return open;
}

export function setSheetOpen(next: boolean): void {
  if (next === open) return;
  open = next;
  listeners.forEach((fn) => fn());
}

export function toggleSheet(): void {
  setSheetOpen(!open);
}

export function useSheetOpen(): boolean {
  return useSyncExternalStore(subscribe, isSheetOpen, () => false);
}

/* ─────────────────────────────────────────────────────────────────────────
   devmode.ts — whether the hidden Digital Garden is running.

   The spec asked for a `DeveloperModeContext`. This is a shared store
   instead, deliberately: `theme.ts`, `sheet.ts` and `view.ts` all use
   `useSyncExternalStore` here, and the comment at the top of `theme.ts`
   records why — the palette used to be component state, the command palette
   learned to change it too, and two independent copies of the same state
   drifted the moment either one moved.

   Dev mode has exactly that shape. It is read by the nav, the hero, the
   keyboard layer and the overlay itself, and written from three places (the
   Konami sequence, the logo tap, and Escape). A Provider would also have to
   wrap the tree above `Layout`, which means the main bundle carries it
   whether or not anyone ever finds the egg. A module-level boolean carries
   nothing.
   ───────────────────────────────────────────────────────────────────────── */

import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();

let on = false;

/* Two flags, not one, and the distinction is the whole point: `seenBefore`
   remembers that the egg has been found this session, `firstRun` records
   whether *this particular* activation was the discovery. The achievement
   toast reads `firstRun`, so being congratulated happens exactly once —
   toggling dev mode off and on again does not re-award it. */
let seenBefore = false;
let firstRun = false;

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function notify(): void {
  listeners.forEach((fn) => fn());
}

export function isDevMode(): boolean {
  return on;
}

/** True only for the activation that was the discovery. */
export function isFirstRun(): boolean {
  return firstRun;
}

export function setDevMode(next: boolean): void {
  if (next === on) return;
  on = next;

  /* The class on <html> is what lets CSS do the parts CSS should do: pausing
     the marquees, thickening the glass, re-skinning the existing custom
     cursor. Doing that in JS would mean a second cursor system and a second
     animation controller fighting the ones already there. */
  document.documentElement.classList.toggle('dev-mode', on);

  if (on) {
    firstRun = !seenBefore;
    seenBefore = true;
  }

  notify();
}

export function toggleDevMode(): void {
  setDevMode(!on);
}

export function useDevMode(): boolean {
  return useSyncExternalStore(subscribe, isDevMode, () => false);
}

/* ── terminal ────────────────────────────────────────────────────────────
   Kept in the same store rather than local to the overlay, because the
   keyboard layer in the main bundle has to be able to open it (⌘/Ctrl + `)
   without importing anything from the lazy chunk. */

let terminalOpen = false;

export function isTerminalOpen(): boolean {
  return terminalOpen;
}

export function setTerminalOpen(next: boolean): void {
  if (next === terminalOpen) return;
  terminalOpen = next;
  notify();
}

export function useTerminalOpen(): boolean {
  return useSyncExternalStore(subscribe, isTerminalOpen, () => false);
}

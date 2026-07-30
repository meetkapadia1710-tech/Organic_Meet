/* ─────────────────────────────────────────────────────────────────────────
   useKonamiCode — ↑ ↑ ↓ ↓ ← → ← → B A

   Runs in the main bundle, so it stays tiny: one array index and a timer.
   Nothing about the Easter Egg itself is imported here.

   Two details that matter more than they look:

   - It must not fire while someone is typing. The site has a command palette
     and, once dev mode is on, a terminal — typing "ba" into either of those
     should not be the last two keys of a cheat code.
   - Arrow keys scroll. The sequence deliberately does *not* preventDefault:
     swallowing arrow keys to watch for a code nobody is entering would break
     keyboard scrolling for everyone, all the time, to serve a feature almost
     nobody triggers. The page scrolling a little while you enter it is a fair
     trade, and honestly part of the fun.
   ───────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef } from 'react';

const SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
] as const;

/** Long enough to be enterable by someone who isn't in a hurry, short enough
 *  that a stray 'a' minutes later doesn't complete a half-finished sequence. */
const WINDOW_MS = 4000;

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

export function useKonamiCode(onUnlock: () => void): void {
  // Held in a ref so the listener never needs rebinding when it changes.
  const unlock = useRef(onUnlock);
  unlock.current = onUnlock;

  useEffect(() => {
    let index = 0;
    let timer: number | null = null;

    const reset = () => {
      index = 0;
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;

      const expected = SEQUENCE[index];
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      if (key !== expected) {
        // A wrong key is not always a failure: it might be the first key of a
        // fresh attempt, which is how ↑↑ works at all.
        reset();
        if (key === SEQUENCE[0]) index = 1;
        return;
      }

      index += 1;

      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(reset, WINDOW_MS);

      if (index === SEQUENCE.length) {
        reset();
        unlock.current();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, []);
}

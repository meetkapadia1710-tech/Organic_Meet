/* ─────────────────────────────────────────────────────────────────────────
   DeveloperMode — the overlay root, and the entry point of the lazy chunk.

   Nothing in this file (or anything it imports) is in the main bundle. It is
   reached only through the `React.lazy` boundary in `./index.tsx`, which is
   itself only rendered once the egg has been unlocked — so a visitor who
   never finds it never downloads a byte of this.

   What this owns:
   - the darkening / gradient wash
   - the falling word field
   - the stats card and the rotating quote
   - the achievement toast, once per session
   - the terminal, and the one keyboard listener that opens it
   - Escape, as the single authority on what dismissing means

   What this deliberately does *not* own:
   - **the cursor.** The site already has a three-element custom cursor
     (`#cursor`, `#cursor-ring`, `#cursor-label`) driven by `useMotion`. Dev
     mode re-skins it in CSS through `html.dev-mode` rather than mounting a
     second cursor system on top of a working one.
   - **pausing the existing animations.** Also CSS, off the same class. The
     marquees and the stack rows get `animation-play-state: paused`, which is
     smoother than anything JS could do and cannot desynchronise them.
   - **the hero "camera zoom."** A transform on the existing WebGL layer, in
     CSS. The R3F scene is untouched.
   ───────────────────────────────────────────────────────────────────────── */

import { useEffect, useMemo } from 'react';
import { setDevMode, setTerminalOpen, isTerminalOpen, useTerminalOpen } from '../../state/devmode';
import { DigitalRain } from './DigitalRain';
import { DeveloperStats } from './DeveloperStats';
import { AchievementToast } from './AchievementToast';
import { DeveloperTerminal } from './DeveloperTerminal';

export default function DeveloperMode({ celebrate }: { celebrate: boolean }) {
  const terminalOpen = useTerminalOpen();

  /* Reduced motion keeps the *skin* — the glass, the glow, the stats, the
     terminal — and drops the moving parts. Turning the whole egg off would
     mean a visitor who prefers less motion cannot see the thing they went
     looking for; dropping the falling field is enough. */
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const rainCount = useMemo(() => {
    if (reduced) return 0;
    if (typeof window === 'undefined') return 0;
    /* Cut hard from the original 42. Behind the content rather than over it,
       the field reads as texture at a third of the density — at 42 it was
       just noise competing with the type it sits under. */
    return window.innerWidth < 720 ? 8 : 16;
  }, [reduced]);

  /* One listener, two shortcuts, and the single authority on Escape. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ⌘/Ctrl + ` — checked against `code` as well, because on several
      // layouts the backtick key does not report "`" as its value.
      if ((e.metaKey || e.ctrlKey) && (e.key === '`' || e.code === 'Backquote')) {
        e.preventDefault();
        setTerminalOpen(!isTerminalOpen());
        return;
      }

      if (e.key === 'Escape') {
        // Layered dismissal: the terminal first, the garden second. Never
        // both on one press.
        if (isTerminalOpen()) {
          setTerminalOpen(false);
          return;
        }
        setDevMode(false);
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* Leaving must not strand the terminal open — it would reappear, already
     open, the next time the egg is unlocked. */
  useEffect(() => () => setTerminalOpen(false), []);

  return (
    <>
      {/* Layer 1 — atmosphere, *behind* the page.

          This is the correction that mattered. The first version put all of
          this at z-index 600, i.e. on top of the type, with a 55% veil across
          it: the page came out dimmed and muddy rather than transformed. The
          body background now does the darkening, and everything decorative
          sits behind the content at full contrast. */}
      <div className="devmode-atmos" aria-hidden="true">
        <div className="devmode-bloom" />
        {rainCount > 0 && <DigitalRain count={rainCount} />}
      </div>

      {/* Layer 2 — interface, above the page. Click-through except for the
          few things that are actually controls. */}
      {/* The rotating quote used to float bottom-centre, where it collided
          with both the message (bottom-left) and the stats card
          (bottom-right) on any short viewport. Three panels sharing the
          bottom band was the crowding, so it moved inside the terminal — it
          has room there, and it reads as part of the shell rather than as a
          fourth thing demanding attention. */}
      <div className="devmode-ui">
        <DeveloperStats />

        {celebrate && <AchievementToast />}
        {terminalOpen && <DeveloperTerminal />}

        {/* A permanent, quiet way out that does not assume a keyboard — the
            Konami code implies one, the seven-tap mobile door does not. */}
        <button type="button" className="devmode-exit" onClick={() => setDevMode(false)}>
          Exit
        </button>
      </div>
    </>
  );
}

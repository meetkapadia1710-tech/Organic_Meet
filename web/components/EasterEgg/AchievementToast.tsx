/* ─────────────────────────────────────────────────────────────────────────
   AchievementToast — the 🏆, and the secret message.

   Two beats, one component: the achievement slides in immediately, the longer
   note fades up under it a moment later. Both dismiss together, and the whole
   thing is `role="status"` so a screen reader is told what happened rather
   than being left in a page that silently rearranged itself.

   It leaves on its own after a while, and can be dismissed early. It does not
   trap focus — nothing here needs a decision from the visitor, and stealing
   focus for a congratulation would be worse than not showing one.
   ───────────────────────────────────────────────────────────────────────── */

import { useEffect, useState } from 'react';

const LINGER = 11000;

export function AchievementToast() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const out = window.setTimeout(() => setLeaving(true), LINGER);
    const done = window.setTimeout(() => setGone(true), LINGER + 700);
    return () => {
      window.clearTimeout(out);
      window.clearTimeout(done);
    };
  }, []);

  if (gone) return null;

  return (
    <div className={`devtoast${leaving ? ' is-leaving' : ''}`} role="status">
      <button
        type="button"
        className="devtoast-dismiss"
        aria-label="Dismiss"
        onClick={() => setLeaving(true)}
      >
        ✕
      </button>

      <div className="devtoast-badge">
        <span className="devtoast-trophy" aria-hidden="true">🏆</span>
        <div>
          <div className="devtoast-kicker">Achievement unlocked</div>
          <div className="devtoast-title">Curious Explorer</div>
        </div>
      </div>

      <div className="devtoast-note">
        <p className="devtoast-seed" aria-hidden="true">🌱</p>
        <p>You found the hidden Digital Garden.</p>
        <p className="devtoast-muted">
          Most visitors browse. Curious people explore. Builders look deeper.
        </p>
        <p>Thanks for taking the time to explore mine.</p>
        <p className="devtoast-sign">— Meet Kapadia</p>
        <p className="devtoast-hint">
          <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>`</kbd> opens a terminal · <kbd>Esc</kbd> to leave
        </p>
      </div>
    </div>
  );
}

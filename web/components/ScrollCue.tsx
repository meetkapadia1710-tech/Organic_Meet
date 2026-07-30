/* The scroll cue.

   A hero that fills the viewport with a headline and nothing else gives no
   sign there is more below it — this is the sign. A drawn line with a
   travelling dot rather than a bouncing chevron, which is the same idea
   without the twitch.

   It removes itself permanently on the first scroll of any kind. A cue that
   comes back every time you return to the top is a cue that stopped being
   information and started being decoration: once you have scrolled, you know.

   Not a button. It is `aria-hidden` and non-interactive, because the thing
   it points at is already reachable — the skip link, the nav and the command
   palette all get you into the page, and adding a fourth control that only
   works with a pointer would be the wrong kind of help. */

import { useEffect, useState } from 'react';

export function ScrollCue() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setGone(true);
      return;
    }
    // Already down the page on load — a restored scroll position, or a hash
    // link. The cue would be pointing at content that is already behind you.
    if (window.scrollY > 40) {
      setGone(true);
      return;
    }
    const onScroll = () => {
      if (window.scrollY > 40) setGone(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (gone) return null;

  return (
    <div className="scroll-cue" aria-hidden="true">
      <span className="scroll-cue-label">Scroll</span>
      <span className="scroll-cue-rail">
        <span className="scroll-cue-dot" />
      </span>
    </div>
  );
}

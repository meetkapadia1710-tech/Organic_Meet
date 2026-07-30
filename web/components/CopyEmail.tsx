/* Copy the address without leaving the page, and say so in place.

   The label swaps inside the button rather than raising a toast: a toast is
   a second thing to look at, somewhere else on the screen, for a
   confirmation that belongs on the control you just pressed. The button is
   sized by its widest state so the swap does not reflow the row — the same
   grid-cell stacking trick SwapText uses, for the same reason.

   `aria-live="polite"` on the label so the change is announced; the button's
   accessible name stays put, because the name changing under a screen reader
   mid-interaction is disorienting.

   The mailto link beside this one is unchanged and still the primary action —
   this is for the case where you want the address in a form, not a client. */

import { useEffect, useRef, useState } from 'react';

const REVERT_MS = 2000;

export function CopyEmail({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  // A click at 1.9s would otherwise be reverted by the *previous* click's
  // timer 100ms later, leaving the button saying "Copy" right after a copy.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      /* Clipboard denied (insecure origin, or the permission was refused).
         Saying "Copied" when nothing was copied is worse than staying quiet,
         so the label does not move. */
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), REVERT_MS);
  };

  return (
    <button
      type="button"
      data-magnetic
      className={`btn btn-secondary copy-email${copied ? ' is-copied' : ''}`}
      style={{ borderRadius: 999 }}
      onClick={copy}
      aria-label={`Copy ${address} to the clipboard`}
    >
      <span className="copy-stack" aria-live="polite">
        <span className="copy-face copy-idle">Copy address</span>
        <span className="copy-face copy-done">Copied ✓</span>
      </span>
    </button>
  );
}

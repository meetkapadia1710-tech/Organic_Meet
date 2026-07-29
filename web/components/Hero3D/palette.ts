/* ─────────────────────────────────────────────────────────────────────────
   palette.ts — the scene's colours, read from the stylesheet.

   Nothing here is a literal colour, for the same reason nothing else on this
   site is: the Organic ramps reverse wholesale in dark mode, so a hardcoded
   hex would be correct in one theme and wrong in the other. The scene asks
   the document what `--color-accent-400` currently resolves to and builds
   its materials from that — which means the 3D inherits the identity for
   free, and keeps inheriting it if the palette is ever retuned.

   THREE.Color parses the hex strings these tokens hold directly. The tokens
   are plain 6-digit hex (see styles/styles.css), not oklch(), so no colour
   conversion is needed — if that ever changes, `read()` is the one place
   that has to learn about it.
   ───────────────────────────────────────────────────────────────────────── */

import { Color } from 'three';

export interface ScenePalette {
  /** The page ground — what the glass is seen against. */
  bg: Color;
  /** Warm accent, light → dark. */
  warm: [Color, Color, Color];
  /** Green second accent, light → dark. */
  green: [Color, Color, Color];
  /** Drifting particles. */
  spore: Color;
  /** Key and fill light. */
  key: Color;
  fill: Color;
}

function read(name: string, fallback: string): Color {
  if (typeof window === 'undefined') return new Color(fallback);
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  // An empty string means the token was renamed; falling back keeps the
  // scene lit rather than turning every material black.
  try {
    return new Color(raw || fallback);
  } catch {
    return new Color(fallback);
  }
}

/** Snapshot the current theme's colours. Call again after a theme change —
 *  the values are copied, not live. */
export function readPalette(): ScenePalette {
  return {
    bg: read('--color-bg', '#f5ead8'),
    warm: [
      read('--color-accent-300', '#ffc6a5'),
      read('--color-accent-400', '#f6a06b'),
      read('--color-accent-600', '#b2622d'),
    ],
    green: [
      read('--color-accent-2-200', '#e1eecc'),
      read('--color-accent-2-400', '#aebf92'),
      read('--color-accent-2-600', '#728157'),
    ],
    spore: read('--color-accent-500', '#d67f48'),
    key: read('--color-accent-200', '#ffe1d0'),
    fill: read('--color-accent-2-300', '#ccdbb2'),
  };
}

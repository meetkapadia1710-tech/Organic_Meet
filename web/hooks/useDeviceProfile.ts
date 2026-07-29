/* ─────────────────────────────────────────────────────────────────────────
   useDeviceProfile — how much 3D this machine should be asked to do.

   Resolved synchronously on first call, before anything renders, because the
   answer decides whether the WebGL chunk is downloaded at all. A device that
   comes back `'none'` never pays a byte for Three.js: the import is inside a
   branch that never runs, not merely a component that never mounts.

   The tiers are deliberately coarse. Precise device detection is a losing
   game — the useful question is only ever "can this thing hold 60fps with a
   handful of transparent meshes", and three buckets answer it.
   ───────────────────────────────────────────────────────────────────────── */

export type DeviceTier = 'none' | 'low' | 'high';

export interface DeviceProfile {
  tier: DeviceTier;
  /** Organic forms to place. */
  forms: number;
  /** Points in the drifting field. */
  particles: number;
  /** Real refraction is a whole extra render pass — earned, not assumed. */
  transmission: boolean;
  /** Cap the pixel ratio; a 3x phone screen is 9x the fragments for no
   *  visible gain on soft, blurred shapes. */
  dpr: [number, number];
}

const NONE: DeviceProfile = { tier: 'none', forms: 0, particles: 0, transmission: false, dpr: [1, 1] };

const LOW: DeviceProfile = { tier: 'low', forms: 4, particles: 90, transmission: false, dpr: [1, 1.5] };

const HIGH: DeviceProfile = { tier: 'high', forms: 7, particles: 260, transmission: true, dpr: [1, 2] };

/** Cached — the answer cannot change without a reload, and every caller
 *  asking the same question should get the same object identity. */
let cached: DeviceProfile | null = null;

function detect(): DeviceProfile {
  if (typeof window === 'undefined') return NONE;

  // The hard contract, same as every other motion system in this codebase:
  // reduced motion means no scene at all, not a slower one.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return NONE;

  // No WebGL2, no scene. Checked by actually asking for a context rather than
  // sniffing `window.WebGL2RenderingContext`, which exists on machines whose
  // driver still refuses to hand one over.
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2');
    if (!gl) return NONE;
    // Release it immediately; contexts are a limited resource and the real
    // renderer wants its own.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    return NONE;
  }

  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

  // Data Saver is an explicit request not to download a few hundred KB of
  // WebGL for decoration.
  if (nav.connection?.saveData) return NONE;

  const memory = nav.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.innerWidth < 900;

  // Genuinely weak hardware gets nothing. Two cores or ≤2GB will not hold a
  // frame budget alongside React, and a scene that stutters reads as broken
  // rather than premium — the whole point is the opposite.
  if (memory <= 2 || cores <= 2) return NONE;

  // Phones and tablets get the cheap version: fewer forms, no refraction.
  if (coarse || narrow || memory <= 4 || cores <= 4) return LOW;

  return HIGH;
}

export function getDeviceProfile(): DeviceProfile {
  if (!cached) cached = detect();
  return cached;
}

/** Hook form. No state: the value is fixed for the life of the document, so
 *  subscribing to it would be inventing a change that cannot happen. */
export function useDeviceProfile(): DeviceProfile {
  return getDeviceProfile();
}

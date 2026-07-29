/* ─────────────────────────────────────────────────────────────────────────
   CameraRig — where the scene is watched from.

   Two inputs, one camera. The pointer pushes it a little off-axis; the page
   scroll pulls it back and up so the garden sinks away as the next section
   arrives. Both are eased toward a target rather than set, so nothing in the
   scene can move at the speed of an input event.

   Parallax is not computed. The forms sit at seven different depths, so
   moving the camera at all produces true parallax for free — near forms
   sweep, far ones barely shift. Faking it per-object would be more code and
   less correct.

   The pointer is tracked on `window`, not through R3F's own pointer state,
   because the canvas is `pointer-events: none` — it has to be, or it would
   swallow every click meant for the headline and the links above it. So R3F
   never receives a pointer event, and the rig listens where the events
   actually are.
   ───────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

const BASE_Z = 6;
/** How far the pointer is allowed to move the camera, in world units. */
const SWAY_X = 0.55;
const SWAY_Y = 0.32;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function CameraRig() {
  const camera = useThree((state) => state.camera);

  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0, scroll: 0 });

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      // Normalised to -1..1 across the viewport. Centre is rest.
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    // A pointer leaving the window should return the scene to rest rather
    // than freezing it mid-lean.
    const onLeave = () => {
      target.current.x = 0;
      target.current.y = 0;
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  useFrame(() => {
    // Scroll through the first viewport height, clamped. Past that the hero
    // is gone and there is nothing left to move.
    const raw = window.scrollY / Math.max(window.innerHeight, 1);
    const scrollTarget = Math.min(Math.max(raw, 0), 1);

    // Slower easing on the pointer than the eye expects, which is what makes
    // it read as weight rather than as lag.
    current.current.x = lerp(current.current.x, target.current.x, 0.045);
    current.current.y = lerp(current.current.y, target.current.y, 0.045);
    current.current.scroll = lerp(current.current.scroll, scrollTarget, 0.08);

    const { x, y, scroll } = current.current;

    camera.position.x = x * SWAY_X;
    camera.position.y = -y * SWAY_Y + scroll * 1.9;
    camera.position.z = BASE_Z + scroll * 3.4;

    // Keep the cluster framed while the camera rises, so it sinks out of
    // frame rather than sliding off the side.
    camera.lookAt(0.6, scroll * 0.8, 0);
  });

  return null;
}

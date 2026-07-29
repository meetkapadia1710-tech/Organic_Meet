/* ─────────────────────────────────────────────────────────────────────────
   Particles — the drift.

   One `<points>` for the whole field: a few hundred elements in a single
   draw call, which is the case instancing actually exists for. Positions
   live in one Float32Array that is mutated in place and re-uploaded once per
   frame; nothing here allocates after mount.

   They rise. Slowly, with a sideways sway, wrapping to the bottom when they
   pass the top — pollen in still air, not snow and not sparks.
   ───────────────────────────────────────────────────────────────────────── */

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, CanvasTexture, NormalBlending, type Points } from 'three';
import type { ScenePalette } from './palette';

const SPREAD_X = 11;
const SPREAD_Y = 7;
const SPREAD_Z = 7;

/* A square is the default, and a square reads as a particle system rather
   than as something drifting. This paints one soft radial dot into a 64px
   canvas — no network request, no texture file, and small enough that the
   upload cost is irrelevant. */
function makeDotTexture(): CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.55)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  return new CanvasTexture(canvas);
}

export function Particles({
  palette,
  count,
  dark,
}: {
  palette: ScenePalette;
  count: number;
  dark: boolean;
}) {
  const points = useRef<Points>(null);

  const texture = useMemo(() => makeDotTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);

  /* Positions plus a per-particle rate and phase, generated once. Rebuilt
     only if the count changes, which it does not after mount. */
  const { positions, rates, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const rates = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * SPREAD_X;
      positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y;
      positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD_Z - 1;
      rates[i] = 0.04 + Math.random() * 0.09;
      phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, rates, phases };
  }, [count]);

  useFrame((state, delta) => {
    const node = points.current;
    if (!node) return;

    // A tab left in the background hands back one enormous delta on return;
    // clamping stops the field teleporting.
    const step = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const attribute = node.geometry.attributes['position'];
    if (!attribute) return;

    const array = attribute.array as Float32Array;

    for (let i = 0; i < count; i += 1) {
      const y = i * 3 + 1;
      const rate = rates[i] ?? 0.05;
      const phase = phases[i] ?? 0;

      array[y] = (array[y] ?? 0) + rate * step;

      // Sway, so they do not travel in visible vertical lines.
      array[i * 3] = (array[i * 3] ?? 0) + Math.sin(t * 0.3 + phase) * step * 0.06;

      if ((array[y] ?? 0) > SPREAD_Y / 2) {
        array[y] = -SPREAD_Y / 2;
        array[i * 3] = (Math.random() - 0.5) * SPREAD_X;
      }
    }

    attribute.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        color={palette.spore}
        size={0.075}
        sizeAttenuation
        transparent
        /* Additive glows against a dark ground and washes out to nothing
           against a light one, so it is worth having only in dark mode. The
           cream theme uses normal blending, where a mid-ramp accent stays
           visible instead of burning to white. */
        blending={dark ? AdditiveBlending : NormalBlending}
        opacity={dark ? 0.55 : 0.4}
        depthWrite={false}
      />
    </points>
  );
}

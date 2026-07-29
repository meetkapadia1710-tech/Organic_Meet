/* ─────────────────────────────────────────────────────────────────────────
   OrganicField — the growing forms.

   Seven soft bodies on a loose orbit, breathing. Each one is the same
   sphere geometry scaled unevenly on three axes by three sine waves running
   at different rates, which is what stops them reading as spheres: the
   silhouette never repeats and never settles, but it also never does
   anything sudden. That is the whole trick, and it costs three multiplies
   per frame per form.

   Why not instanced: the brief asks for instancing "where possible", and
   here it isn't worth it. Seven meshes is seven draw calls — noise next to
   the transmission pass — and instancing would force one shared material,
   losing the per-form colour and opacity that makes the cluster read as
   depth rather than as a pile. The particles are the part with thousands of
   elements, and those are a single `<points>` (see Particles.tsx).

   The geometry is built once and shared by every form; only the transforms
   and materials differ.
   ───────────────────────────────────────────────────────────────────────── */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { IcosahedronGeometry, type Group, type Mesh } from 'three';
import type { ScenePalette } from './palette';
import type { DeviceProfile } from '../../hooks/useDeviceProfile';

interface Form {
  position: [number, number, number];
  radius: number;
  /** Which palette entry — warm or green, and how deep. */
  tone: 'warm' | 'green';
  step: 0 | 1 | 2;
  opacity: number;
  /** Desynchronises every sine so nothing pulses in unison. */
  phase: number;
  spin: number;
}

/* Composed for the layout it sits behind: the headline is left-aligned and
   about 15 characters wide, so the mass sits right of centre where the page
   is empty, with two quiet forms far back on the left for depth behind the
   text rather than on top of it. */
const FORMS: Form[] = [
  { position: [2.1, 0.35, 0], radius: 1.15, tone: 'warm', step: 1, opacity: 0.92, phase: 0, spin: 0.05 },
  { position: [3.15, -1.15, -1.6], radius: 0.72, tone: 'green', step: 1, opacity: 0.85, phase: 1.9, spin: -0.07 },
  { position: [1.15, 1.65, -1.1], radius: 0.5, tone: 'warm', step: 0, opacity: 0.8, phase: 3.4, spin: 0.09 },
  { position: [3.6, 1.1, -2.9], radius: 0.9, tone: 'green', step: 2, opacity: 0.55, phase: 5.1, spin: -0.04 },
  { position: [0.35, -1.6, -2.2], radius: 0.62, tone: 'warm', step: 2, opacity: 0.6, phase: 2.4, spin: 0.06 },
  { position: [-2.4, 0.9, -4.2], radius: 1.05, tone: 'green', step: 0, opacity: 0.4, phase: 4.2, spin: 0.03 },
  { position: [-1.5, -1.35, -3.6], radius: 0.55, tone: 'warm', step: 1, opacity: 0.35, phase: 0.8, spin: -0.05 },
];

export function OrganicField({ palette, profile }: { palette: ScenePalette; profile: DeviceProfile }) {
  const group = useRef<Group>(null);
  const meshes = useRef<Array<Mesh | null>>([]);

  const forms = useMemo(() => FORMS.slice(0, profile.forms), [profile.forms]);

  /* One geometry for every form. Detail 3 is 1,280 triangles — already past
     the point where the silhouette reads as faceted at this size, so detail
     4 would be 4x the vertices to fix something nobody can see. */
  const geometry = useMemo(() => new IcosahedronGeometry(1, profile.tier === 'high' ? 4 : 3), [profile.tier]);

  // R3F does not dispose geometry it did not create.
  useMemo(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    for (let i = 0; i < forms.length; i += 1) {
      const mesh = meshes.current[i];
      const form = forms[i];
      if (!mesh || !form) continue;

      const { phase, radius, spin } = form;

      // Three rates, deliberately not multiples of each other, so the shape
      // never returns to the same silhouette on a countable loop.
      mesh.scale.set(
        radius * (1 + Math.sin(t * 0.31 + phase) * 0.085),
        radius * (1 + Math.sin(t * 0.23 + phase * 1.7) * 0.105),
        radius * (1 + Math.sin(t * 0.27 + phase * 2.3) * 0.075)
      );

      mesh.rotation.x = t * spin * 0.6 + phase;
      mesh.rotation.y = t * spin + phase * 0.5;

      // A slow rise and fall, offset per form.
      mesh.position.y = form.position[1] + Math.sin(t * 0.19 + phase) * 0.16;
    }

    // The cluster itself turns, very slowly — enough that a returning glance
    // finds it somewhere new, not enough to notice while reading.
    if (group.current) group.current.rotation.y = Math.sin(t * 0.05) * 0.09;
  });

  return (
    <group ref={group}>
      {forms.map((form, i) => {
        const tone = form.tone === 'warm' ? palette.warm : palette.green;
        const color = tone[form.step];

        return (
          <mesh
            key={i}
            ref={(node) => {
              meshes.current[i] = node;
            }}
            geometry={geometry}
            position={form.position}
          >
            {profile.transmission ? (
              /* Real refraction: the scene behind is rendered into a buffer
                 and bent through the surface. It is the expensive option and
                 the reason `transmission` is gated on device tier. */
              <meshPhysicalMaterial
                color={color}
                transmission={0.94}
                thickness={form.radius * 1.6}
                roughness={0.22}
                ior={1.35}
                clearcoat={0.5}
                clearcoatRoughness={0.35}
                transparent
                opacity={form.opacity}
                envMapIntensity={1.1}
              />
            ) : (
              /* The cheap read of the same idea: translucent, soft, lit the
                 same way. No transmission pass, no refraction, and at this
                 blur and scale the difference is far smaller than the frame
                 budget it buys back on a phone. */
              <meshStandardMaterial
                color={color}
                roughness={0.45}
                metalness={0}
                transparent
                opacity={form.opacity * 0.62}
              />
            )}
          </mesh>
        );
      })}
    </group>
  );
}

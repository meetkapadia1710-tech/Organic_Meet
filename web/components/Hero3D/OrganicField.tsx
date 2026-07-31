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
  /**
   * How far this form is allowed to wander from `position`, per axis, in
   * world units. Kept per-form rather than global because the budget is not
   * the same everywhere: the near forms are small and have room, the far ones
   * are enormous and a wide drift would swing them across the whole frame.
   */
  drift: [number, number, number];
}

/* ── the wander ─────────────────────────────────────────────────────────
   Three sines summed, with weights adding to exactly 1 so the result is
   always within [-1, 1] and the drift can never exceed the budget above.

   Why not actual randomness: a random walk drifts (nothing returns, forms
   eventually pile up in a corner), and per-frame noise is not frame-rate
   independent unless it is integrated properly. Simplex noise would work and
   costs a dependency this scene has deliberately avoided.

   The frequencies are the whole trick. 0.127 / 0.0713 / 0.0389 are close to
   mutually irrational, so the combined path does not visibly repeat for
   hours — the eye never finds the loop, which is what "random" actually
   means here. Multiples of each other would produce an obvious figure-eight
   within a few seconds.

   Deterministic, so it is identical on every machine and every reload, and
   it is a pure function of elapsed time — a dropped frame changes nothing,
   and a tab restored after an hour resumes in the right place rather than
   jumping. */
const wander = (t: number, phase: number, seed: number): number =>
  Math.sin(t * 0.127 + phase) * 0.6 +
  Math.sin(t * 0.0713 + phase * 2.3 + seed) * 0.28 +
  Math.sin(t * 0.0389 + phase * 3.7 + seed * 1.9) * 0.12;

/* Recomposed for a full-bleed hero. The previous arrangement pushed the whole
   mass right of centre because the headline used to occupy the left half of
   the same box; now the type sits at the edges of the frame and the middle
   belongs to the scene, so the cluster is composed to fill it.

   Three depth layers, and the depth is the point — the old field put every
   form within four units of the camera, so nothing read as far away and the
   cluster looked like flat circles on a plane:

   - **Near** (z ≥ 0.8): small, sharp, near-opaque. Establishes scale.
   - **Mid** (z -0.6 to -2.6): the readable bodies.
   - **Far** (z ≤ -5): large and very faint. These are atmosphere, not
     objects; the fog in HeroCanvas takes them most of the way to the page
     ground, which is what puts air between the layers.

   Ordered so a truncated slice is still a composition. `profile.forms` takes
   the first n, so the first five carry one of each layer rather than five
   near forms and no depth — that is the low tier's entire scene. */
/* Opacity follows the layer, and only the far layer is translucent.

   Several part-transparent bodies overlapping is how a cluster turns to mud:
   each one lets the one behind through, no silhouette survives, and the whole
   thing reads as a stain rather than as objects. The near and mid layers are
   therefore effectively solid — they are what gives the scene its edges — and
   transparency is reserved for the far layer, where it is doing a job
   (distance) rather than happening by default. */
const FORMS: Form[] = [
  { position: [1.9, 0.4, -0.6], radius: 1.05, tone: 'warm', step: 1, opacity: 1, phase: 0, spin: 0.05, drift: [0.85, 0.6, 0.4] },
  { position: [-2.2, 1.6, -6.0], radius: 2.1, tone: 'green', step: 2, opacity: 0.32, phase: 4.2, spin: 0.03, drift: [0.5, 0.35, 0.3] },
  { position: [-2.9, 1.35, 1.2], radius: 0.42, tone: 'warm', step: 0, opacity: 1, phase: 3.4, spin: 0.09, drift: [1.1, 0.8, 0.5] },
  { position: [-1.6, -0.95, -1.4], radius: 0.8, tone: 'green', step: 1, opacity: 0.97, phase: 1.9, spin: -0.07, drift: [0.9, 0.65, 0.45] },
  { position: [2.6, -0.8, -6.8], radius: 2.4, tone: 'warm', step: 2, opacity: 0.26, phase: 5.1, spin: -0.04, drift: [0.45, 0.3, 0.25] },
  { position: [3.5, 1.4, -2.2], radius: 0.7, tone: 'warm', step: 0, opacity: 0.94, phase: 2.4, spin: 0.06, drift: [0.7, 0.6, 0.4] },
  { position: [3.2, -1.5, 0.8], radius: 0.36, tone: 'green', step: 0, opacity: 1, phase: 0.8, spin: -0.05, drift: [1.15, 0.85, 0.5] },
  { position: [-3.4, 0.6, -2.6], radius: 0.62, tone: 'green', step: 0, opacity: 0.92, phase: 2.9, spin: 0.04, drift: [0.75, 0.7, 0.4] },
  { position: [0.4, -1.8, -1.9], radius: 0.55, tone: 'warm', step: 2, opacity: 0.94, phase: 1.2, spin: -0.06, drift: [0.95, 0.55, 0.45] },
  { position: [0.2, 1.9, -5.2], radius: 1.5, tone: 'warm', step: 1, opacity: 0.22, phase: 5.8, spin: 0.02, drift: [0.6, 0.4, 0.3] },
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

      const { phase, radius, spin, drift, position } = form;

      // Three rates, deliberately not multiples of each other, so the shape
      // never returns to the same silhouette on a countable loop.
      mesh.scale.set(
        radius * (1 + Math.sin(t * 0.31 + phase) * 0.085),
        radius * (1 + Math.sin(t * 0.23 + phase * 1.7) * 0.105),
        radius * (1 + Math.sin(t * 0.27 + phase * 2.3) * 0.075)
      );

      mesh.rotation.x = t * spin * 0.6 + phase;
      mesh.rotation.y = t * spin + phase * 0.5;

      /* The wander, one axis at a time. Each axis gets a different phase
         offset and seed — without that all three would move in step and the
         form would slide along a straight diagonal instead of meandering.
         The offsets are irregular for the same reason the frequencies are:
         evenly spaced ones (0, 2π/3, 4π/3) trace a neat circle. */
      mesh.position.x = position[0] + wander(t, phase, 0) * drift[0];
      mesh.position.y = position[1] + wander(t, phase + 2.1, 1.7) * drift[1];
      mesh.position.z = position[2] + wander(t, phase + 4.7, 3.4) * drift[2];
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
                 the reason `transmission` is gated on device tier.

                 Transmission pulled back from 0.94 and roughness from 0.22.
                 At 0.94 these were almost pure glass: near-invisible
                 individually, and where two overlapped the result had no
                 readable edge at all. Around 0.78 they keep the refraction
                 that makes them feel like bodies rather than balloons while
                 holding enough of their own colour to have a silhouette. The
                 higher clearcoat is what draws that silhouette — a crisp
                 specular rim is the cheapest edge definition available
                 without a postprocessing pass. */
              <meshPhysicalMaterial
                color={color}
                transmission={0.78}
                thickness={form.radius * 1.6}
                roughness={0.16}
                ior={1.35}
                clearcoat={0.85}
                clearcoatRoughness={0.22}
                transparent
                opacity={form.opacity}
                envMapIntensity={1.25}
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
                /* Was 0.62, which washed the cheap path out to the point that
                   the forms read as stains rather than bodies. The scene is
                   the subject of the hero now, not a tint behind a headline,
                   so it is allowed to be present. */
                opacity={form.opacity * 0.82}
              />
            )}
          </mesh>
        );
      })}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   HeroCanvas — the scene root, and the entry point of the lazy chunk.

   Everything Three.js-shaped is reachable only from this file, so the whole
   WebGL stack lands in one chunk that a device failing the capability check
   never downloads.

   Deliberately absent:

   - **Drei.** Every piece of it wanted here — a float wrapper, a points
     helper, an environment — is a few lines against three.js core, and the
     one that isn't (`<Environment>`) wants an HDR file over the network,
     which the brief rules out.
   - **Postprocessing.** Bloom and depth-of-field mean `postprocessing` plus
     `@react-three/postprocessing`, a second full-screen pass, and a real
     frame cost on exactly the mid-range phones this has to stay smooth on.
     The glow is instead built into the materials and the particle field,
     where it costs nothing.

   That is the "do not add unnecessary dependencies" line drawn as far back
   as it will go: `three` and `@react-three/fiber`, nothing else.
   ───────────────────────────────────────────────────────────────────────── */

import { useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
  BackSide,
  Mesh,
  NoToneMapping,
  PMREMGenerator,
  Scene,
  ShaderMaterial,
  SphereGeometry,
} from 'three';
import { readPalette, type ScenePalette } from './palette';
import { OrganicField } from './OrganicField';
import { Particles } from './Particles';
import { CameraRig } from './CameraRig';
import { useTheme } from '../../state/theme';
import type { DeviceProfile } from '../../hooks/useDeviceProfile';

/* Glass needs something to refract. Rather than download an HDR, this bakes
   a three-stop vertical gradient — ground, fill, key, all from the live
   palette — into a small environment map at mount. The forms then pick up
   the page's own colours instead of a stock studio, which is the difference
   between the scene belonging to this site and sitting on top of it. */
function GradientEnvironment({ palette }: { palette: ScenePalette }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const source = new Scene();

    const geometry = new SphereGeometry(20, 24, 16);
    const material = new ShaderMaterial({
      side: BackSide,
      uniforms: {
        uTop: { value: palette.key },
        uMid: { value: palette.fill },
        uGround: { value: palette.bg },
      },
      vertexShader: /* glsl */ `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop;
        uniform vec3 uMid;
        uniform vec3 uGround;
        varying vec3 vPosition;
        void main() {
          float h = normalize(vPosition).y * 0.5 + 0.5;
          vec3 c = mix(uGround, uMid, smoothstep(0.0, 0.55, h));
          c = mix(c, uTop, smoothstep(0.5, 1.0, h));
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    });

    const mesh = new Mesh(geometry, material);
    source.add(mesh);

    const target = pmrem.fromScene(source);
    scene.environment = target.texture;

    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [gl, scene, palette]);

  return null;
}

export default function HeroCanvas({
  profile,
  active,
  onReady,
}: {
  profile: DeviceProfile;
  active: boolean;
  onReady: () => void;
}) {
  const theme = useTheme();

  // Re-read on every theme change: the ramps reverse, so the scene's colours
  // have to reverse with them. The tokens are the source of truth in both
  // directions.
  const palette = useMemo(() => readPalette(), [theme]);
  const dark = theme === 'dark';

  return (
    <Canvas
      /* Stop rendering entirely when the hero is off screen. A garden
         animating behind three sections of prose nobody can see is pure
         battery cost. */
      frameloop={active ? 'always' : 'never'}
      dpr={profile.dpr}
      camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 60 }}
      gl={{
        alpha: true,
        /* Antialiasing on both tiers. It was high-tier-only, which was
           defensible while the scene was a dim blur in the margin — every
           edge was soft anyway, so there was nothing for MSAA to fix. A
           full-bleed scene at full opacity with crisp specular rims has hard
           edges everywhere, and without this they stair-step. The low tier
           also catches any window under 900px, so "low" is not only phones. */
        antialias: true,
        powerPreference: 'high-performance',
      }}
      /* No tone mapping. ACES would quietly desaturate the palette, and
         these colours are the brand — they should arrive on screen as the
         tokens define them. The lighting is soft enough that nothing clips
         without it. */
      onCreated={({ gl }) => {
        gl.toneMapping = NoToneMapping;
        // Fires once the context exists, which is the honest moment to start
        // fading the canvas up — earlier and it cross-fades into nothing.
        onReady();
      }}
      style={{ pointerEvents: 'none' }}
    >
      {/* Depth, and the numbers here are not free choices — they are read off
          the camera and the form positions, because the first attempt got
          them wrong and cost the scene its clarity.

          The camera sits at z=6, so a form's distance is `6 - z`:

            near   z  1.2  →  4.8
            mid    z -0.6 .. -2.6  →  6.6 .. 8.6
            far    z -5.2 .. -6.8  →  11.2 .. 12.8

          Fog started at 5.5 the first time, which put the *entire mid layer*
          inside it — the main form was already 10% washed toward the
          background and the far side of the mid layer 27%. Those are the
          bodies that are supposed to read sharply; fogging them is exactly
          the haze this was meant to avoid.

          Starting at 8.5 clears the whole near and mid layer and leaves the
          fog doing only the job it was added for: the far layer lands at
          roughly 40-65% toward the ground, which is atmosphere.

          Fogged to `palette.bg` rather than a neutral: the canvas is alpha,
          so a form fading toward the page ground fades into the actual page
          behind it, reading as distance instead of as grey film over the
          site. */}
      <fog attach="fog" args={[palette.bg, 8.5, 15]} />

      <GradientEnvironment palette={palette} />

      {/* Soft and ambient by design — the brief asks for atmosphere, not a
          product shot. Sky/ground from the two accent ramps, one key light
          high and right, matching where the composition already sits. */}
      <hemisphereLight args={[palette.key, palette.fill, dark ? 1.5 : 2.1]} />
      <directionalLight position={[4, 5, 4]} intensity={dark ? 1.1 : 1.5} color={palette.warm[0]} />
      <directionalLight position={[-5, -2, 2]} intensity={0.5} color={palette.green[0]} />

      <CameraRig />
      <OrganicField palette={palette} profile={profile} />
      {profile.particles > 0 && <Particles palette={palette} count={profile.particles} dark={dark} />}
    </Canvas>
  );
}

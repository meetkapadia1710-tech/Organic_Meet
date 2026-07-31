/* ─────────────────────────────────────────────────────────────────────────
   HeroVines — climbers hanging into the empty right-hand third of the hero.

   The hero is a left-aligned column: the headline is capped at 17ch so it
   breaks where the composition wants it to, which leaves roughly a third of
   the measure empty on a wide screen. Empty is not automatically wrong — the
   hero was reworked *towards* bare ground — but that particular emptiness
   was a rectangle of nothing beside the one element the page exists to
   introduce, and it read as a layout that had lost an image rather than as
   air.

   Vines, because the site's whole vocabulary is already this: Organic is the
   design system's name, the second accent is olive, and developer mode's
   headline is literally "I cultivate digital ecosystems". A stock photo or a
   3D blob would be decoration imported from somewhere else. This is the page
   finishing a sentence it had already started.

   Everything here is geometry computed once at module scope — no runtime
   measurement, no canvas, no images, no requests. The whole layer is a few
   hundred bytes of path data.

   Accessibility: the layer is `aria-hidden` and `pointer-events: none`. It
   carries no meaning that is not already carried by the words beside it, so
   it is invisible to assistive tech and untouchable by the cursor.
   ───────────────────────────────────────────────────────────────────────── */

/* The drawing space. Portrait, because these hang. The layer is sized in CSS
   against the hero and the viewBox is fitted to its top-right corner, so
   these units are "as tall as the hero", not pixels. */
const W = 460;
const H = 880;

type Vine = {
  /** Where it grips the top edge. */
  x: number;
  /** How far down it reaches, as a fraction of the box. */
  drop: number;
  /** Half-width of its wander, in user units. */
  sway: number;
  /** How many times it crosses its own axis on the way down. */
  waves: number;
  /** Offsets the wave so no two vines ripple in step. */
  phase: number;
  /** Stroke width at the top; the taper is applied down the strand. */
  weight: number;
  /** Seconds for one sway cycle. Deliberately co-prime-ish, so the group
      never resynchronises into a single pendulum. */
  period: number;
  /** Entrance order. */
  delay: number;
  /** Which of the olive steps this strand is cut from. */
  tone: string;
};

/* Four strands, not six: past four the corner stops reading as a few vines
   and starts reading as a texture, and a texture beside a headline is a
   background — which is the thing this is replacing. Lengths are staged so
   the silhouette has a diagonal to it rather than a flat hem. */
const VINES: Vine[] = [
  { x: 96, drop: 0.52, sway: 26, waves: 2.1, phase: 0.4, weight: 3.4, period: 11, delay: 0.35, tone: 'var(--color-accent-2-500)' },
  { x: 196, drop: 0.86, sway: 34, waves: 2.6, phase: 1.9, weight: 4.2, period: 14, delay: 0, tone: 'var(--color-accent-2-600)' },
  { x: 300, drop: 0.36, sway: 20, waves: 1.7, phase: 3.1, weight: 2.8, period: 9, delay: 0.6, tone: 'var(--color-accent-2-400)' },
  { x: 392, drop: 0.68, sway: 30, waves: 2.3, phase: 0.9, weight: 3.6, period: 12.5, delay: 0.2, tone: 'var(--color-accent-2-500)' },
];

type Pt = { x: number; y: number };

/** Samples a strand as a wandering vertical line. */
function samples(v: Vine, count = 26): Pt[] {
  const pts: Pt[] = [];
  const end = H * v.drop;
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    /* The wander widens as it descends: a vine is held at the top and free
       at the bottom, so the amplitude has to grow with the slack or the
       strand reads as a wire. */
    const amp = v.sway * (0.25 + 0.75 * t);
    pts.push({
      x: v.x + Math.sin(t * v.waves * Math.PI * 2 + v.phase) * amp,
      y: t * end,
    });
  }
  return pts;
}

/* Catmull-Rom through the samples, emitted as cubics. Joining the samples
   with straight lines gives a polyline that reads as a chain of segments at
   any weight above a hairline; this passes through every point with a
   continuous tangent, which is what makes it read as grown rather than
   plotted. */
/* Index with the ends clamped. The spline wants a point before the first and
   after the last to compute its end tangents; repeating the endpoint is the
   standard way to give it one without inventing geometry. It also satisfies
   `noUncheckedIndexedAccess`, which is on in this project. */
function at(pts: Pt[], i: number): Pt {
  return pts[Math.min(Math.max(i, 0), pts.length - 1)]!;
}

function spline(pts: Pt[]): string {
  const first = at(pts, 0);
  let d = `M${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = at(pts, i - 1);
    const p1 = at(pts, i);
    const p2 = at(pts, i + 1);
    const p3 = at(pts, i + 2);
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

type Leaf = { x: number; y: number; angle: number; scale: number; at: number };

/* Leaves ride the strand and point along its local tangent, alternating
   sides. A leaf set at a fixed angle is the tell that gives away a decorative
   SVG immediately — real foliage answers to the stem it grows on. */
function leaves(v: Vine, pts: Pt[]): Leaf[] {
  const out: Leaf[] = [];
  for (let i = 3; i < pts.length - 1; i += 3) {
    const prev = at(pts, i - 1);
    const next = at(pts, i + 1);
    const here = at(pts, i);
    const tangent = (Math.atan2(next.y - prev.y, next.x - prev.x) * 180) / Math.PI;
    const side = i % 6 === 0 ? 1 : -1;
    const t = i / (pts.length - 1);
    out.push({
      x: here.x,
      y: here.y,
      /* 62° off the stem: the angle at which a leaf reads as attached rather
         than as impaled or as lying flat against it. */
      angle: tangent + side * 62,
      /* Bigger further down, where there is more light in the composition
         and the strand has more visual weight to carry. */
      scale: 0.62 + t * 0.5,
      at: t,
    });
  }
  return out;
}

/* One leaf, drawn once and instanced. Two curves for the blade and a midrib
   that stops short of the tip — the rib is what stops it reading as a
   generic pointed oval. Origin at the stem end so `scale` unfurls it
   outwards from the vine rather than inflating it in place. */
const LEAF = 'M0 0C7-9 22-11 32 0 22 11 7 9 0 0Z';
const RIB = 'M2 0C11 0 20 0 26 0';

/** Turns a set of strands into path data and leaf placements. */
function strandsOf(vines: Vine[]) {
  return vines.map((v) => {
    const pts = samples(v);
    return { v, d: spline(pts), leaves: leaves(v, pts) };
  });
}

const HERO_STRANDS = strandsOf(VINES);

/* The drawing. Kept separate from HeroVines below purely so the geometry and
   the placement stay readable apart from each other. */
function Vines({ strands, className }: { strands: ReturnType<typeof strandsOf>; className: string }) {
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMaxYMin meet" fill="none">
        {strands.map(({ v, d, leaves: ls }, i) => (
          <g
            key={i}
            className="vine"
            /* The strand swings from where it grips, like a hung rope. Set
               per-vine because the anchor is the vine's own x, not the
               layer's centre — swinging everything about a shared origin is
               what makes a group of vines read as one flapping sheet. */
            style={
              {
                transformOrigin: `${v.x}px 0px`,
                '--period': `${v.period}s`,
                '--delay': `${v.delay}s`,
              } as React.CSSProperties
            }
          >
            <path
              className="vine-stem"
              d={d}
              stroke={v.tone}
              strokeWidth={v.weight}
              strokeLinecap="round"
              /* Normalising the length to 1 lets one dash rule drive the
                 grow-on for every strand, whatever its real arc length. */
              pathLength={1}
            />
            {ls.map((leaf, j) => (
              <g
                key={j}
                className="vine-leaf"
                transform={`translate(${leaf.x.toFixed(1)} ${leaf.y.toFixed(1)}) rotate(${leaf.angle.toFixed(1)}) scale(${leaf.scale.toFixed(2)})`}
                /* Each leaf opens just after the stem has grown past it, so
                   the whole thing reads as one continuous growth instead of
                   a line that draws and then sprouts. */
                style={{ '--at': leaf.at } as React.CSSProperties}
              >
                <path className="vine-blade" d={LEAF} fill={v.tone} />
                <path className="vine-rib" d={RIB} stroke="var(--color-accent-2-800)" strokeWidth={0.9} strokeLinecap="round" />
              </g>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}

/** The hero's own corner: four hand-placed strands that grow on load. */
export function HeroVines() {
  return <Vines strands={HERO_STRANDS} className="hero-vines" />;
}

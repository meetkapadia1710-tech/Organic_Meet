import { TLink } from '../components/TLink';
import { archive, caseStudies, featured } from '../content/projects';
import { SplitText } from '../components/SplitText';
import { WorkRow } from '../components/WorkRow';
import { Deck } from '../components/Deck';
import { Contact } from '../components/Contact';
import { TechMarquee } from '../components/TechMarquee';
import { Hero3D } from '../components/Hero3D';
import { WorkIndex } from '../components/WorkIndex';
import { WorkPreview } from '../components/WorkPreview';
import { Arrow } from '../components/Arrow';
import { HeroLinks } from '../components/HeroLinks';
import { NowBuilding } from '../components/NowBuilding';
import { ScrollCue } from '../components/ScrollCue';
import { Testimonials } from '../components/Testimonials';
import { LEARNING } from '../content/now';
import { prefetchRoute } from '../router';
import { useDevMode } from '../state/devmode';
import { stack, stackCount, stackRows } from '../content/stack';
import { setView, useWorkView } from '../state/view';
import { ScrambleText } from '../components/ScrambleText';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const NUMBERS = ['zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];

/* Split across two lines so each can take its own face — see the headline in
   the hero. Kept as arrays rather than one string with a break in it because
   the two halves are styled independently, not just wrapped. */
const TITLE = ['Software developer,', 'systems builder.'] as const;
const DEV_TITLE = ['I cultivate', 'digital ecosystems.'] as const;

/* A ticking clock was a second thing saying "Bharuch, Gujarat", and it re-rendered
   this whole page once a second to say it. Shipped-project count is a fact
   worth the space, and it comes straight from the data — add a project and
   this number moves on its own. */
/** Pulls a leading integer off a fact so it can be set large and counted up.
 *  "18 projects" splits; "Bharuch, Gujarat" does not match and stays whole. */
const LEAD = /^(\d+)(\s.*)$/;

const FACTS: Array<readonly [string, string, boolean]> = [
  ['Based in', 'Bharuch, Gujarat', false],
  ['Shipped', `${caseStudies.length + archive.length} projects`, false],
  ['Studying', 'B.Tech CSE, IIIT Vadodara', false],
  ['Status', 'Available now', true],
];

/* Each term gets its own step of the palette rather than all four sharing one
   accent. Nothing here is a literal colour: the ramps reverse wholesale in
   dark mode, so accent-700 is deep rust on cream and warm peach on the dark
   ground without this component knowing which theme is active. */
const MARQUEE_TERMS: ReadonlyArray<readonly [string, string]> = [
  ['Full-stack', 'var(--color-accent-700)'],
  ['AI tooling', 'var(--color-accent-2-700)'],
  ['Local-first', 'var(--color-neutral-900)'],
  ['Interaction', 'var(--color-accent-600)'],
];

/* The track translates by -50%, so it has to hold two identical halves for the
   loop to be seamless — each half repeats the four terms twice to stay wider
   than the viewport. */
function MarqueeHalf() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
      {[0, 1].flatMap((pass) =>
        MARQUEE_TERMS.map(([term, color]) => (
          <span key={`${pass}-${term}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 26, color }}>{term}</span>
            <span style={{ margin: '0 18px', fontSize: 20, color: 'var(--color-neutral-600)' }}>✦</span>
          </span>
        ))
      )}
    </span>
  );
}

export function Home() {
  useDocumentMeta(
    'Meet Kapadia',
    'Full-stack web apps, AI tooling and local-first systems, shipped end to end — from the Postgres schema to the last hover state. Selected work and case studies.'
  );
  const view = useWorkView();
  const devMode = useDevMode();
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* The same flag the work rows badge with, so "Building" and the "In
     progress" tags can never disagree. */
  const inProgress = caseStudies.filter((p) => p.status === 'In progress');



  return (
    <>
      {/* ── the hero ────────────────────────────────────────────────────
          Full-bleed: the scene owns the viewport and the type is pushed to
          the edges of it — a metadata strip under the nav, the headline and
          actions along the bottom. Nothing sits in the middle, which is the
          whole idea; the previous version put a text column over the cluster
          and the two fought each other for the same space.

          Consequently this header is *not* width-constrained — the canvas
          has to reach the edges of the window. The 1400px measure moved in
          to `.hero-frame`, so the type still lines up with every section
          below it. */}
      <header id="main" className="hero-full">
        <Hero3D />

        {/* The original static blob, always rendered, never conditional.

            It fades out only once the 3D scene has actually confirmed it is
            live — `.hero3d.is-ready ~ .hero-blob` in site.css, a forward
            sibling selector, which is why this element must stay *after*
            <Hero3D /> in the DOM.

            Gating it on the capability check instead was wrong: the check
            says the device *could* run WebGL, not that it did. Anything that
            fails after that point — a lost context, a chunk that never
            arrives, a renderer that never initialises — would have left the
            hero with neither the scene nor the blob, emptier than before the
            3D was added. Now the failure mode is simply the old hero. */}
        <div
          aria-hidden="true"
          data-parallax
          className="hero-blob"
          /* `opacity` lives in the stylesheet, not here: an inline value
             would outrank the `.hero3d.is-ready ~ .hero-blob` rule that
             fades it out, and the blob would sit on top of the scene
             forever. */
          style={{ position: 'absolute', top: '14vh', right: -120, width: 420, height: 420, borderRadius: 999, background: 'var(--color-accent-2-200)', animation: 'float 9s ease-in-out infinite' }}
        />
        {/* A legibility guard, not decoration. The 3D cluster drifts across
            the same space the headline occupies, and where a sphere passed
            behind the type the contrast collapsed. This is a soft radial wash
            of the page ground, sitting between the canvas and the copy, so
            the scene can be as busy as it likes without the headline ever
            having to compete with it. */}
        {/* Edge legibility only. The type now sits at the top and bottom of
            the frame rather than through its middle, so the guard is two
            linear washes at those edges instead of the radial blob that used
            to sit over the centre — the middle of the scene is the one place
            nothing is set over it, and it should stay clear. */}
        <div className="hero-veil" aria-hidden="true" />

        <div className="hero-frame">
          {/* Top edge: status, live work, place. Small type, wide tracking,
              pushed to the two corners. */}
          <div className="hero-meta">
            <span className="tag tag-accent hero-avail" style={{ borderRadius: 999 }}>
              <span className="avail-dot" aria-hidden="true" />
              Open to internships &amp; freelance
            </span>
            <span className="hero-meta-end">
              <NowBuilding />
              <span className="hero-place">Bharuch, Gujarat</span>
            </span>
          </div>

          {/* Bottom edge: the headline and the two things anyone arriving
              here wants to do, with the profile links and the scroll cue
              pushed out to the opposite corner. */}
          <div className="hero-foot" data-cursor-lift>
            <div className="hero-foot-main">
              {/* Two lines, two faces. The display cut carries the role and
                  the body cut — heavier and tighter than it is set anywhere
                  else on the site — carries the second half, so the headline
                  has typographic contrast inside itself rather than being one
                  long slab.

                  Developer mode rewrites both. Because SplitText keys its
                  word-mask animation off `text`, changing it re-runs the
                  reveal, so the new line types itself in rather than swapping
                  instantly. */}
              <h1 className="hero-title" aria-label={devMode ? DEV_TITLE.join(' ') : TITLE.join(' ')}>
                <SplitText as="span" lift className="hero-title-a" text={(devMode ? DEV_TITLE : TITLE)[0] ?? ''} />
                <SplitText as="span" lift className="hero-title-b" text={(devMode ? DEV_TITLE : TITLE)[1] ?? ''} />
              </h1>

              <div className="hero-actions">
                <a className="btn btn-primary" data-magnetic href="#work" style={{ borderRadius: 999 }}>
                  See the work<Arrow />
                </a>
                <TLink className="btn btn-secondary" data-magnetic to="/contact" style={{ borderRadius: 999 }} onPointerEnter={() => prefetchRoute('/contact')}>
                  Get in touch<Arrow />
                </TLink>
                {/* The palette is the fastest route through this site and
                    nothing on the page said so. */}
                <span className="hero-hint">
                  or press <kbd>⌘K</kbd>
                </span>
              </div>
            </div>

            <div className="hero-foot-end">
              <HeroLinks />
              <ScrollCue />
            </div>
          </div>
        </div>
      </header>

      {/* Everything that used to be stacked inside the hero. It was pushing
          the fold down past the scene and competing with it; as its own block
          it gets to be the first thing you scroll *to* rather than the
          bottom half of what you landed on. */}
      <section className="hero-after">
        <p data-lines className="hero-lede">
          I build full-stack web apps, AI tooling and local-first systems — and I ship them end to end, from the Postgres schema to the last hover state.
        </p>

        {/* The band repeats what the paragraph above already says, so it is
            hidden from assistive tech rather than read out four times. */}
        <div
          aria-hidden="true"
          data-velocity
          style={{ overflow: 'hidden', margin: 'var(--space-8) 0 0', padding: 'var(--space-4) 0', background: 'var(--color-accent-100)', borderRadius: 'var(--radius-lg)' }}
        >
          <div className="mq-track">
            <MarqueeHalf />
            <MarqueeHalf />
          </div>
        </div>

        {/* The facts row was four equal cards of small text. The numbers in it
            are the part worth reading, so they are now set large in the
            display face and the shipped count counts itself up — it is the
            one value here derived from the data rather than typed. */}
        <div className="hero-facts">
          {FACTS.map(([label, value, accent]) => {
            const lead = LEAD.exec(value);
            return (
              <div key={label} className={`hero-fact${accent ? ' is-accent' : ''}`}>
                <div className="hero-fact-label">{label}</div>
                <div className="hero-fact-value">
                  {lead ? (
                    <>
                      {/* useCountUp reads the element's own text, so the
                          number needs its own box — otherwise it would try to
                          animate "18 projects" as a single figure. */}
                      <span className="hero-fact-num" data-countup>{lead[1]}</span>
                      <span className="hero-fact-rest">{lead[2]}</span>
                    </>
                  ) : (
                    value
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div data-reveal className="washed" style={{ margin: 'var(--space-8) 0 0', aspectRatio: '16/7', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'repeating-linear-gradient(135deg, var(--color-neutral-200) 0 14px, var(--color-neutral-300) 14px 28px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-700)' }}>
            portrait / workspace photograph
          </span>
        </div>
      </section>

      <section id="approach" style={{ maxWidth: 1400, margin: '0 auto', padding: '14vh var(--space-8) 0' }}>
        <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}><ScrambleText>Intro</ScrambleText></h6>
        <div className="g-intro" style={{ display: 'grid', gap: 'var(--space-8)', alignItems: 'start' }}>
          <h2 className="fill-scroll" style={{ margin: 0, fontSize: 'clamp(30px, 3.6vw, 52px)', lineHeight: 1.1 }}>
            I started by breaking things — scripts, side projects, half-finished repos. That habit became a method.
          </h2>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.8, color: 'var(--color-neutral-800)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
            {/* No counts written into this sentence on purpose — the fact
                strip above already derives them, and a number typed into
                prose is the one that goes stale first. */}
            I work alone, which means there is nobody to hand the hard part to. <span className="hl">One person owns the whole stack</span> — the migration, the auth flow, the empty state, the thing that breaks at 2am — and that constraint has shaped how I build: decide fast, cut scope honestly, get it running before it is pretty. Somewhere between the first client invoice and the last late-night deploy I stopped being precious about the parts nobody sees, and started being <span className="hl hl-accent">stubborn about the parts they do</span>.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '12vh var(--space-8) 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', margin: 0, flex: 1 }}><ScrambleText>Stack</ScrambleText></h6>
          <span className="tag tag-neutral" style={{ borderRadius: 999 }}>{stackCount} technologies</span>
        </div>

        {/* The categories are worth keeping visible even though the rows
            themselves are mixed — it is the difference between a list of
            logos and a claim about what he actually does. */}
        <p style={{ margin: '0 0 var(--space-5)', fontSize: 15, color: 'var(--color-neutral-700)' }}>
          {stack.map((group) => group.name).join(' · ')}
        </p>

        <TechMarquee rows={stackRows} groups={stack} />
      </section>

      {/* The hero's primary CTA points here. */}
      <section id="work" style={{ maxWidth: 1400, margin: '0 auto', padding: '14vh var(--space-8) 0' }}>
        {/* Sticky, so the index stays with you through the rows. It is the
            section's own header rather than a floating badge — a fixed pill
            was tried first and passed straight over the row titles, which
            read as a bug rather than as layering. Full-width, so nothing can
            collide with it. */}
        <div className="works-head">
          <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', margin: 0 }}><ScrambleText>Selected Works</ScrambleText></h6>
          {view === 'list' && !reduced && <WorkIndex projects={featured} />}
          <span className="tag tag-neutral" style={{ borderRadius: 999 }}>
            {NUMBERS[featured.length]} of {(NUMBERS[caseStudies.length] ?? String(caseStudies.length)).toLowerCase()}
          </span>
        </div>

        {!reduced && (
          <div className="deck-switch" role="group" aria-label="Choose a view">
            <button type="button" data-view="list" aria-pressed={view === 'list'} onClick={() => setView('list')}>List</button>
            <button type="button" data-view="deck" aria-pressed={view === 'deck'} onClick={() => setView('deck')}>Deck</button>
          </div>
        )}

        {view === 'list' || reduced ? (
          <>
            <div className="work-list">
              {featured.map((project, i) => (
                <WorkRow key={project.slug} project={project} label={String(i + 1).padStart(2, '0')} />
              ))}
            </div>
            {!reduced && <WorkPreview projects={featured} />}
          </>
        ) : (
          <Deck projects={featured} />
        )}

        <div style={{ marginTop: 'var(--space-8)' }}>
          <TLink className="btn btn-secondary" data-magnetic to="/projects" style={{ borderRadius: 999 }}>
            See all projects<Arrow />
          </TLink>
        </div>
      </section>


      {/* Empty until there are real quotes — see content/testimonials.ts. */}
      <Testimonials />

      {/* A /now block: what is actually happening this month, as opposed to
          the finished work above it. Both halves are read from data that
          already exists — in-progress projects from projects.ts, the learning
          list from the same array the Approach page renders — so this cannot
          quietly become a claim from last year. */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '12vh var(--space-8) 0' }}>
        <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-6)' }}><ScrambleText>Right now</ScrambleText></h6>
        <div className="now-grid">
          <div className="card elev-sm" data-reveal style={{ borderRadius: 'var(--radius-lg)' }}>
            <h3 className="card-title" style={{ fontSize: 20, margin: '0 0 var(--space-4)' }}>Building</h3>
            <ul className="now-list">
              {inProgress.map((project) => (
                <li key={project.slug}>
                  <TLink to={`/${project.slug}`}>{project.name}</TLink>
                  <span className="now-sub">{project.tags.slice(0, 2).join(' · ')}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card elev-sm" data-reveal style={{ borderRadius: 'var(--radius-lg)' }}>
            <h3 className="card-title" style={{ fontSize: 20, margin: '0 0 var(--space-4)' }}>Learning</h3>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {LEARNING.map((topic) => (
                <span key={topic} className="tag tag-outline" style={{ borderRadius: 999 }}>{topic}</span>
              ))}
            </div>
            <p className="card-body" style={{ marginTop: 'var(--space-4)' }}>
              I&apos;m a student, so this changes every few months — which is the point. The projects are how I learn.
            </p>
          </div>
        </div>
      </section>

      <Contact />
    </>
  );
}

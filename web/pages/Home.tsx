import { TLink } from '../components/TLink';
import { archive, caseStudies, featured } from '../content/projects';
import { SplitText } from '../components/SplitText';
import { WorkRow } from '../components/WorkRow';
import { Deck } from '../components/Deck';
import { Contact } from '../components/Contact';
import { TechMarquee } from '../components/TechMarquee';
import { WorkIndex } from '../components/WorkIndex';
import { WorkPreview } from '../components/WorkPreview';
import { Arrow } from '../components/Arrow';
import { Testimonials } from '../components/Testimonials';
import { LEARNING } from '../content/now';
import { prefetchRoute } from '../router';
import { useDevMode } from '../state/devmode';
import { stack, stackCount, stackRows } from '../content/stack';
import { setView, useWorkView } from '../state/view';
import { ScrambleText } from '../components/ScrambleText';
import { useLogoTap } from '../hooks/useLogoTap';
import { setDevMode } from '../state/devmode';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const NUMBERS = ['zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];

/* Split across two lines so each can take its own face — see the headline in
   the hero. Kept as arrays rather than one string with a break in it because
   the two halves are styled independently, not just wrapped. */
const TITLE = ['Software developer,', 'systems builder.'] as const;
const DEV_TITLE = ['I cultivate', 'digital ecosystems.'] as const;

/* The display line under the standfirst. Dev mode swaps the standfirst above,
   not the name — the person is the same either way. */
const NAME = 'Meet Kapadia';
const DEV_NAME = NAME;

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
   loop to be seamless: at the moment the animation wraps, half two is sitting
   exactly where half one started, and nothing on screen moves.

   That only holds while a single half is at least as wide as the box it runs
   inside — a shorter half runs out and leaves a gap crossing the pill before
   the wrap comes round. Three passes of the four terms is ~2280px against a
   pill that cannot exceed `--page-max` minus its gutters (1632px), so there
   is headroom at the widest the layout ever gets. */
const MARQUEE_PASSES = [0, 1, 2];

function MarqueeHalf() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
      {MARQUEE_PASSES.flatMap((pass) =>
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
  /* Seven taps on the name opens developer mode — the wordmark's old job,
     moved with it out of the nav. */
  const logoTap = useLogoTap(() => setDevMode(true));
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* The same flag the work rows badge with, so "Building" and the "In
     progress" tags can never disagree. */
  const inProgress = caseStudies.filter((p) => p.status === 'In progress');
  const live = [...caseStudies, ...archive].filter((p) => p.links?.live).length;



  return (
    <>
      {/* ── the hero, minimal ───────────────────────────────────────────
          Rebuilt from nothing after three versions that were all, in the end,
          the same mistake: adding things. The WebGL cluster, the drifting
          blob, the two legibility veils, the scroll cue, the profile icons,
          the rotating "currently building" strip and the pulsing dot are all
          gone from this page.

          What is left is a line of metadata, a headline, a sentence, two
          links and a rule. Nothing loops, nothing floats, nothing needs a
          scrim to stay readable — because there is nothing behind the type
          to read it against.

          Note that <Hero3D /> is no longer imported here at all, which is the
          point rather than a side effect: the three.js chunk was 897 kB (242
          kB gzip) and it is now simply not in the graph for this page. The
          component and its files still exist, unreferenced, if the scene is
          ever wanted back. */}
      {/* `data-cursor-lift` is what lets useCursorLift find the headline's
          per-character spans. It is the one interaction kept from the old
          hero, because it costs nothing at rest: the letters sit exactly
          where they would anyway until a pointer comes near them. */}
      <header id="main" className="hero-min" data-cursor-lift>
        {/* Grain. A single inline SVG turbulence tile, so it costs no request
            and no image file — the whole thing is a data URI in the
            stylesheet. Flat cream reads cheap at this scale; cream with a
            fine tooth reads like paper. Kept to the hero, deliberately: this
            is not the decorative backdrop layer that was reverted, it is one
            texture on one surface. */}
        <div className="hero-min-grain" aria-hidden="true" />

        <div className="hero-min-body">
          {/* Each child declares its own beat in the entrance sequence. A
              single index rather than five hand-written delays, so reordering
              the block reorders the choreography with it. */}
          <p className="hero-min-meta" style={{ '--beat': 0 } as React.CSSProperties}>
            <span className="hero-min-rule" aria-hidden="true" />
            <span>Available for work</span>
            <span aria-hidden="true">·</span>
            <span>Bharuch, Gujarat</span>
          </p>

          {/* The role, as a standfirst over the name. It was the headline and
              the name was this line; they are the other way round now, which
              is the right way round for a personal site — the name is the
              thing being introduced and the role is what qualifies it. */}
          <p className="hero-min-name" style={{ '--beat': 1 } as React.CSSProperties}>
            {devMode ? DEV_TITLE.join(' ') : TITLE.join(' ')}
          </p>

          {/* The name, at full display size. Set in the display cut — see
              --font-display for why — and `lift` splits it to characters as
              well as words; the note on SplitText explains why that composes
              with the word reveal instead of fighting it.

              It also carries the wordmark's second job, inherited when the
              wordmark left the nav: seven taps inside five seconds opens
              developer mode. That is the only door in on a phone, the Konami
              code being a desktop keyboard affair. Taps one to six do
              nothing, so it stays inert under ordinary use. */}
          <SplitText
            as="h1"
            lift
            className="hero-min-title"
            text={devMode ? DEV_NAME : NAME}
            {...logoTap}
          />

          {/* The lede has gone. The headline already says what he does, and a
              sentence restating it in smaller type underneath was the hero
              explaining itself twice. The same paragraph still opens the
              Intro section, where it has room to be read. */}

          <div className="hero-min-actions" style={{ '--beat': 3 } as React.CSSProperties}>
            <a className="hero-min-link" href="#work">
              See the work<Arrow />
            </a>
            <TLink className="hero-min-link" to="/contact" onPointerEnter={() => prefetchRoute('/contact')}>
              Get in touch<Arrow />
            </TLink>
          </div>
        </div>

        {/* No proof panel here. A full-page screenshot scaled into a 528px
            column renders every control inside it at two or three pixels —
            it reads as a blurry thumbnail rather than as evidence, which is
            the opposite of what putting work above the fold is for.

            If this comes back it needs a *detail* crop, not a whole page:
            one screen region at close to 1:1, or a purpose-shot image. The
            work rows further down already show these at a size that works. */}

        {/* The only ornament: a hairline, and the three facts worth stating
            without a card around each one.

            Three genuinely different numbers — "written up" was here and
            resolved to the same 18 as "shipped", because `archive` is empty,
            and two figures showing an identical value makes the reader
            distrust both. */}
        <div className="hero-min-facts" style={{ '--beat': 4 } as React.CSSProperties}>
          <span><b data-countup>{caseStudies.length + archive.length}</b> projects shipped</span>
          <span><b data-countup>{live}</b> live to click</span>
          <span><b data-countup>{inProgress.length}</b> in progress</span>
        </div>
      </header>

      {/* The band that carries you out of the hero.

          This section used to hold the lede, the four fact cards and a
          portrait placeholder as well. The first two moved into the hero and
          were removed here as duplicates, which left the band floating in
          whitespace above a large grey striped box — an empty asset slot
          directly under a finished hero, which is what made the transition
          read as broken rather than as quiet.

          The placeholder is gone from this page. It is a slot for a photograph
          that does not exist, and the homepage is the worst place on the site
          to advertise that; the About page already carries one portrait slot,
          which is enough. Drop a real image in and it belongs here — as a
          picture, not as a box saying a picture goes here.

          Full-bleed rather than a rounded card in a padded section: it is a
          rule between two parts of the page now, so it should read as a band
          crossing it, not as an element sitting on it. */}
      <section className="hero-band" aria-hidden="true" data-velocity>
        <div className="mq-track">
          <MarqueeHalf />
          <MarqueeHalf />
        </div>
      </section>

      <section id="approach" style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '14vh var(--gutter) 0' }}>
        <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}><ScrambleText>Intro</ScrambleText></h6>
        <div className="g-intro" style={{ display: 'grid', gap: 'var(--space-8)', alignItems: 'start' }}>
          <h2 className="fill-scroll" style={{ margin: 0, fontSize: 'clamp(30px, 3.6vw, 52px)', lineHeight: 1.1 }}>
            I started by breaking things — scripts, side projects, half-finished repos. That habit became a method.
          </h2>
          {/* No card. This was a rounded surface panel with 26px of padding
              around 17px type — the last of the "put it in a box" styling the
              rest of the page has moved away from, and next to a hero that is
              type on bare ground it read as a grey slab.

              Set as an indented column instead: a hairline on the leading
              edge marks it as the aside to the heading beside it, which is
              the job the box was doing badly. */}
          <p className="intro-aside">
            {/* No counts written into this sentence on purpose — the fact
                strip above already derives them, and a number typed into
                prose is the one that goes stale first. */}
            I work alone, which means there is nobody to hand the hard part to. <span className="hl">One person owns the whole stack</span> — the migration, the auth flow, the empty state, the thing that breaks at 2am — and that constraint has shaped how I build: decide fast, cut scope honestly, get it running before it is pretty. Somewhere between the first client invoice and the last late-night deploy I stopped being precious about the parts nobody sees, and started being <span className="hl hl-accent">stubborn about the parts they do</span>.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '12vh var(--gutter) 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', margin: 0, flex: 1 }}><ScrambleText>Stack</ScrambleText></h6>
          <span className="tag tag-neutral" style={{ borderRadius: 999 }}>{stackCount} technologies</span>
        </div>

        {/* The categories are worth keeping visible even though the rows
            themselves are mixed — it is the difference between a list of
            logos and a claim about what he actually does. */}
        {/* --space-5 does not exist on this scale (1, 2, 3, 4, 6, 8), so this
            margin was resolving to nothing and the category line sat flush
            against the rows below it. */}
        <p style={{ margin: '0 0 var(--space-6)', fontSize: 15, color: 'var(--color-neutral-700)' }}>
          {stack.map((group) => group.name).join(' · ')}
        </p>

        <TechMarquee rows={stackRows} groups={stack} />
      </section>

      {/* The hero's primary CTA points here. */}
      <section id="work" style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '14vh var(--gutter) 0' }}>
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
      <section style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '12vh var(--gutter) 0' }}>
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

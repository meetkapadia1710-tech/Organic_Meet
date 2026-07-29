import { TLink } from '../components/TLink';
import { archive, caseStudies, featured } from '../content/projects';
import { SplitText } from '../components/SplitText';
import { WorkRow } from '../components/WorkRow';
import { Deck } from '../components/Deck';
import { Contact } from '../components/Contact';
import { TechIcon } from '../components/TechIcon';
import { setView, useWorkView } from '../state/view';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const NUMBERS = ['zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];

const CORE_TOOLS = [
  ['TypeScript', 'My default language for anything that has to survive a second reading. Types carry the contract between database, API and interface, so a rename breaks loudly instead of quietly.'],
  ['React & Next.js', 'Where the product gets built — server components for the heavy lifting, client islands for the parts that need to feel alive, Turborepo when app, extension and action share one core.'],
  ['Python', 'For work closest to the machine: OCR pipelines, tool-calling agents, FastAPI services streaming over WebSockets, and everything that has to run offline on someone’s own hardware.'],
  ['Node.js', 'The parts nobody sees — background jobs, GitHub Actions, webhook handlers, and Postgres through Drizzle where the schema is written once and trusted everywhere.'],
  ['Tailwind CSS', 'Constraint as a feature. A fixed scale keeps the interface coherent while I’m moving fast, and design decisions live next to the markup instead of in a file nobody opens.'],
];

/* A ticking clock was a second thing saying "Bharuch, Gujarat", and it re-rendered
   this whole page once a second to say it. Shipped-project count is a fact
   worth the space, and it comes straight from the data — add a project and
   this number moves on its own. */
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
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;



  return (
    <>
      <header id="main" style={{ padding: '22vh var(--space-8) 0', maxWidth: 1400, margin: '0 auto', position: 'relative' }}>
        <div
          aria-hidden="true"
          data-parallax
          style={{ position: 'absolute', top: '14vh', right: -120, width: 420, height: 420, borderRadius: 999, background: 'var(--color-accent-2-200)', opacity: 0.55, animation: 'float 9s ease-in-out infinite' }}
        />
        <div style={{ position: 'relative' }}>
          <span className="tag tag-accent" style={{ borderRadius: 999 }}>Open to internships &amp; freelance</span>
          <SplitText
            as="h1"
            text="Software developer, systems builder."
            style={{ fontSize: 'clamp(52px, 9.5vw, 150px)', lineHeight: 0.95, letterSpacing: '-0.02em', margin: 'var(--space-4) 0 0', maxWidth: '15ch' }}
          />
          <p data-lines style={{ maxWidth: '46ch', fontSize: 20, lineHeight: 1.6, marginTop: 'var(--space-6)', color: 'var(--color-neutral-800)' }}>
            I build full-stack web apps, AI tooling and local-first systems — and I ship them end to end, from the Postgres schema to the last hover state.
          </p>
        </div>

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

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
          {FACTS.map(([label, value, accent]) => (
            <div key={label} style={{ background: accent ? 'var(--color-accent-2-200)' : 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-6)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: accent ? 'var(--color-accent-2-800)' : 'var(--color-neutral-700)', marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: accent ? 'var(--color-accent-2-900)' : undefined }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        <div data-reveal className="washed" style={{ margin: 'var(--space-8) 0 0', aspectRatio: '16/7', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'repeating-linear-gradient(135deg, var(--color-neutral-200) 0 14px, var(--color-neutral-300) 14px 28px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-700)' }}>
            portrait / workspace photograph
          </span>
        </div>
      </header>

      <section id="approach" style={{ maxWidth: 1400, margin: '0 auto', padding: '14vh var(--space-8) 0' }}>
        <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}>Intro</h6>
        <div className="g-intro" style={{ display: 'grid', gap: 'var(--space-8)', alignItems: 'start' }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(30px, 3.6vw, 52px)', lineHeight: 1.1 }}>
            I started by breaking things — scripts, side projects, half-finished repos. That habit became a method.
          </h2>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.8, color: 'var(--color-neutral-800)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
            Most of what I make sits where <span className="hl">AI meets infrastructure</span>: a tool that grades a repository against its actual code, an assistant with a swappable brain and semantic memory, a memory layer that never leaves the machine. I care about <span className="hl hl-accent">the seams</span> — the schema that stays normalized, the payment flow that doesn&apos;t drop, the transition that lands.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '12vh var(--space-8) 0' }}>
        <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}>Core Tools</h6>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {CORE_TOOLS.map(([title, body], i) => (
            <div key={title} className="card elev-sm" data-tilt data-reveal style={{ borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                <div className="card-kicker">{String(i + 1).padStart(2, '0')}</div>
                <span style={{ color: 'var(--color-accent-700)' }}>
                  <TechIcon name={title ?? ''} size={26} />
                </span>
              </div>
              <h3 className="card-title">{title}</h3>
              <p className="card-body">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '14vh var(--space-8) 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-6)', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', margin: 0 }}>Selected Works</h6>
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
          <div className="work-list">
            {featured.map((project, i) => (
              <WorkRow key={project.slug} project={project} label={String(i + 1).padStart(2, '0')} />
            ))}
          </div>
        ) : (
          <Deck projects={featured} />
        )}

        <div style={{ marginTop: 'var(--space-8)' }}>
          <TLink className="btn btn-secondary" data-magnetic to="/projects" style={{ borderRadius: 999 }}>
            See all projects →
          </TLink>
        </div>
      </section>


      <Contact />
    </>
  );
}

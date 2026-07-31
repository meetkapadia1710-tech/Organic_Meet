import { SplitText } from '../components/SplitText';
import { Contact } from '../components/Contact';
import { ScrambleText } from '../components/ScrambleText';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { LEARNING } from '../content/now';

const STEPS: Array<[string, string]> = [
  [
    'Find the real problem',
    'Every project I’ve built started as a complaint — mine or someone else’s. READMEs nobody writes. An assistant that stops working without wifi. Forgetting what you read last Tuesday. I don’t start until I can say the annoyance in one sentence, because that sentence is what I cut scope against later.',
  ],
  [
    'Model the data first',
    'Before any interface, the schema. On LearnFlex that meant normalizing to 3NF/BCNF with a five-person team; on RepoGrade it meant one Drizzle schema shared by a web app, an extension and a GitHub Action. Get this wrong and every screen above it inherits the mistake.',
  ],
  [
    'Ship the ugly version',
    'Running beats designed. I get the thin path working end to end — payment actually charges, the assistant actually answers, the OCR actually reads the screen — then make it pleasant. Hindsight went from nothing to a working local capture loop inside a hackathon because of this order.',
  ],
  [
    'Finish the seams',
    'The last 10% is where software stops feeling like a demo: empty states, failed payments, offline fallbacks, the transition that lands instead of jumping. This is the part most side projects skip, and it’s the part I most enjoy.',
  ],
];

const BELIEFS: Array<[string, string]> = [
  ['Local beats cloud when it can', 'Two of my projects run entirely on the user’s machine on purpose. If the data doesn’t need to leave, it shouldn’t — that’s a design decision, not a limitation.'],
  ['Swappable, not locked in', 'J.A.R.V.I.S runs on Groq, Ollama, Claude, OpenAI or Gemini because betting a whole system on one provider is a decision you make once and regret slowly.'],
  ['Constraints make it coherent', 'A fixed spacing and type scale, one schema, one language across the stack. Fewer choices per decision means more decisions per day.'],
  ['Solo, but not sloppy', 'Most of my work is solo, so the discipline has to be self-imposed: types at the boundaries, migrations checked in, no clever code I’d need to re-read in a month.'],
];

const FIT = [
  'Full-stack web apps where one person owns schema through UI',
  'AI tooling that has to be grounded in real data, not vibes',
  'Local-first or privacy-constrained systems',
  'Getting a stalled prototype to something shippable',
];

export function Approach() {
  useDocumentMeta(
    'Approach',
    'How I actually work: find the real problem, model the data first, ship the ugly version, then finish the seams.'
  );
  return (
    <>
      <header id="main" style={{ padding: '22vh var(--gutter) 0', maxWidth: 'var(--page-max)', margin: '0 auto', position: 'relative' }}>
        <div
          aria-hidden="true"
          data-parallax
          style={{ position: 'absolute', top: '16vh', right: -140, width: 400, height: 400, borderRadius: 999, background: 'var(--color-accent-2-200)', opacity: 0.5, animation: 'float 10s ease-in-out infinite' }}
        />
        <div style={{ position: 'relative' }}>
          <span className="tag tag-neutral" style={{ borderRadius: 999 }}>Approach</span>
          <SplitText
            as="h1"
            text="How I actually work."
            style={{ fontSize: 'clamp(56px, 10vw, 160px)', lineHeight: 0.95, letterSpacing: '-0.02em', margin: 'var(--space-4) 0 0', maxWidth: '13ch' }}
          />
          {/* `data-lines` splits this into words that rise out of their own
              clipping mask, staggered by word index — the treatment the
              Contact page's lede already uses. The two ledes on this site
              were arriving by different means, which is the kind of
              inconsistency you feel without being able to name. */}
          <p data-lines style={{ maxWidth: '52ch', fontSize: 20, lineHeight: 1.6, marginTop: 'var(--space-6)', color: 'var(--color-neutral-800)' }}>
            No process theatre. I&apos;m one person who builds the whole thing, so my method is mostly about deciding fast, cutting scope honestly, and getting something running early enough that the hard problems show up while there&apos;s still time to fix them.
          </p>
        </div>
      </header>

      <section style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '14vh var(--gutter) 0' }}>
        <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}><ScrambleText>The loop</ScrambleText></h6>
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {STEPS.map(([title, body], i) => (
            <div key={title} className="step g-step" data-reveal style={{ display: 'grid', gap: 'var(--space-6)', alignItems: 'start', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
              <span className="step-n" style={{ width: 52, height: 52, borderRadius: 999, background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontSize: 19 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 style={{ margin: 0, fontSize: 30, lineHeight: 1.1 }}>{title}</h3>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.75, color: 'var(--color-neutral-800)' }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '12vh var(--gutter) 0' }}>
        <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}><ScrambleText>What I believe</ScrambleText></h6>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {BELIEFS.map(([title, body]) => (
            <div key={title} className="card elev-sm" data-tilt data-reveal style={{ borderRadius: 'var(--radius-lg)' }}>
              <h3 className="card-title" style={{ fontSize: 26 }}>{title}</h3>
              <p className="card-body">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '12vh var(--gutter) 0' }}>
        <div className="g-duo" style={{ display: 'grid', gap: 'var(--space-8)', alignItems: 'start' }}>
          <div>
            <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}><ScrambleText>Best fit</ScrambleText></h6>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 'var(--space-3)' }}>
              {/* The last section of the page was the only one arriving with
                  no motion at all — the steps and the belief cards both
                  reveal, then the page simply stopped doing it. Each item
                  reveals in turn rather than the list as one block, because
                  a bulleted list read one line at a time is what the
                  stagger is describing. */}
              {FIT.map((item) => (
                <li key={item} data-reveal style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'baseline', fontSize: 17, lineHeight: 1.6 }}>
                  <span style={{ color: 'var(--color-accent-2-700)', fontWeight: 700 }}>✦</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}><ScrambleText>Currently learning</ScrambleText></h6>
            <div data-reveal style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {LEARNING.map((tag) => (
                <span key={tag} className="tag tag-outline" style={{ borderRadius: 999 }}>{tag}</span>
              ))}
            </div>
            <p data-reveal style={{ marginTop: 'var(--space-4)', fontSize: 16, lineHeight: 1.75, color: 'var(--color-neutral-800)' }}>
              I&apos;m a student, so this list changes every few months — which is the point. The projects are how I learn; the portfolio is just the receipt.
            </p>
          </div>
        </div>
      </section>

      <Contact />
    </>
  );
}

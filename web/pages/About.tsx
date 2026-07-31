import { SplitText } from '../components/SplitText';
import { Contact } from '../components/Contact';
import { ScrambleText } from '../components/ScrambleText';
import { TLink } from '../components/TLink';
import { Arrow } from '../components/Arrow';
import { ResumeButton } from '../components/ResumeButton';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { BIO, EDUCATION, EXPERIENCE, type TimelineEntry } from '../content/about';
import { archive, caseStudies } from '../content/projects';

/* Entries still carrying `todo: true` are placeholders for facts this repo
   does not know — see the header comment in content/about.ts. They are
   filtered out rather than rendered greyed-out: a visible "TODO — years" on
   an about page is worse than a shorter about page. */
function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const real = entries.filter((e) => !e.todo);
  if (!real.length) return null;

  return (
    <ol className="tl">
      {real.map((entry) => (
        <li key={`${entry.org}-${entry.title}`} className="tl-item" data-reveal>
          <div className="tl-period">{entry.period}</div>
          <h3 className="tl-title">{entry.title}</h3>
          <div className="tl-org">{entry.org}</div>
          <p className="tl-body">{entry.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function About() {
  useDocumentMeta(
    'About',
    'Meet Kapadia — a student building full-stack web apps, AI tooling and local-first systems in Bharuch, Gujarat.'
  );

  const shipped = caseStudies.length + archive.length;
  const live = [...caseStudies, ...archive].filter((p) => p.links?.live).length;
  const hasTimeline = [...EDUCATION, ...EXPERIENCE].some((e) => !e.todo);

  return (
    <>
      <header id="main" style={{ padding: '22vh var(--gutter) 0', maxWidth: 'var(--page-max)', margin: '0 auto', position: 'relative' }}>
        <div
          aria-hidden="true"
          data-parallax
          style={{ position: 'absolute', top: '16vh', right: -140, width: 400, height: 400, borderRadius: 999, background: 'var(--color-accent-2-200)', opacity: 0.5, animation: 'float 10s ease-in-out infinite' }}
        />
        <div style={{ position: 'relative' }}>
          <span className="tag tag-neutral" style={{ borderRadius: 999 }}>About</span>
          <SplitText
            as="h1"
            text="Student, and already shipping."
            style={{ fontSize: 'clamp(50px, 9vw, 140px)', lineHeight: 0.95, letterSpacing: '-0.02em', margin: 'var(--space-4) 0 0', maxWidth: '13ch' }}
          />
        </div>
      </header>

      <section style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '10vh var(--gutter) 0' }}>
        <div className="about-grid">
          <div>
            {BIO.map((para) => (
              <p key={para.slice(0, 24)} style={{ fontSize: 18, lineHeight: 1.75, color: 'var(--color-neutral-800)', maxWidth: '58ch' }}>
                {para}
              </p>
            ))}

            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-6)' }}>
              <TLink className="btn btn-primary" data-magnetic to="/projects" style={{ borderRadius: 999 }}>
                See the work<Arrow />
              </TLink>
              <ResumeButton />
            </div>
          </div>

          {/* Same placeholder treatment the homepage and the case studies use,
              so an unfilled slot looks like a slot rather than a broken image.
              ⚠️ Needs a real photograph. */}
          <div data-reveal className="washed about-portrait">
            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-700)' }}>
              portrait
            </span>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '12vh var(--gutter) 0' }}>
        <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}><ScrambleText>By the numbers</ScrambleText></h6>
        <div className="hero-facts">
          {/* "Written up" was here and had to go: `archive` is currently
              empty, so it resolved to the same 18 as "Shipped" — two tiles
              showing an identical number reads as a bug even when both are
              correct. "Live" is derived the same way Stats derives it and is
              genuinely a different figure. */}
          {([
            ['Shipped', String(shipped), shipped === 1 ? 'project' : 'projects'],
            ['Live to click', String(live), 'deployed and public'],
            ['Based in', 'Bharuch', 'Gujarat, India'],
            ['Studying', 'B.Tech CSE', 'IIIT Vadodara'],
          ] as const).map(([label, value, note]) => (
            <div key={label} className="hero-fact">
              <div className="hero-fact-label">{label}</div>
              <div className="hero-fact-value">
                {/^\d+$/.test(value) ? <span className="hero-fact-num" data-countup>{value}</span> : value}
              </div>
              <div className="hero-fact-label" style={{ margin: '6px 0 0', letterSpacing: 0, textTransform: 'none', fontWeight: 500 }}>
                {note}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The whole block is gone until at least one entry is real, rather than
          rendering two headings over nothing. */}
      {hasTimeline && (
        <section style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '12vh var(--gutter) 0' }}>
          <div className="g-duo" style={{ display: 'grid', gap: 'var(--space-8)', alignItems: 'start' }}>
            <div>
              <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-6)' }}><ScrambleText>Education</ScrambleText></h6>
              <Timeline entries={EDUCATION} />
            </div>
            <div>
              <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-6)' }}><ScrambleText>Experience</ScrambleText></h6>
              <Timeline entries={EXPERIENCE} />
            </div>
          </div>
        </section>
      )}

      <Contact />
    </>
  );
}

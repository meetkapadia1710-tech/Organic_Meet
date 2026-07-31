import { TLink } from '../components/TLink';
import { SplitText } from '../components/SplitText';
import { ScrambleText } from '../components/ScrambleText';
import { Arrow } from '../components/Arrow';
import { caseStudies } from '../content/projects';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

/* Three real destinations rather than a dead end. Picked from the data, so
   they cannot rot into links to projects that no longer exist — and taken
   from the front of the list rather than at random, because a 404 that shows
   different work on every reload looks like it is malfunctioning twice. */
const SUGGESTIONS = caseStudies.slice(0, 3);

export function NotFound() {
  useDocumentMeta('Page not found', 'That page does not exist.');
  return (
    <section id="main" style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '22vh var(--gutter) 10vh' }}>
      <span className="tag tag-neutral" style={{ borderRadius: 999 }}>404</span>
      {/* The headline decodes itself in — the one place on the site where the
          scramble is the joke as well as the effect. */}
      <SplitText
        as="h1"
        text="This page went missing."
        style={{ fontSize: 'clamp(52px, 9.5vw, 150px)', lineHeight: 0.95, letterSpacing: '-0.02em', margin: 'var(--space-4) 0 0', maxWidth: '14ch' }}
      />
      <p data-lines style={{ maxWidth: '46ch', fontSize: 20, lineHeight: 1.6, marginTop: 'var(--space-6)', color: 'var(--color-neutral-800)' }}>
        The link is broken or the page has moved. The work is all still one click away.
      </p>
      <div data-reveal style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-6)' }}>
        <TLink className="btn btn-primary" data-magnetic to="/" style={{ borderRadius: 999 }}>
          Back to the index<Arrow />
        </TLink>
        <TLink className="btn btn-secondary" data-magnetic to="/projects" style={{ borderRadius: 999 }}>
          All projects<Arrow />
        </TLink>
      </div>

      <div style={{ marginTop: 'var(--space-8)' }}>
        <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}>
          <ScrambleText>Try one of these</ScrambleText>
        </h6>
        <div className="nf-suggest">
          {SUGGESTIONS.map((project) => (
            <TLink
              key={project.slug}
              className="card elev-sm"
              data-tilt
              data-cursor="View case"
              to={`/${project.slug}`}
              style={{ borderRadius: 'var(--radius-lg)', textDecoration: 'none', color: 'var(--color-text)' }}
            >
              <div className="card-kicker">{project.year}</div>
              <h3 className="card-title">{project.name}</h3>
              <p className="card-body">{project.summary}</p>
            </TLink>
          ))}
        </div>
      </div>

      <p style={{ marginTop: 'var(--space-6)', fontSize: 15, color: 'var(--color-neutral-700)' }}>
        Or press <kbd>/</kbd> to search.
      </p>
    </section>
  );
}

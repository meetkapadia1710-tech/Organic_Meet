import { TLink } from '../components/TLink';
import { SplitText } from '../components/SplitText';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export function NotFound() {
  useDocumentMeta('Page not found', 'That page does not exist.');
  return (
    <section id="main" style={{ maxWidth: 1400, margin: '0 auto', padding: '22vh var(--space-8) 10vh' }}>
      <span className="tag tag-neutral" style={{ borderRadius: 999 }}>404</span>
      <SplitText
        as="h1"
        text="This page went missing."
        style={{ fontSize: 'clamp(52px, 9.5vw, 150px)', lineHeight: 0.95, letterSpacing: '-0.02em', margin: 'var(--space-4) 0 0', maxWidth: '14ch' }}
      />
      <p style={{ maxWidth: '46ch', fontSize: 20, lineHeight: 1.6, marginTop: 'var(--space-6)', color: 'var(--color-neutral-800)' }}>
        The link is broken or the page has moved. The work is all still one click away.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-6)' }}>
        <TLink className="btn btn-primary" data-magnetic to="/" style={{ borderRadius: 999 }}>
          Back to the index
        </TLink>
        <TLink className="btn btn-secondary" data-magnetic to="/projects" style={{ borderRadius: 999 }}>
          All projects
        </TLink>
      </div>
      <p style={{ marginTop: 'var(--space-6)', fontSize: 15, color: 'var(--color-neutral-700)' }}>
        Or press <kbd>/</kbd> to search.
      </p>
    </section>
  );
}

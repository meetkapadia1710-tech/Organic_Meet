import { CopyEmail } from './CopyEmail';

const EMAIL = 'kapadiameet07@gmail.com';

/* The closing block, identical on every page that carries it. */
export function Contact({ withBlurb = true }: { withBlurb?: boolean }) {
  return (
    <section id="contact" style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '12vh var(--gutter) 10vh' }}>
      <div style={{ background: 'var(--color-accent-200)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)', position: 'relative', overflow: 'hidden' }}>
        <div
          aria-hidden="true"
          data-parallax
          style={{ position: 'absolute', right: -80, bottom: -110, width: 340, height: 340, borderRadius: 999, background: 'var(--color-accent-300)', opacity: 0.6 }}
        />
        <div style={{ position: 'relative' }}>
          <span className="tag tag-accent" style={{ borderRadius: 999 }}>Currently available</span>
          <h2 style={{ fontSize: 'clamp(44px, 7vw, 110px)', lineHeight: 0.98, margin: 'var(--space-4) 0', maxWidth: '12ch', color: 'var(--color-accent-900)' }}>
            Let&apos;s build something.
          </h2>
          {withBlurb && (
            <p data-reveal style={{ maxWidth: '46ch', fontSize: 18, color: 'var(--color-accent-900)', marginBottom: 'var(--space-6)' }}>
              For collaborations, internships or anything you think I&apos;d find interesting — my inbox is open and I answer quickly.
            </p>
          )}
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <a data-magnetic className="btn btn-primary" href={`mailto:${EMAIL}`} style={{ borderRadius: 999 }}>
              {EMAIL}
            </a>
            <CopyEmail address={EMAIL} />
            <a data-magnetic className="btn btn-secondary" href="https://github.com/meetkapadia1710-tech" target="_blank" rel="noopener noreferrer" style={{ borderRadius: 999 }}>
              GitHub
            </a>
            <a data-magnetic className="btn btn-secondary" href="https://linkedin.com/in/meet-kapadia17" target="_blank" rel="noopener noreferrer" style={{ borderRadius: 999 }}>
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

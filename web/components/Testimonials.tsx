/* Client quotes.

   Renders nothing while `TESTIMONIALS` is empty — no heading, no empty state,
   no "coming soon". A section that announces it has no content is worse than
   the absence of the section, and this one is on the homepage.

   See content/testimonials.ts for why that array is empty and what has to
   happen before it isn't. */

import { TLink } from './TLink';
import { ScrambleText } from './ScrambleText';
import { TESTIMONIALS } from '../content/testimonials';
import { caseStudies } from '../content/projects';

export function Testimonials() {
  if (!TESTIMONIALS.length) return null;

  return (
    <section style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '12vh var(--gutter) 0' }}>
      <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-6)' }}>
        <ScrambleText>What clients said</ScrambleText>
      </h6>
      <div className="quote-grid">
        {TESTIMONIALS.map((t) => {
          const project = t.slug ? caseStudies.find((p) => p.slug === t.slug) : undefined;
          return (
            <figure key={`${t.name}-${t.quote.slice(0, 16)}`} className="quote card elev-sm" data-reveal>
              <blockquote className="quote-body">{t.quote}</blockquote>
              <figcaption className="quote-by">
                <span className="quote-name">{t.name}</span>
                <span className="quote-role">{t.role}</span>
                {project && (
                  <TLink className="quote-link" to={`/${project.slug}`}>
                    {project.name} →
                  </TLink>
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

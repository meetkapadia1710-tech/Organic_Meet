import { archive, caseStudies, CATEGORIES } from '../content/projects';
import { SplitText } from '../components/SplitText';
import { ScrambleText } from '../components/ScrambleText';
import { WorkRow, PlainRow } from '../components/WorkRow';
import { Contact } from '../components/Contact';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import type { Project } from '../content/types';

const pad = (n: number) => String(n).padStart(2, '0');

/* One list, not a list plus a grid of cards. Everything is a project; the
   only difference is whether there is a case study behind it, and that shows
   in the row itself rather than in a separate section with its own visual
   language further down the page. */
export function Projects() {
  useDocumentMeta(
    'Projects',
    'Every project: AI tooling, hackathon builds, products, client work and earlier experiments.'
  );

  /* Sorted into the same order the page renders, so the counter on a row
     matches its position down the list. Stable, so within a category the
     written-up projects stay ahead of the ones that just link out. */
  const rank = (p: Project) => {
    const i = CATEGORIES.indexOf(p.category ?? '');
    return i === -1 ? CATEGORIES.length : i;
  };
  const all: Project[] = [...caseStudies, ...archive].sort((a, b) => rank(a) - rank(b));
  const total = all.length;
  const numberOf = (project: Project) => pad(all.indexOf(project) + 1);

  return (
    <>
      <header id="main" style={{ padding: '22vh var(--gutter) 0', maxWidth: 'var(--page-max)', margin: '0 auto', position: 'relative' }}>
        <div
          aria-hidden="true"
          data-parallax
          style={{ position: 'absolute', top: '16vh', right: -140, width: 400, height: 400, borderRadius: 999, background: 'var(--color-accent-2-200)', opacity: 0.5, animation: 'float 10s ease-in-out infinite' }}
        />
        <div style={{ position: 'relative' }}>
          <span className="tag tag-neutral" style={{ borderRadius: 999 }}>Everything</span>
          <SplitText
            as="h1"
            text="All projects."
            style={{ fontSize: 'clamp(56px, 10vw, 160px)', lineHeight: 0.95, letterSpacing: '-0.02em', margin: 'var(--space-4) 0 0', maxWidth: '13ch' }}
          />
          {/* Every page's lede now arrives the same way — word by word out
              of its own mask. This was the last one still appearing all at
              once, which made the index feel like a different site to the
              pages either side of it. */}
          <p data-lines style={{ maxWidth: '52ch', fontSize: 20, lineHeight: 1.6, marginTop: 'var(--space-6)', color: 'var(--color-neutral-800)' }}>
            {total} projects, grouped by what they are. {caseStudies.length} have a case study behind them; the rest
            link straight to the thing itself.
          </p>
        </div>
      </header>

      <section style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '10vh var(--gutter) 0' }}>
        {CATEGORIES.map((category) => {
          const group = all.filter((p) => p.category === category);
          if (!group.length) return null;
          return (
            <div key={category}>
              {/* The category headings were the only kickers on the site
                  not scrambling into place. */}
              <h6 className="kicker-rule" style={{ color: 'var(--color-accent-2-700)', margin: 'var(--space-8) 0 var(--space-3)' }}>
                <ScrambleText>{category}</ScrambleText>
              </h6>
              {group.map((project) =>
                project.tier === 'case' ? (
                  <WorkRow key={project.slug} project={project} label={`${numberOf(project)}/${pad(total)}`} />
                ) : (
                  <PlainRow key={project.slug} project={project} label={`${numberOf(project)}/${pad(total)}`} />
                )
              )}
            </div>
          );
        })}
      </section>

      <Contact />
    </>
  );
}

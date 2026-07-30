import { useMemo } from 'react';
import { useParams } from 'react-router';
import { TLink } from '../components/TLink';
import { caseStudies } from '../content/projects';
import { cases } from '../content/cases';
import { Tags } from '../components/WorkRow';
import { Contact } from '../components/Contact';
import { News2Demo, EmbedDemo } from '../components/News2Demo';
import { Figure } from '../components/Figure';
import { StackChips } from '../components/TechIcon';
import { NotFound } from './NotFound';
import { ScrambleText } from '../components/ScrambleText';
import { CaseToc } from '../components/CaseToc';
import { Arrow } from '../components/Arrow';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const pad = (n: number) => String(n).padStart(2, '0');
const slugify = (s: string) => `sec-${s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

export function CasePage() {
  const { slug = '' } = useParams();
  const project = caseStudies.find((p) => p.slug === slug);
  const content = cases[slug];

  // Called before the early return below, so the hook order stays stable
  // whether or not the slug resolves.
  useDocumentMeta(project?.title ?? 'Page not found', project?.desc ?? 'That page does not exist.');

  const index = project ? caseStudies.indexOf(project) : -1;
  const next = index >= 0 ? caseStudies[(index + 1) % caseStudies.length] : undefined;

  const sections = useMemo(
    () =>
      content
        ? [
            { id: slugify('The problem'), label: 'The problem' },
            { id: slugify('How it works'), label: 'How it works' },
            { id: slugify('The hard part'), label: 'The hard part' },
            { id: slugify(content.nextKicker), label: content.nextKicker },
          ]
        : [],
    [content]
  );
  const readingMinutes = useMemo(() => {
    if (!content) return 1;
    const words = [
      content.problem.heading,
      ...content.problem.paras,
      ...content.how.flatMap((c) => [c.title, c.body]),
      ...content.hard,
      ...content.next,
    ]
      .join(' ')
      .split(/\s+/).length;
    return Math.max(1, Math.round(words / 225));
  }, [content]);

  if (!project || !content) return <NotFound />;

  const links = [
    project.links?.live ? { label: 'Live', href: project.links.live } : null,
    project.links?.repo ? { label: 'Source', href: project.links.repo } : null,
    ...(project.links?.extra ?? []),
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  return (
    <>
      <header id="main" style={{ padding: '22vh var(--space-8) 0', maxWidth: 1400, margin: '0 auto', position: 'relative' }}>
        <div
          aria-hidden="true"
          data-parallax
          style={{ position: 'absolute', top: '16vh', right: -140, width: 400, height: 400, borderRadius: 999, background: 'var(--color-accent-2-200)', opacity: 0.5, animation: 'float 10s ease-in-out infinite' }}
        />
        <div style={{ position: 'relative' }}>
          <TLink className="case-back" to="/projects" style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-accent-700)', textDecoration: 'none' }}>
            ← All works
          </TLink>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-4)' }}>
            <span className="tag tag-neutral" style={{ borderRadius: 999 }}>{pad(index + 1)}/{pad(caseStudies.length)}</span>
            <Tags tags={project.tags} />
          </div>
          {/* The far end of the shared-element morph from the work row. */}
          <h1 style={{ viewTransitionName: `case-${project.slug}`, fontSize: 'clamp(44px, 9vw, 150px)', lineHeight: 0.92, letterSpacing: '-0.02em', margin: 'var(--space-4) 0 0', maxWidth: '12ch' }}>
            {project.name}
          </h1>
          <p style={{ maxWidth: '54ch', fontSize: 21, lineHeight: 1.6, marginTop: 'var(--space-6)', color: 'var(--color-neutral-800)' }}>
            {project.summary}
          </p>

          {links.length > 0 && (
            <div style={{ marginTop: 'var(--space-6)', position: 'relative' }}>
              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                {links.map((link) => (
                  <a key={link.href} className="btn btn-secondary" data-magnetic href={link.href} target="_blank" rel="noopener noreferrer" style={{ borderRadius: 999 }}>
                    {link.label} ↗
                  </a>
                ))}
              </div>
              {project.links?.liveNote && (
                <p style={{ margin: 'var(--space-2) 0 0', fontSize: 14, color: 'var(--color-neutral-700)', maxWidth: '52ch' }}>
                  {project.links.liveNote}
                </p>
              )}
            </div>
          )}
        </div>
      </header>

      <CaseToc sections={sections} readingMinutes={readingMinutes} />

      <section style={{ maxWidth: 1400, margin: '0 auto', padding: 'var(--space-8) var(--space-8) 0' }}>
        <Figure caption={content.heroFigure} image={content.heroImage} ratio="16/8" priority />
      </section>

      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '12vh var(--space-8) 0' }}>
        <div className="g-split" style={{ display: 'grid', gap: 'var(--space-8)', alignItems: 'start' }}>
          <div>
            <h6 className="kicker-rule case-sticky-kicker" id={sections[0]?.id} style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}><ScrambleText>The problem</ScrambleText></h6>
            <h2 className="fill-scroll" style={{ margin: '0 0 var(--space-6)', fontSize: 'clamp(28px, 3.4vw, 48px)', lineHeight: 1.1, maxWidth: '22ch' }}>
              {content.problem.heading}
            </h2>
            {content.problem.paras.map((para, i) => (
              <p key={i} style={{ fontSize: 17, lineHeight: 1.8, color: 'var(--color-neutral-800)', maxWidth: '62ch' }}>{para}</p>
            ))}
          </div>
          <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', display: 'grid', gap: 'var(--space-4)' }}>
            {([['Role', content.facts.role], ['Year', content.facts.year], ['Stack', content.facts.stack], ['Surfaces', content.facts.surfaces]] as const).map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-700)', marginBottom: 4 }}>{label}</div>
                {/* The stack is the one fact that is really a list. As chips it
                    can be scanned rather than read, and it stops being a wall
                    of middle dots on a narrow column. */}
                {label === 'Stack' ? (
                  <StackChips stack={value} />
                ) : (
                  <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5 }}>{value}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '12vh var(--space-8) 0' }}>
        <h6 className="kicker-rule case-sticky-kicker" id={sections[1]?.id} style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}><ScrambleText>How it works</ScrambleText></h6>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {content.how.map((card, i) => (
            <div key={card.title} className="card elev-sm" data-tilt data-reveal style={{ borderRadius: 'var(--radius-lg)' }}>
              <div className="card-kicker">{pad(i + 1)}</div>
              <h3 className="card-title">{card.title}</h3>
              <p className="card-body">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '12vh var(--space-8) 0' }}>
        <div className="g-duo" style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {content.figures.map((caption, i) => (
            <Figure
              key={i}
              caption={caption}
              image={content.figureImages?.[i]}
              ratio="4/3"
              sizes="(max-width: 719px) 92vw, (max-width: 1099px) 90vw, 660px"
            />
          ))}
        </div>

        {/* Screenshots past the two-up. Every one is lazy and narrow-sourced,
            so a project with five of them costs about what one unoptimised
            PNG used to. */}
        {content.gallery && content.gallery.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-4)',
              marginTop: 'var(--space-4)',
            }}
          >
            {content.gallery.map((image) => (
              <Figure
                key={image.src}
                caption={image.alt}
                image={image}
                ratio="4/3"
                sizes="(max-width: 719px) 92vw, (max-width: 1099px) 45vw, 440px"
              />
            ))}
          </div>
        )}
      </section>

      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '12vh var(--space-8) 0' }}>
        <div className="g-duo" style={{ display: 'grid', gap: 'var(--space-8)' }}>
          <div>
            <h6 className="kicker-rule case-sticky-kicker" id={sections[2]?.id} style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}><ScrambleText>The hard part</ScrambleText></h6>
            {content.hard.map((para, i) => (
              <p key={i} style={{ fontSize: 17, lineHeight: 1.8, color: 'var(--color-neutral-800)' }}>{para}</p>
            ))}
          </div>
          <div>
            <h6 className="kicker-rule case-sticky-kicker" id={sections[3]?.id} style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}>{content.nextKicker}</h6>
            {content.next.map((para, i) => (
              <p key={i} style={{ fontSize: 17, lineHeight: 1.8, color: 'var(--color-neutral-800)' }}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      {project.demo === 'news2' && (
        <section style={{ maxWidth: 1400, margin: '0 auto', padding: '12vh var(--space-8) 0' }}>
          <News2Demo />
        </section>
      )}
      {project.demo && typeof project.demo === 'object' && (
        <section style={{ maxWidth: 1400, margin: '0 auto', padding: '12vh var(--space-8) 0' }}>
          <EmbedDemo src={project.demo.embed} label={project.demo.label} note={project.demo.note} />
        </section>
      )}

      {next && (
        <section style={{ maxWidth: 1400, margin: '0 auto', padding: '12vh var(--space-8) 0' }}>
          <TLink className="next g-next" data-cursor="Next project" to={`/${next.slug}`} style={{ display: 'grid', gap: 'var(--space-6)', alignItems: 'center', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', textDecoration: 'none', color: 'var(--color-text)' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 15, color: 'var(--color-accent-600)' }}>Next<Arrow /></span>
            <h2 className="next-t" style={{ margin: 0, fontSize: 42 }}>{next.name}</h2>
            <span className="next-a" style={{ textAlign: 'right', color: 'var(--color-accent-700)', fontWeight: 600 }}>
              {pad(caseStudies.indexOf(next) + 1)}/{pad(caseStudies.length)}
            </span>
          </TLink>
        </section>
      )}

      <Contact withBlurb={false} />
    </>
  );
}

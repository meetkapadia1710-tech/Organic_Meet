import { TLink } from './TLink';
import type { Project } from '../content/types';

const ROW: React.CSSProperties = {
  display: 'grid',
  gap: 'var(--space-6)',
  alignItems: 'center',
  padding: 'var(--space-6)',
  borderRadius: 'var(--radius-lg)',
  textDecoration: 'none',
  color: 'var(--color-text)',
};

export function Tags({ tags, firstAccent = true }: { tags: string[]; firstAccent?: boolean }) {
  return (
    <>
      {tags.map((tag, i) => (
        <span
          key={tag}
          className={firstAccent && i === 0 ? 'tag tag-accent-2' : 'tag tag-neutral'}
          style={{ borderRadius: 999 }}
        >
          {tag}
        </span>
      ))}
    </>
  );
}

/* The shared-element half of the page transition: this title and the case
   study's <h1> carry the same view-transition-name, so the router morphs one
   into the other across the navigation. */
export function WorkRow({ project, label }: { project: Project; label: string }) {
  return (
    <TLink className="work g-work" data-cursor="View case" data-reveal to={`/${project.slug}`} style={ROW}>
      <span style={{ fontFamily: 'var(--font-heading)', fontSize: 15, color: 'var(--color-accent-600)' }}>
        {label}
      </span>
      <div>
        <h2
          className="work-t"
          style={{ viewTransitionName: `case-${project.slug}`, margin: '0 0 var(--space-2)', fontSize: 42 }}
        >
          {project.name}
        </h2>
        <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
          <Tags tags={project.tags} />
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--color-neutral-800)' }}>
        {project.summary}
      </p>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{project.year}</div>
        <span className="work-a" style={{ display: 'inline-block', color: 'var(--color-accent-700)', fontWeight: 600 }}>
          Case study →
        </span>
      </div>
    </TLink>
  );
}

/* A project with no case study behind it. Same row, same rhythm — but it
   is not a link, because there is nowhere to go; the last column carries its
   real links instead of a promise of a page. */
export function PlainRow({ project, label }: { project: Project; label: string }) {
  const links = [
    project.links?.live ? { label: 'Live', href: project.links.live } : null,
    project.links?.repo ? { label: 'Source', href: project.links.repo } : null,
    ...(project.links?.extra ?? []),
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  return (
    <div className="work arch g-work" data-reveal style={ROW}>
      <span style={{ fontFamily: 'var(--font-heading)', fontSize: 15, color: 'var(--color-accent-600)' }}>
        {label}
      </span>
      <div>
        {/* Same `work-t` hook as a case-study row: the hover colour shift and
            the 6px nudge are how a row acknowledges the pointer, and a row
            without them reads as disabled next to the ones that have them. */}
        <h2 className="work-t" style={{ margin: '0 0 var(--space-2)', fontSize: 42 }}>
          {project.name}
          {project.status && (
            <span className="tag tag-accent" style={{ borderRadius: 999, marginLeft: 'var(--space-3)', verticalAlign: 'middle' }}>
              {project.status}
            </span>
          )}
        </h2>
        <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
          <Tags tags={project.tags} />
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--color-neutral-800)' }}>
        {project.summary}
      </p>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{project.year}</div>
        <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {links.map((link) => (
            <a key={link.href} className="btn btn-ghost" data-magnetic href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

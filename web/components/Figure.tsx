/* A figure in a case study.

   With no image it renders the striped placeholder the site has always used,
   labelled with what belongs there. Give it a `src` and it renders the real
   thing instead — same wrapper, same `.washed` treatment, same reveal, so
   adding a screenshot never changes the layout around it.

   width/height are required alongside a src so the browser reserves the space
   before the file loads; without them every image would shift the page as it
   arrives. */

export interface FigureImage {
  src: string;
  /** Describe what the screenshot shows, not that it is a screenshot. */
  alt: string;
  width: number;
  height: number;
}

const SHELL: React.CSSProperties = {
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
  background: 'repeating-linear-gradient(135deg, var(--color-neutral-200) 0 14px, var(--color-neutral-300) 14px 28px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const CAPTION: React.CSSProperties = {
  fontFamily: 'ui-monospace, monospace',
  fontSize: 12,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--color-neutral-700)',
};

/* scripts/images.mjs writes three widths per screenshot: the 1600 under the
   plain name, and -800 / -1200 beside it. Rebuilding the srcset by convention
   keeps cases.ts holding one path per image instead of three.

   Without this a phone rendering a figure at ~340 CSS pixels downloaded the
   1600px file and discarded almost all of it. */
function sourceSet(src: string): string | undefined {
  if (!src.endsWith('.webp')) return undefined;
  const base = src.slice(0, -'.webp'.length);
  return `${base}-800.webp 800w, ${base}-1200.webp 1200w, ${src} 1600w`;
}

export function Figure({
  caption,
  image,
  ratio = '16/8',
  priority = false,
  sizes = '(max-width: 719px) 92vw, (max-width: 1099px) 90vw, 1340px',
}: {
  caption: string;
  image?: FigureImage | undefined;
  ratio?: string;
  /** The one figure above the fold. Lazy-loading it delays the thing the
   *  visitor is already looking at. */
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <figure data-reveal data-figure className="washed" style={{ ...SHELL, aspectRatio: ratio, margin: 0 }}>
      {image ? (
        <img
          src={image.src}
          srcSet={sourceSet(image.src)}
          sizes={sizes}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span style={CAPTION}>{caption}</span>
      )}
    </figure>
  );
}

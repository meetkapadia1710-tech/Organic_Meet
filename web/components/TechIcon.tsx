/* ─────────────────────────────────────────────────────────────────────────
   TechIcon.tsx — a small glyph per technology.

   These are drawn here rather than pulled from an icon package, for three
   reasons: the site makes no third-party requests outside /stats and adding a
   CDN font or sprite sheet for decoration would break that; brand SVGs carry
   brand colours that fight a palette which reverses wholesale in dark mode;
   and an icon set that only needs thirty marks is smaller hand-drawn than any
   dependency that ships thousands.

   Every glyph is `currentColor` on a 24x24 grid, so it inherits colour and
   flips with the theme like text does. They are marks, not logos — close
   enough to be recognised in a row of chips, not close enough to pretend to
   be official artwork.

   Anything unmatched falls through to a neutral dot, so a stack line with a
   technology nobody has drawn yet still renders as a tidy chip.
   ───────────────────────────────────────────────────────────────────────── */

import type { ReactNode } from 'react';

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/** A boxed monogram — for the things whose mark *is* their initials. */
function Mono({ children }: { children: string }) {
  return (
    <>
      <rect x="2.5" y="2.5" width="19" height="19" rx="4.5" {...S} />
      <text
        x="12"
        y="12"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        stroke="none"
        style={{ font: '700 8.5px var(--font-body, system-ui)', letterSpacing: '.02em' }}
      >
        {children}
      </text>
    </>
  );
}

/* Keys are matched as substrings against a lower-cased name, longest first,
   so 'react native' wins over 'react' and 'next' never swallows 'nextjs'. */
const GLYPHS: Record<string, ReactNode> = {
  'react native': (
    <>
      <circle cx="12" cy="12" r="2" {...S} />
      <ellipse cx="12" cy="12" rx="4" ry="9.5" {...S} />
      <ellipse cx="12" cy="12" rx="4" ry="9.5" transform="rotate(60 12 12)" {...S} />
      <path d="M4 20h16" {...S} />
    </>
  ),
  react: (
    <>
      <circle cx="12" cy="12" r="2" {...S} />
      <ellipse cx="12" cy="12" rx="9.5" ry="4" {...S} />
      <ellipse cx="12" cy="12" rx="9.5" ry="4" transform="rotate(60 12 12)" {...S} />
      <ellipse cx="12" cy="12" rx="9.5" ry="4" transform="rotate(120 12 12)" {...S} />
    </>
  ),
  typescript: <Mono>TS</Mono>,
  javascript: <Mono>JS</Mono>,
  'next.js': (
    <>
      <circle cx="12" cy="12" r="9.5" {...S} />
      <path d="M8.5 16V8.5l7 7.5" {...S} />
      <path d="M15.5 8.5V14" {...S} />
    </>
  ),
  python: (
    <>
      <path d="M12 2.8c-3.2 0-3.6 1.4-3.6 2.8V8h7.2v1H6.6C4.8 9 3.2 10.2 3.2 13.4S4.8 17.8 6.6 17.8h1.8v-2.6c0-1.9 1.5-3.4 3.4-3.4h3.6" {...S} />
      <path d="M12 21.2c3.2 0 3.6-1.4 3.6-2.8V16H8.4v-1h9c1.8 0 3.4-1.2 3.4-4.4s-1.6-4.4-3.4-4.4h-1.8v2.6c0 1.9-1.5 3.4-3.4 3.4H8.6" {...S} />
    </>
  ),
  'node.js': (
    <>
      <path d="M12 2.6 20.5 7.3v9.4L12 21.4 3.5 16.7V7.3z" {...S} />
      <path d="M9 9.5v5a2 2 0 0 0 2 2h.2M13.4 9.5h1.8a1.6 1.6 0 0 1 0 3.2h-1.6a1.6 1.6 0 0 0 0 3.2h1.8" {...S} />
    </>
  ),
  tailwind: (
    <>
      <path d="M3 10c1.5-3.4 3.5-5.1 6-5.1 3.75 0 4.2 3.4 6.1 3.9 1.25.35 2.35-.1 3.3-1.35-1.5 3.4-3.5 5.1-6 5.1-3.75 0-4.2-3.4-6.1-3.9C5.05 8.3 3.95 8.75 3 10Z" {...S} />
      <path d="M3 17.5c1.5-3.4 3.5-5.1 6-5.1 3.75 0 4.2 3.4 6.1 3.9 1.25.35 2.35-.1 3.3-1.35-1.5 3.4-3.5 5.1-6 5.1-3.75 0-4.2-3.4-6.1-3.9-1.25-.35-2.35.1-3.3 1.35Z" {...S} />
    </>
  ),
  firebase: (
    <>
      <path d="M5 17.5 9.2 4.2a.6.6 0 0 1 1.08-.15L12.4 7.4" {...S} />
      <path d="m5 17.5 2.4-9.2a.6.6 0 0 1 1.03-.25L19 19.6" {...S} />
      <path d="M5 17.5 12 21.4l7-1.8" {...S} />
    </>
  ),
  firestore: (
    <>
      <path d="M5 17.5 9.2 4.2a.6.6 0 0 1 1.08-.15L12.4 7.4" {...S} />
      <path d="m5 17.5 2.4-9.2a.6.6 0 0 1 1.03-.25L19 19.6" {...S} />
      <path d="M5 17.5 12 21.4l7-1.8" {...S} />
    </>
  ),
  supabase: (
    <>
      <path d="M12.8 2.6v8.2h6.1a.6.6 0 0 1 .46.99L11.2 21.4v-8.2H5.1a.6.6 0 0 1-.46-.99z" {...S} />
    </>
  ),
  postgres: (
    <>
      <ellipse cx="12" cy="6.2" rx="7.5" ry="3.2" {...S} />
      <path d="M4.5 6.2v11.6c0 1.77 3.36 3.2 7.5 3.2s7.5-1.43 7.5-3.2V6.2" {...S} />
      <path d="M4.5 12c0 1.77 3.36 3.2 7.5 3.2s7.5-1.43 7.5-3.2" {...S} />
    </>
  ),
  mongodb: (
    <>
      <path d="M12 2.6c3.4 4 5.1 7 5.1 9.9 0 3.4-2.3 6.2-5.1 7.3-2.8-1.1-5.1-3.9-5.1-7.3 0-2.9 1.7-5.9 5.1-9.9Z" {...S} />
      <path d="M12 6.5v14.9" {...S} />
    </>
  ),
  drizzle: (
    <>
      <path d="M8 4.5 4.5 11M14 4.5 10.5 11M20 4.5 16.5 11" {...S} />
      <path d="M11 13.5 7.5 20M17 13.5 13.5 20" {...S} />
    </>
  ),
  vite: (
    <>
      <path d="M3.2 5.4 12 21.2l8.8-15.8L12 7.6z" {...S} />
      <path d="m12 7.6-1 5.2 2.6-1.1-1 4.6" {...S} />
    </>
  ),
  gsap: <Mono>GS</Mono>,
  lenis: (
    <>
      <path d="M4 8h16M4 12h11M4 16h7" {...S} />
    </>
  ),
  'framer motion': (
    <>
      <path d="M6 3.5h12L12 10zM6 10.5h12L18 17H6zM6 17.5h6v6z" {...S} />
    </>
  ),
  motion: (
    <>
      <path d="M6 3.5h12L12 10zM6 10.5h12L18 17H6zM6 17.5h6v6z" {...S} />
    </>
  ),
  expo: (
    <>
      <circle cx="12" cy="12" r="9.5" {...S} />
      <path d="M6.5 16.5 12 7l5.5 9.5" {...S} />
    </>
  ),
  stripe: <Mono>S</Mono>,
  razorpay: (
    <>
      <path d="M6 21 14 3h4l-3.5 8.5" {...S} />
      <path d="M4.5 14.5h9L11 21H2z" {...S} />
    </>
  ),
  cloudinary: (
    <>
      <path d="M7.2 18.5a4.2 4.2 0 0 1-.5-8.37 5.6 5.6 0 0 1 10.75-1.1A3.9 3.9 0 0 1 17.2 18.5z" {...S} />
      <path d="M12 15V9.5M9.6 11.6 12 9.2l2.4 2.4" {...S} />
    </>
  ),
  'socket.io': (
    <>
      <circle cx="12" cy="12" r="8.5" {...S} />
      <circle cx="12" cy="3.5" r="1.6" {...S} />
      <path d="m9 15 6-6" {...S} />
    </>
  ),
  websocket: (
    <>
      <path d="M3 12h3l2.5-5 3 10 3-10 2.5 5h4" {...S} />
    </>
  ),
  fastapi: (
    <>
      <circle cx="12" cy="12" r="9.5" {...S} />
      <path d="M12.8 5.5 8.5 13h4l-.7 5.5 4.5-7.5h-4z" {...S} />
    </>
  ),
  express: <Mono>EX</Mono>,
  passport: (
    <>
      <rect x="4.5" y="2.8" width="15" height="18.4" rx="2.5" {...S} />
      <circle cx="12" cy="9.5" r="2.6" {...S} />
      <path d="M8 16.5h8" {...S} />
    </>
  ),
  ocr: (
    <>
      <path d="M3.5 8V5.5a2 2 0 0 1 2-2H8M16 3.5h2.5a2 2 0 0 1 2 2V8M20.5 16v2.5a2 2 0 0 1-2 2H16M8 20.5H5.5a2 2 0 0 1-2-2V16" {...S} />
      <path d="M8 9.5h8M8 13h5" {...S} />
    </>
  ),
  llm: (
    <>
      <path d="M12 3.2 13.9 9l5.9 1.9-5.9 1.9L12 18.7 10.1 12.8 4.2 10.9 10.1 9z" {...S} />
      <path d="M18.5 16.5 19.3 19l2.5.8-2.5.8-.8 2.5" {...S} />
    </>
  ),
  postgresql: (
    <>
      <ellipse cx="12" cy="6.2" rx="7.5" ry="3.2" {...S} />
      <path d="M4.5 6.2v11.6c0 1.77 3.36 3.2 7.5 3.2s7.5-1.43 7.5-3.2V6.2" {...S} />
      <path d="M4.5 12c0 1.77 3.36 3.2 7.5 3.2s7.5-1.43 7.5-3.2" {...S} />
    </>
  ),
  pwa: (
    <>
      <rect x="6.5" y="2.6" width="11" height="18.8" rx="2.5" {...S} />
      <path d="M10.5 5.5h3" {...S} />
      <path d="M12 10v6M9.4 12.6 12 10l2.6 2.6" {...S} />
    </>
  ),
  css: <Mono>CS</Mono>,
  html: <Mono>HT</Mono>,
};

/* Longest key first so a more specific match is never shadowed by a shorter
   one that happens to be a substring of it. Computed once. */
const KEYS = Object.keys(GLYPHS).sort((a, b) => b.length - a.length);

function glyphFor(name: string): ReactNode {
  const n = name.toLowerCase();
  for (const key of KEYS) {
    if (n.includes(key)) return GLYPHS[key];
  }
  // A few families worth catching after the exact names.
  if (/\b(ai|ml|gemini|groq|claude|openai|ollama|deberta|model)\b/.test(n)) return GLYPHS['llm'];
  if (/postgres|sql|database|schema/.test(n)) return GLYPHS['postgres'];
  if (/node/.test(n)) return GLYPHS['node.js'];
  return <circle cx="12" cy="12" r="4" {...S} />;
}

export function TechIcon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      /* The monogram glyphs contain real <text>, which selects and copies
         along with the label beside them — "TSTypeScript". Screen readers
         already skip it via aria-hidden; this stops the pointer picking it
         up too. */
      style={{ flex: 'none', display: 'block', userSelect: 'none' }}
    >
      {glyphFor(name)}
    </svg>
  );
}

/* A stack line is authored as "Next.js · React 19 · Tailwind v4". Splitting on
   the separator is what turns one string into a row of labelled chips without
   any project having to restate its stack as an array. */
export function StackChips({ stack }: { stack: string }) {
  const items = stack
    .split(/\s*[·|,]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
      {items.map((item) => (
        <span
          key={item}
          className="stack-chip"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '5px 11px 5px 8px',
            borderRadius: 999,
            background: 'var(--color-bg)',
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.35,
          }}
        >
          <span style={{ color: 'var(--color-accent-700)' }}>
            <TechIcon name={item} size={16} />
          </span>
          {item}
        </span>
      ))}
    </div>
  );
}

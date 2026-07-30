/* The CV download.

   Renders nothing until `RESUME_READY` is flipped in content/site.ts. A
   download button that 404s reads as a broken site to a recruiter — the exact
   person it exists for — so the absence is the safer default.

   `download` rather than a plain link so it saves instead of opening the
   browser's PDF viewer, and `type` so the browser knows what is coming before
   the response arrives. */

import { RESUME_PATH, RESUME_READY } from '../content/site';
import { Arrow } from './Arrow';

export function ResumeButton({ variant = 'secondary' }: { variant?: 'primary' | 'secondary' }) {
  if (!RESUME_READY) return null;

  return (
    <a
      className={`btn btn-${variant}`}
      data-magnetic
      data-cursor="Download"
      href={RESUME_PATH}
      download
      type="application/pdf"
      style={{ borderRadius: 999 }}
    >
      Download CV
      <Arrow glyph="↓" />
    </a>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   site.ts — the handful of facts about the site itself.

   These exist because they were previously scattered: the email was written
   out in three components, and the canonical origin was nowhere at all, which
   is why nothing on the site emitted a canonical link or an absolute OG URL.
   ───────────────────────────────────────────────────────────────────────── */

/** Production URL comes from .env.production or the deployment environment.
 * It may include a hosting subpath. Build scripts validate it before use.
 */
export const SITE_URL: string = (import.meta.env.VITE_SITE_URL ?? '').trim().replace(/\/+$/, '');

export const EMAIL = 'kapadiameet07@gmail.com';

export const SOCIAL = {
  github: 'https://github.com/meetkapadia1710-tech',
  linkedin: 'https://linkedin.com/in/meet-kapadia17',
} as const;

/**
 * Where the CV lives, relative to the site root.
 *
 * ⚠️ **The file does not exist yet.** Drop the PDF at `web/public/resume.pdf`
 * and enable `RESUME_READY` below — see `RESUME_READY`
 * below for why they are hidden rather than rendering a link to a 404.
 */
export const RESUME_PATH = '/resume.pdf';

/**
 * Whether to show the resume download at all.
 *
 * A button that 404s is worse than no button: it reads as a broken site to
 * exactly the person — a recruiter — you least want to show one to. This is a
 * manual flag rather than a fetch on mount, because a HEAD request per page
 * load to answer a question that changes once is the wrong trade.
 *
 * **Flip this to `true` in the same commit that adds the PDF.**
 */
export const RESUME_READY = false;

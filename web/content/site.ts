/* ─────────────────────────────────────────────────────────────────────────
   site.ts — the handful of facts about the site itself.

   These exist because they were previously scattered: the email was written
   out in three components, and the canonical origin was nowhere at all, which
   is why nothing on the site emitted a canonical link or an absolute OG URL.
   ───────────────────────────────────────────────────────────────────────── */

/**
 * The production origin, no trailing slash.
 *
 * ⚠️ **Not set yet.** Set `VITE_SITE_URL` in the Vercel project's environment
 * variables (and in a local `.env` if you want it during `npm run dev`) to the
 * real domain — `https://meetkapadia.com`, or whatever the Vercel URL ends up
 * being.
 *
 * Two things stay switched off until it is: `scripts/sitemap.mjs` refuses to
 * write a sitemap rather than publishing placeholder URLs, and the canonical
 * link tag is omitted rather than pointing somewhere wrong. Both fail closed
 * on purpose — a sitemap or a canonical carrying the wrong origin actively
 * misdirects crawlers, which is worse than not having one.
 */
export const SITE_URL: string = (import.meta.env.VITE_SITE_URL ?? '').replace(/\/+$/, '');

export const EMAIL = 'kapadiameet07@gmail.com';

export const SOCIAL = {
  github: 'https://github.com/meetkapadia1710-tech',
  linkedin: 'https://linkedin.com/in/meet-kapadia17',
} as const;

/**
 * Where the CV lives, relative to the site root.
 *
 * ⚠️ **The file does not exist yet.** Drop the PDF at `web/public/resume.pdf`
 * and every download button on the site turns itself on — see `RESUME_READY`
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

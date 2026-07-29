/* ─────────────────────────────────────────────────────────────────────────
   stats.ts — the handles the Stats page reads from.

   Everything on that page is rendered by a third-party image service from a
   username. That is a real trade-off worth stating: the rest of this site
   makes no third-party requests at all, and these panels do — they can go
   down, they can be slow, and they see the visitor's IP. The page is built so
   an unset handle renders nothing rather than a broken box, and every panel
   links out to the real profile so the numbers are never the only route.

   Fill a handle in and its panel appears.
   ───────────────────────────────────────────────────────────────────────── */

export interface StatsConfig {
  github?: string;
  leetcode?: string;
  /** TODO: add your Codolio profile URL, e.g. https://codolio.com/profile/you */
  codolio?: string;
  /** TODO: add if you use it. */
  hackerrank?: string;
}

export const stats: StatsConfig = {
  github: 'meetkapadia1710-tech',
  leetcode: 'Code-Hacker_17',
};

/** The accent, without the leading hash — several of these services take a
 *  hex colour as a path segment or query param. */
export const ACCENT = 'c67139';
export const ACCENT_2 = '7a8a5e';

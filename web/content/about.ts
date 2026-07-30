/* ─────────────────────────────────────────────────────────────────────────
   about.ts — the biography facts, in one place.

   **Only what the repository can already vouch for is filled in here.**
   Everything else is left as an explicit TODO rather than a plausible guess:
   a portfolio is a factual claim about a person, and a wrong graduation year
   or an invented job title is the kind of error that is embarrassing in an
   interview and impossible to spot by reading the page.

   Entries with `todo: true` do not render. Fill one in, delete the flag, and
   it appears — nothing else to wire up.
   ───────────────────────────────────────────────────────────────────────── */

export interface TimelineEntry {
  /** Displayed as written — "2024 — present", "Summer 2025". */
  period: string;
  title: string;
  org: string;
  body: string;
  /** Hidden until the real details are filled in. */
  todo?: boolean;
}

export const EDUCATION: TimelineEntry[] = [
  {
    // ⚠️ The start year and expected graduation are not recorded anywhere in
    // this repo. Fill both in and drop the todo flag.
    period: 'TODO — start year to expected graduation',
    title: 'B.Tech, Computer Science & Engineering',
    org: 'IIIT Vadodara',
    body: 'TODO — anything worth saying: coursework that mattered, a project that came out of it, a society or a role.',
    todo: true,
  },
];

export const EXPERIENCE: TimelineEntry[] = [
  {
    // ⚠️ Years unknown. The client case studies carry a `facts.year`, but the
    // engagement dates and the nature of the arrangement (freelance? agency?
    // per-project?) are not written down anywhere.
    period: 'TODO — years',
    title: 'Freelance web developer',
    org: 'Bhumi Developers · BD Buildcon · Mann Beauty',
    body: 'TODO — how the work came about and what you owned. Three paying clients, four shipped projects; the case studies cover the builds, this should cover the working relationship.',
    todo: true,
  },
];

/**
 * The short version, in the first person. This one is safe to ship as written
 * because every claim in it is already made elsewhere on the site.
 */
export const BIO = [
  'I build full-stack web apps, AI tooling and local-first systems — and I ship them end to end, from the Postgres schema to the last hover state.',
  'Most of what I make sits where AI meets infrastructure: a tool that grades a repository against its actual code, an assistant with a swappable brain and semantic memory, a memory layer that never leaves the machine.',
  'I am a student, so the work is also how I learn. The projects come first and the portfolio is the receipt.',
];

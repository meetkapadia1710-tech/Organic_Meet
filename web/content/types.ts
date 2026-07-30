/* ─────────────────────────────────────────────────────────────────────────
   types.ts — the shapes the build works in.

   The interesting one is Project: it's a discriminated-ish union in spirit
   (a case study needs a `src` and a `category`, an archive entry needs
   neither) but kept as one optional-field interface, because the data file
   is meant to stay readable by a human adding a project at 1am. The build
   asserts what it needs at the point it needs it instead.
   ───────────────────────────────────────────────────────────────────────── */

export type Tier = 'case' | 'archive';

export interface ProjectLink {
  label: string;
  href: string;
}

export interface ProjectLinks {
  /** A deployed, clickable version. */
  live?: string;
  /** Source repository. */
  repo?: string;
  /** Rendered under the link row — for warning about a cold-starting host. */
  liveNote?: string;
  /** Anything else worth linking: a model card, a write-up, a store page. */
  extra?: ProjectLink[];
}

export interface Project {
  /** URL name; a case study becomes <slug>.html */
  slug: string;
  name: string;
  year: string;
  tier: Tier;

  /** Groups the work rows on the projects page. Case studies only. */
  category?: string;
  /** Shown on the homepage's five. */
  featured?: boolean;
  /**
   * Known about but not shown — either not written yet, or deliberately
   * excluded. Kept in the data so the reason travels with the entry.
   */
  pending?: boolean;
  /** A badge on an archive card, e.g. "In progress". */
  status?: string;

  tags: string[];
  /** The one-liner on a row. Roughly 25 words. */
  summary: string;

  /** <title> for the case page. */
  title?: string;
  /** Meta description for the case page. */
  desc?: string;
  /** An interactive demo rendered at the end of the case study. */
  demo?: 'news2' | { embed: string; label: string; note: string };

  /**
   * Thumbnail for the homepage row hover preview. Deliberately duplicated
   * from the matching `heroImage` in cases.ts rather than read from it:
   * cases.ts carries every case study's prose and is a 24.5 kB gzip chunk
   * that only loads on a case page. Importing it into the homepage to reach
   * two image paths would pull all of that into the first paint and undo the
   * route-splitting pass.
   *
   * Point it at the -800 variant; the preview never renders above 300px.
   * Projects with no screenshot omit this and get the typographic card.
   */
  preview?: string;

  links?: ProjectLinks;
}

/** A page the build will emit. */
export interface PageSpec {
  src: string;
  out: string;
  title: string;
  desc: string;
  /** Set on the 404 so it is never canonicalised or indexed. */
  noindex?: boolean;
  /** Present when the page is a case study, carrying its data. */
  project?: Project;
}

/** One entry in the command palette's index. */
export interface SearchEntry {
  title: string;
  subtitle: string;
  url: string;
  group: string;
  keywords: string;
}

/* ─────────────────────────────────────────────────────────────────────────
   testimonials.ts — client quotes.

   **Deliberately empty.** This file has the shape and the component that
   renders it is written and wired, but there is nothing in it and nothing
   will be added by anyone but Meet.

   A testimonial is a statement attributed to a named real person about work
   they paid for. Writing a plausible one — even as a placeholder, even
   clearly marked — produces a fabricated quote from a real, identifiable
   business, and the failure mode is that it ships. Nothing about this file's
   shape needs a sample to be understood.

   To add one:
   1. Get the words from the client, in writing, and permission to publish
      them with their name and company.
   2. Add the entry below.
   3. `<Testimonials />` is already rendered on the homepage and turns itself
      on as soon as this array is non-empty.

   Nothing renders while the list is empty — no heading, no empty state, no
   "testimonials coming soon". A section announcing that it has no content is
   worse than the absence of the section.
   ───────────────────────────────────────────────────────────────────────── */

export interface Testimonial {
  /** The quote itself, in their words. Do not tidy it up. */
  quote: string;
  /** The person. */
  name: string;
  /** Their role and company — "Founder, Bhumi Developers". */
  role: string;
  /** Which project it refers to, if it refers to one. Matches a project slug
   *  so the card can link through to the case study. */
  slug?: string;
}

export const TESTIMONIALS: Testimonial[] = [];

/* ─────────────────────────────────────────────────────────────────────────
   uses.ts — the /uses page.

   The software half is derived from `stack.ts`, so it cannot disagree with
   what the rest of the site says is being used. The hardware and the daily
   drivers cannot be derived from anything — no file in this repo knows what
   machine it was written on — so they are TODOs rather than a guess.

   A /uses page whose hardware section is invented is worse than no /uses
   page: it is the one page on a portfolio that is *only* specifics, and it is
   read by people who will notice.

   Groups with `todo: true` do not render.
   ───────────────────────────────────────────────────────────────────────── */

export interface UsesGroup {
  name: string;
  note?: string;
  items: Array<{ name: string; note?: string }>;
  /** Hidden until filled in with real answers. */
  todo?: boolean;
}

export const USES: UsesGroup[] = [
  {
    name: 'Machine',
    note: 'TODO — model, chip, RAM, screens, and anything you would actually recommend about it.',
    items: [
      { name: 'TODO — laptop or desktop' },
      { name: 'TODO — display' },
      { name: 'TODO — keyboard' },
      { name: 'TODO — mouse or trackpad' },
    ],
    todo: true,
  },
  {
    name: 'Editor & terminal',
    note: 'VS Code is already listed in the stack; the rest of this is worth being specific about.',
    items: [
      { name: 'VS Code', note: 'TODO — theme, font, and the three extensions you would not work without' },
      { name: 'TODO — terminal' },
      { name: 'TODO — shell' },
    ],
    todo: true,
  },
  {
    name: 'Daily drivers',
    note: 'The tools that are open every day but never make it into a tech-stack list.',
    items: [
      { name: 'TODO — notes' },
      { name: 'TODO — design or diagramming' },
      { name: 'TODO — API client', note: 'Postman is in the stack — confirm it is still the one' },
      { name: 'TODO — browser' },
    ],
    todo: true,
  },
];

/**
 * How the software section reads the real stack. Ordered deliberately rather
 * than alphabetically: what someone lands on /uses to find out is what you
 * reach for first, and "Languages" answers that better than "AI / LLM".
 */
export const SOFTWARE_ORDER = ['Languages', 'Frontend', 'Backend', 'Databases', 'AI / LLM', 'Tools & Platforms'] as const;

/* ─────────────────────────────────────────────────────────────────────────
   stack.ts — the full technology list, as Meet gave it.

   Kept as data rather than markup so the homepage rows and anything later
   (a résumé page, a filter on /projects) read from one list. The category
   names are his; the split into three marquee rows is only about balancing
   row lengths, so each row carries whole categories rather than cutting one
   in half.
   ───────────────────────────────────────────────────────────────────────── */

export interface StackGroup {
  name: string;
  items: string[];
}

export const stack: StackGroup[] = [
  {
    name: 'Languages',
    items: ['JavaScript', 'TypeScript', 'C++', 'Python', 'SQL', 'HTML5', 'CSS3'],
  },
  {
    name: 'Frontend',
    items: [
      'React.js',
      'Next.js',
      'React Native (Expo)',
      'Tailwind CSS',
      'Redux Toolkit',
      'Zustand',
      'Framer Motion',
      'Vite',
      'PWA',
    ],
  },
  {
    name: 'Backend',
    items: ['Node.js', 'Express.js', 'REST APIs', 'Firebase Cloud Functions', 'Socket.io', 'Prisma'],
  },
  {
    name: 'Databases',
    items: ['MongoDB', 'PostgreSQL', 'MySQL', 'Firebase / Firestore'],
  },
  {
    name: 'Tools & Platforms',
    items: ['Git', 'GitHub', 'Postman', 'Vercel', 'Render', 'Capacitor', 'Vitest', 'VS Code'],
  },
  {
    name: 'AI / LLM',
    items: ['Google Gemini', 'Groq', 'Hindsight (Vector Memory)', 'Prompt Engineering'],
  },
  {
    name: 'Core CS',
    items: ['Data Structures & Algorithms', 'DBMS', 'OOP', 'Operating Systems', 'Computer Networks'],
  },
];

/* Three rows of roughly equal length, alternating direction. Whole categories
   only — a row that ends mid-Frontend would read as arbitrary. */
export const stackRows: string[][] = [
  [...(stack[0]?.items ?? []), ...(stack[6]?.items ?? [])],
  [...(stack[1]?.items ?? []), ...(stack[2]?.items ?? [])],
  [...(stack[3]?.items ?? []), ...(stack[4]?.items ?? []), ...(stack[5]?.items ?? [])],
];

export const stackCount = stack.reduce((total, group) => total + group.items.length, 0);

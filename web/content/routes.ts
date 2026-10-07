/** Public fixed routes, shared by the build and client metadata. */
export const ROUTE_META = {
  '/': { title: 'Meet Kapadia', description: 'Full-stack web apps, AI tooling and local-first systems, shipped end to end — from the Postgres schema to the last hover state. Selected work and case studies.' },
  '/projects': { title: 'Projects', description: 'Every project: AI tooling, hackathon builds, products, client work and earlier experiments.' },
  '/approach': { title: 'Approach', description: 'How I actually work: find the real problem, model the data first, ship the ugly version, then finish the seams.' },
  '/stats': { title: 'Stats', description: 'Contribution activity, problem-solving practice and what the shipping record actually looks like.' },
  '/contact': { title: 'Contact', description: 'Email, GitHub or LinkedIn — three ways to reach Meet Kapadia, and what each one is actually good for.' },
  '/about': { title: 'About', description: 'Meet Kapadia — a student building full-stack web apps, AI tooling and local-first systems in Bharuch, Gujarat.' },
  '/uses': { title: 'Uses', description: 'The editor, the machine and the tools behind the work — what I actually build with.' },
} as const;

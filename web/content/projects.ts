/* ─────────────────────────────────────────────────────────────────────────
   projects.js — the single source of truth for what's on this site.

   Everything derived from this file by build.mjs: the index's work rows and
   archive table, every NN/NN counter, the next-project chain, each page's
   title and meta description, the sitemap, and the build's own transform
   assertions. Adding a project is one object here plus (for a case study) a
   Case-<Name>-Organic.dc.html file — no counters to renumber by hand.

   Fields
     slug      URL name; the case page becomes <slug>.html
     tier      'case'    → full case study, listed under Selected Work
               'archive' → one compact row in the archive table
     pending   true → known about, not written yet; excluded from the build
               entirely so it can't ship as a broken link
     category  groups the work rows (case tier only)
     featured  true → also appears on the homepage. The homepage shows these
               five; /projects.html shows everything. Move the flag to change
               what leads.
     summary   the one-liner on the index row (~25 words, plain sentence)
     links     { repo, live, extra: [{ label, href }] } — all optional

   ORDER of the `projects` array is the order things appear.
   ───────────────────────────────────────────────────────────────────────── */

import type { Project } from './types';

export const CATEGORIES: readonly string[] = ['AI & tooling', 'Hackathons', 'Products', 'Client work', 'Earlier work'];

export const projects: Project[] = [
  /* ── AI & tooling ─────────────────────────────────────────────────────── */
  {
    slug: 'engram',
    featured: true,
    name: 'Engram',
    year: '2026',
    tier: 'case',
    category: 'Hackathons',
    tags: ['Platform', 'Python', 'AI infra'],
    summary:
      'A memory layer for AI agents — workspaces, a knowledge graph and cognitive re-ranking on top of Supermemory, with four SDKs and a 115-test suite.',
    title: 'Engram',
    desc: 'A self-hostable memory platform for AI agents: semantic search with cognitive re-ranking, an auto-built knowledge graph, multi-agent orchestration and a RAG context API, built on Supermemory Local.',
    links: {
      // TODO: confirm — is the repo public? Add the URL and it appears on the page.
    },
  },
  {
    slug: 'dealai',
    featured: true,
    name: 'DealAI Agent',
    year: '2026',
    tier: 'case',
    category: 'Hackathons',
    tags: ['Hackathon', 'Agents', 'Live demo'],
    // TODO: README says "we built this" — confirm solo or team, and fix the
    // Role line on the case page if it was a team.
    summary:
      'A sales agent that remembers every objection across a months-long deal cycle — memory and reasoning kept as separate layers, with a side-by-side view proving what the memory adds.',
    title: 'DealAI Agent',
    desc: 'A memory-grounded B2B sales agent built for HackBaroda: Vectorize Hindsight retains every objection and stakeholder across a deal, Groq synthesises the next move, and a compare view shows the difference memory makes.',
    links: {
      live: 'https://deal-intelligence-web.onrender.com/',
      liveNote: 'Free-tier hosting — the first request can take up to 60 seconds to wake the server.',
      repo: 'https://github.com/meetkapadia1710-tech/deal-intelligence-agent',
    },
  },
  {
    slug: 'repograde',
    featured: true,
    name: 'RepoGrade',
    year: '2026',
    tier: 'case',
    category: 'AI & tooling',
    tags: ['Full-stack', 'AI', 'Dev tools'],
    summary:
      "A GitHub tool that scores a repository and writes its README from the code that's actually there — Next.js app, browser extension, GitHub Action, Postgres/Drizzle, Gemini.",
    title: 'RepoGrade',
    desc: 'A GitHub tool that scores a repository and writes its README from the code that is actually there. Next.js, Postgres/Drizzle, a browser extension and a GitHub Action.',
    links: { live: 'https://repo-grade-web.vercel.app/' },
  },
  {
    slug: 'jarvis',
    name: 'J.A.R.V.I.S',
    year: '2026',
    tier: 'case',
    category: 'AI & tooling',
    // No links because there's nowhere to point yet — an offline-first voice
    // assistant living on one machine has no public URL by nature. "In
    // progress" says that plainly instead of the row implying it's finished
    // and simply undocumented.
    status: 'In progress',
    tags: ['Python', 'Voice AI', 'Offline-first'],
    summary:
      'An offline-first voice assistant for Windows with 29 tools, a swappable LLM brain, semantic memory and a live FastAPI/WebSocket dashboard.',
    title: 'J.A.R.V.I.S',
    desc: 'An offline-first voice assistant for Windows: 29 tools, a swappable LLM brain, semantic memory and a live FastAPI/WebSocket dashboard.',
    links: {},
  },
  {
    slug: 'ai-text-detector',
    featured: true,
    name: 'AI Text Detector',
    year: '2026',
    tier: 'case',
    category: 'AI & tooling',
    tags: ['ML', 'DeBERTa', 'Published model'],
    summary:
      'A fine-tuned DeBERTa-v3 classifier that separates AI-written text from human writing at 99.77% accuracy — published to Hugging Face with a live demo and an honest limitations section.',
    demo: {
      embed: 'https://meet-1710-ai-detector.static.hf.space',
      label: 'Hugging Face Space',
      note: 'The published model, running live. Paste your own writing and see the probability — bearing in mind everything in the limitations below: under about fifty words the answer is close to a coin flip.',
    },
    title: 'AI Text Detector',
    desc: 'A fine-tuned DeBERTa-v3-base classifier detecting AI-generated text at 99.77% accuracy and a 0.49% false positive rate, benchmarked against the RoBERTa-OpenAI baseline and published with a live demo.',
    links: {
      live: 'https://huggingface.co/spaces/Meet-1710/AI_Detector',
      extra: [{ label: 'Model card', href: 'https://huggingface.co/Meet-1710/ai-text-detector' }],
    },
  },
  {
    slug: 'hindsight',
    name: 'Hindsight',
    year: '2026',
    tier: 'case',
    // Deliberately excluded, not unfinished: it read as too similar next to
    // DealAI Agent on the homepage row — both hackathon builds anchored on
    // "memory" — and DealAI has a live demo and a public repo to click
    // through to, where Hindsight has neither. The case-study prose is kept
    // (cases.ts still has the full write-up); this only pulls it from the
    // build. Set pending: false to bring it back — e.g. if a live capture
    // demo or a public repo ever exists to point at.
    pending: true,
    category: 'Hackathons',
    tags: ['Hackathon', 'Local-first', 'OCR'],
    summary:
      'Photographic memory for your machine, 100% local. Window titles, clipboard, browser history and on-device screenshot OCR — never sent anywhere.',
    title: 'Hindsight',
    desc: 'Photographic memory for your machine, 100% local. Window titles, clipboard, browser history and on-device screenshot OCR that never leave the laptop.',
    links: {},
  },

  {
    slug: 'ambulance',
    name: 'Connected Ambulance',
    year: '2026',
    tier: 'case',
    category: 'Hackathons',
    tags: ['Team build', 'Healthcare', 'ML'],
    // TODO: which parts were yours? The page currently describes the system
    // rather than claiming any decision, which is accurate but generic — name
    // your piece and it can say so.
    summary:
      'A hackathon build: ambulance triage scored on-device, hospital matching, and pre-arrival data pushed to the ER — with store-and-forward buffering that survives losing the network.',
    demo: 'news2',
    title: 'Connected Ambulance',
    desc: 'An AI-assisted ambulance triage system built for the TCOE India hackathon: NEWS2 and a trained model score vitals at the edge, the system matches the nearest suitable hospital, and store-and-forward buffering carries readings across a network outage.',
    links: {},
  },

  /* ── Products ─────────────────────────────────────────────────────────── */
  {
    slug: 'locateme',
    featured: true,
    name: 'LocateMe',
    year: '2026',
    tier: 'case',
    category: 'Products',
    tags: ['React Native', 'Privacy', 'Realtime'],
    summary:
      'Family location sharing built the opposite way round — the child grants consent on their own device, always sees when sharing is on, and can pause or unlink it themselves.',
    title: 'LocateMe',
    desc: 'A consent-first family location app in React Native and Expo: server-side geofencing, battery-aware background tracking, and a child-side status screen that makes sharing impossible to hide.',
    links: {},
  },
  {
    slug: 'paymatrix',
    name: 'PayMatrix',
    year: '2026',
    tier: 'archive',
    // Deliberately excluded, not unfinished: the contribution here was the
    // bill-scanning idea, not the build — Harshil engineered it. Listing it as
    // your project would overstate it, and an archive row still invites a
    // question whose honest answer is "I suggested one feature". Set
    // pending: false to show it anyway.
    pending: true,
    tags: ['Collaboration', 'React', 'Firebase'],
    summary:
      'AI-powered expense splitting with direct UPI settlement — receipt scanning with Gemini, a debt-simplification engine, and push notifications, as a mobile-first PWA.',
    title: 'PayMatrix',
    desc: 'A mobile-first PWA for splitting shared expenses and settling over UPI, with Gemini receipt scanning and a greedy min-cash-flow debt simplification engine.',
    links: {},
  },
  {
    slug: 'playhub',
    name: 'PlayHub',
    year: '2025',
    tier: 'case',
    category: 'Products',
    // Live, but not finished — the leaderboard/gamification layer visible in
    // the screenshots (ranks, court hours, badges) isn't described anywhere
    // in the case study below. "In progress" is accurate, not decorative.
    status: 'In progress',
    tags: ['React Native', 'Payments', 'Cross-platform'],
    summary:
      'Turf booking for cricket and pickleball, built once with Expo and Capacitor. Razorpay payments, Google Wallet passes, and separate flows for customers, owners and admins.',
    title: 'PlayHub',
    desc: 'Turf booking for cricket and pickleball, built once with Expo and Capacitor. Razorpay payments, Google Wallet passes, three separate user flows.',
    links: { live: 'https://pickle-rage-booking-pi.vercel.app/' },
  },
  {
    slug: 'learnflex',
    name: 'LearnFlex',
    year: '2026',
    tier: 'case',
    category: 'Products',
    tags: ['Team of 5', 'Realtime', 'Postgres'],
    summary:
      'Exam prep for JEE, NEET and UPSC with quizzes, daily challenges and real-time 1v1 matches. I built Practice Mode; the schema was normalized to 3NF/BCNF.',
    title: 'LearnFlex',
    desc: 'Exam prep for JEE, NEET and UPSC with quizzes, daily challenges and real-time 1v1 matches. Built with a team of five on a 3NF/BCNF schema.',
    links: {},
  },

  /* ── Client work ──────────────────────────────────────────────────────── */
  {
    slug: 'bhumi-developers',
    name: 'Bhumi Developers',
    // TODO: confirm the delivery year.
    year: '2025',
    tier: 'case',
    category: 'Client work',
    tags: ['Paid work', 'Next.js', 'Real estate'],
    summary:
      'A marketing site for a real-estate developer building across Bharuch, Mumbai and Vadodara — the project portfolio lives in typed data, so the office adds a development without calling me.',
    title: 'Bhumi Developers',
    desc: 'A Next.js marketing site for a real-estate developer: residential, commercial and township projects in typed content files, smooth-scroll motion and a mobile-first image pipeline.',
    links: { live: 'https://www.bhumidevelopers.co.in/' },
  },
  {
    slug: 'bd-buildcon',
    name: 'BD Buildcon',
    // TODO: confirm the delivery year.
    year: '2025',
    tier: 'case',
    category: 'Client work',
    tags: ['Paid work', 'Next.js', 'GSAP'],
    summary:
      'A site for a turnkey industrial EPC contractor, built to answer due-diligence questions before the call — plant inventory, certifications and project history, all rendered from typed files.',
    title: 'BD Buildcon',
    desc: 'A Next.js marketing site for an industrial EPC contractor: plant and machinery inventory, certifications and project history in typed content files, with GSAP scroll choreography.',
    links: { live: 'https://bd-buildcon.vercel.app/' },
  },
  {
    slug: 'mann-loyalty',
    name: 'Mann Beauty Loyalty',
    // TODO: confirm the delivery year and add the live URL.
    year: '2026',
    tier: 'case',
    category: 'Client work',
    tags: ['Paid work', 'PWA', 'Firebase'],
    summary:
      "An installable loyalty app replacing a salon's paper punch card — phone-OTP sign-in, visible progress toward a free service, and a CRM the salon runs without me.",
    title: 'Mann Beauty Loyalty',
    desc: 'A customer loyalty PWA for a beauty studio: phone-OTP sign-in, visit tracking toward free services, and an admin CRM covering the client directory, birthdays and offer rules.',
    links: {},
  },
  {
    slug: 'mann-attendance',
    name: 'Mann Beauty Attendance',
    // TODO: confirm the delivery year. Internal staff tool — check whether it
    // has a public URL at all before adding one.
    year: '2026',
    tier: 'case',
    category: 'Client work',
    tags: ['Paid work', 'React', 'Firestore'],
    summary:
      'The staff attendance tool that took a salon off paper: a live grid every device shares, monthly totals per staff member, and a CSV export shaped for payroll.',
    title: 'Mann Beauty Attendance',
    desc: 'A staff attendance manager for a beauty studio: a real-time Firestore grid, automatic monthly hour totals per staff member, and CSV export for payroll.',
    links: {},
  },
  {
    slug: 'meetos',
    name: 'MeetOS',
    year: '2025',
    tier: 'case',
    category: 'AI & tooling',
    tags: ['React', 'UI', 'Interface study'],
    summary: 'A portfolio built as a macOS-style desktop — draggable windows, a dock, and a file system you can actually browse.',
    title: 'MeetOS',
    desc: 'A portfolio rebuilt as a desktop operating system in the browser: a window manager with z-order and focus, a magnifying dock, and a virtual file system the content is served from.',
    links: { live: 'https://meetdevos.vercel.app/' },
  },
  {
    slug: 'mini-resume',
    name: 'Mini Resume',
    year: '2025',
    tier: 'case',
    category: 'Earlier work',
    tags: ['React', 'Bento', 'Single page'],
    summary: 'An earlier single-page resume portfolio: a bento grid where every tile is a different shape of information, with a live GitHub heatmap.',
    title: 'Mini Resume',
    desc: 'A single-screen bento-grid resume: each tile carries a different kind of information at a different density, with a live GitHub contribution heatmap pulled at load.',
    links: { live: 'https://miniresumemeet.vercel.app' },
  },
  {
    slug: 'transitops',
    name: 'TransitOps',
    year: '2025',
    tier: 'case',
    category: 'Hackathons',
    tags: ['Hackathon', 'Team of 4', 'Full-stack'],
    summary:
      'A fleet operations platform built in an 8-hour hackathon — vehicles, drivers, trip dispatch and maintenance, with the business rules enforced in the state machine. I worked across frontend and backend.',
    title: 'TransitOps',
    desc: 'A fleet operations platform built in an eight-hour hackathon: vehicles, drivers, trip dispatch and maintenance schedules, with the rules that matter enforced as state transitions rather than as form validation.',
    links: {},
  },
  {
    slug: 'stayfinder',
    name: 'Airbnb clone',
    year: '2025',
    tier: 'case',
    category: 'Earlier work',
    tags: ['Node', 'MongoDB', 'Payments'],
    summary:
      'A solo full-stack booking site: Passport auth with Google OAuth, Stripe payments, Cloudinary uploads and real-time messaging over Socket.io.',
    title: 'Airbnb clone',
    desc: 'A full-stack booking site built solo to learn the whole stack at once: Passport sessions with Google OAuth, Stripe checkout, Cloudinary uploads and Socket.io messaging between guest and host.',
    links: {},
  },
  {
    slug: 'refractor',
    name: 'ReFractor.ai',
    year: '2026',
    tier: 'case',
    category: 'AI & tooling',
    status: 'In progress',
    // 'In progress' used to also be duplicated into a tag, because WorkRow
    // (case-tier rows) didn't render `status` yet — only PlainRow did. Now
    // that WorkRow shows the badge too (see components/WorkRow.tsx), the tag
    // duplicate is gone; `status` alone carries it.
    tags: ['Vite', 'Supabase'],
    summary: 'A site analysis tool, early days — the core infrastructure and the analysis routes are in, the scoring is not.',
    title: 'ReFractor.ai',
    desc: 'A site analysis tool in progress: the Supabase schema, auth and analysis routes are working end to end; the scoring model that turns a crawl into advice is the part still being built.',
    links: {},
  },
];

/* Case studies come out grouped by category, because that is the order the
   projects page renders them in — and the NN/NN counter on a row has to match
   the one on the case study it opens. Sort is stable, so the order inside a
   category is still the order of the array above. */
const CATEGORY_RANK = new Map(CATEGORIES.map((name, i) => [name, i]));

export const caseStudies: Project[] = projects
  .filter((p) => p.tier === 'case' && !p.pending)
  .sort((a, b) => (CATEGORY_RANK.get(a.category ?? '') ?? 99) - (CATEGORY_RANK.get(b.category ?? '') ?? 99));
export const featured: Project[] = caseStudies.filter((p) => p.featured);
export const archive: Project[] = projects.filter((p) => p.tier === 'archive' && !p.pending);
export const pending: Project[] = projects.filter((p) => p.pending);

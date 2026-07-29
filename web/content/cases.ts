/* ─────────────────────────────────────────────────────────────────────────
   cases.ts — the prose of every case study, extracted from the original
   design-canvas sources.

   The structure is identical across all ten, so one <CasePage> renders them
   all: the shell, facts sidebar, cards, figures and closing two-up come from
   here, and everything else (tags, links, year, the next-project chain) is
   already in projects.ts.
   ───────────────────────────────────────────────────────────────────────── */

export interface HowCard {
  title: string;
  body: string;
}

import type { FigureImage } from '../components/Figure';

export interface CaseContent {
  heroFigure: string;
  /** Drop a file in web/public/images and point at it to replace the
   *  placeholder. The caption above stays as the fallback. */
  heroImage?: FigureImage;
  problem: { heading: string; paras: string[] };
  facts: { role: string; year: string; stack: string; surfaces: string };
  how: HowCard[];
  figures: [string, string];
  figureImages?: [FigureImage?, FigureImage?];
  /** Anything beyond the hero and the two-up. Rendered as a strip after the
   *  figures, so a project with five good screenshots does not have to throw
   *  three of them away to fit a fixed layout. */
  gallery?: FigureImage[];
  hard: string[];
  nextKicker: string;
  next: string[];
}

export const cases: Record<string, CaseContent> = {
  'bhumi-developers': {
    heroFigure: 'bhumi developers — project portfolio',
    heroImage: { src: '/Bhumi-Developers/MainScreen.webp', alt: 'The Bhumi Developers homepage, dark with a full-bleed architectural render', width: 1600, height: 784 },
    figureImages: [
      { src: '/Bhumi-Developers/MinorScreen2.webp', alt: 'A project entry for Solitaire Pallazzo — an ONGOING status badge, location, and a render of the residential tower', width: 1600, height: 785 },
      { src: '/Bhumi-Developers/AboutSectionScreen.webp', alt: 'The about section of the Bhumi Developers site', width: 1600, height: 785 },
    ],
    gallery: [
      { src: '/Bhumi-Developers/MinorScreen1.webp', alt: '"Creating Landmarks. Building Trust." beside a night render of the Central Square commercial development', width: 1600, height: 796 },
    ],
    problem: {
      heading: 'Buyers judge a developer on the last photograph they saw.',
      paras: [
        'Property is sold on trust, and most of that trust is built before anyone picks up a phone. The site had to carry residential, commercial and township developments across three cities, look like the work is worth the money, and survive being opened on mobile data outside a site office.',
        'The other requirement was quieter and mattered more: the office needed to add a completed project, change a status or swap a photograph without me. A marketing site that needs a developer for every update stops being updated.',
      ],
    },
    facts: {
      role: 'Solo — design & build',
      year: '2025',
      stack: 'Next.js (App Router) · React 19 · TypeScript · Tailwind v4 · Framer Motion · Lenis',
      surfaces: 'Marketing site',
    },
    how: [
      { title: 'Projects as data, not pages', body: 'Every development — name, location, status, gallery, brochure — is an object in a typed file. Adding one is an entry, not a template, so whoever updates it never opens a component.' },
      { title: 'Motion with a budget', body: 'Lenis for the scroll itself and Framer Motion for reveals, kept to transform and opacity so a mid-range Android holds its frame rate through a full-bleed gallery.' },
      { title: 'Phone first, genuinely', body: 'Next\'s image pipeline for every photograph, video deferred on small screens rather than shipped and hidden, and touch targets sized for thumbs. Core Web Vitals tracked with Speed Insights instead of assumed.' },
      { title: 'Findable', body: 'Full metadata and structured data on every project, because a developer\'s own site competes for its own name against the listing portals.' },
    ],
    figures: ['project entry with live status', 'about section'],
    hard: [
      'The photographs are the product, and photographs are heavy. A hero video makes a development feel real and also costs several megabytes before anything useful renders — on exactly the connection most buyers arrive on. The resolution was to treat small screens as a different design rather than a narrower one: the video is not requested there at all, and the still it would have covered does the work instead.',
    ],
    nextKicker: 'Where it stands',
    next: [
      'Live, and being updated by the office rather than by me, which was the actual brief. The remaining work is content — more completed projects, better photography — rather than code.',
    ],
  },
  'bd-buildcon': {
    heroFigure: 'bd buildcon — plant and machinery',
    heroImage: { src: '/bd-buildcon/MainScreen.webp', alt: 'The BD Buildcon homepage', width: 1600, height: 759 },
    figureImages: [
      { src: '/bd-buildcon/MinorPage1.webp', alt: 'The safety and quality page: "35 years. 0 Fatalities." over a site photograph, with ISO certification and PPE compliance figures', width: 1600, height: 757 },
      { src: '/bd-buildcon/3D_AnimationScreen.webp', alt: 'The scroll-driven build process: an isometric 3D model of a tower at 100% built, beside the commissioning and handover phase', width: 1600, height: 713 },
    ],
    problem: {
      heading: 'An EPC contractor is hired on evidence, not adjectives.',
      paras: [
        'Industrial clients do not shortlist a turnkey contractor because the copy is confident. They want the plant list, the certifications, the safety record and the projects already delivered in their sector — and they want them before the first call, because the call is the shortlist.',
        'So the site is closer to a reference document than a brochure. Its job is to answer due-diligence questions in the order a procurement team asks them.',
      ],
    },
    facts: {
      role: 'Solo — design & build',
      year: '2025',
      stack: 'Next.js 14 · TypeScript · Tailwind · GSAP + ScrollTrigger · Lenis · Framer Motion',
      surfaces: 'Marketing site',
    },
    how: [
      { title: 'Evidence in typed files', body: 'Projects, machinery, equipment, certifications, clients and testimonials are each a typed content file. The tables and galleries render from them, so updating the fleet is editing a list.' },
      { title: 'Scroll choreography', body: 'GSAP with ScrollTrigger for reveals, parallax and count-ups, Lenis for the scroll itself, and a motion layer of small reusable components rather than per-section one-offs.' },
      { title: 'A gallery that behaves', body: 'The plant gallery needed real work: images were squashing under the wrong object-fit, and the modal fought the smooth-scroll library for the wheel until both were given explicit scroll locks.' },
      { title: 'Images that do not cost the visit', body: 'Every raster asset converted to WebP with deliberate weight budgets — heavier above the fold, much lighter for thumbnails.' },
    ],
    figures: ['safety and quality record', 'the build process in 3D'],
    hard: [
      'Smooth scrolling and modals are natural enemies. Lenis takes over the wheel to animate the page, a lightbox needs the wheel to scroll its own content, and the result is a modal that either will not scroll or scrolls the page behind it. Fixing it meant being explicit about which element owns the gesture at any moment rather than hoping two libraries would negotiate.',
    ],
    nextKicker: 'Where it stands',
    next: [
      'Live. The one honest gap is the contact form: it validates properly and then posts to a stub. The handler is written and waiting on a mail-provider key, and until that is wired an enquiry does not reach anyone. It is the first thing to finish.',
    ],
  },
  'mann-loyalty': {
    heroFigure: 'mann beauty — loyalty card and progress',
    problem: {
      heading: 'The loyalty scheme worked. The paper card did not.',
      paras: [
        'Buy three hair spas, get the fourth free. A good offer, tracked on a card the customer had to keep in a purse for months — so it got lost, and staff ended up taking someone\'s word for how many visits they had. The scheme was fine; the medium was the problem.',
        'Replacing it meant modelling the rules the counter already used, including the awkward ones, rather than a tidier version I preferred. A system that contradicts the person at the till gets abandoned inside a week.',
      ],
    },
    facts: {
      role: 'Solo — design & build',
      year: '2026',
      stack: 'React 19 · Vite · Tailwind v4 · Framer Motion · Firebase (Firestore + Auth) · vite-plugin-pwa',
      surfaces: 'Installable PWA · Admin CRM',
    },
    how: [
      { title: 'Sign in with a phone number', body: 'OTP through Firebase Auth. No password to forget and no email nobody checks — the phone number the salon already has on file is the account.' },
      { title: 'Progress you can see', body: 'A card per active offer showing visits banked against visits needed, so the answer to "how many more?" is on screen instead of in a drawer.' },
      { title: 'It installs', body: 'A real PWA: home-screen icon, splash, offline shell. A loyalty app that lives in a browser tab is a loyalty app nobody opens twice.' },
      { title: 'A CRM the salon runs', body: 'Behind it: the client directory, a per-customer inspector for adding a visit or redeeming a reward, birthday alerts for the week ahead, and full control over offers and thresholds — no deploy needed to change the deal.' },
    ],
    figures: ['rewards tab', 'admin client inspector'],
    hard: [
      'Deciding what not to build. A booking system was the obvious next feature and the wrong one: appointments already run through WhatsApp, where the customers and the staff both already are, so the app deep-links into that conversation rather than replacing it. Directions hand off to Google Maps for the same reason. Every part I did not write is a part the salon can get help with without me.',
    ],
    nextKicker: 'Where it stands',
    next: [
      'In use, with the salon changing its own offers. The next piece of work is on the staff side rather than the customer side: the admin surface is scoped to a single location, and serving more than one would need proper roles behind it first.',
    ],
  },
  'mann-attendance': {
    heroFigure: 'mann beauty — monthly attendance grid',
    problem: {
      heading: 'Payroll ran on a notebook.',
      paras: [
        'Staff hours were written down through the month and added up by hand at the end of it. That works until someone is off, or covers a shift, or the notebook is at the other counter — and then the total that decides what people get paid depends on whoever is holding the pen.',
        'The replacement had to be faster than the notebook on day one, or it would lose to the notebook. That ruled out anything with a learning curve.',
      ],
    },
    facts: {
      role: 'Solo — design & build',
      year: '2026',
      stack: 'React 19 · TypeScript · Vite · Tailwind v4 · Zustand · Firebase Firestore',
      surfaces: 'Web app',
    },
    how: [
      { title: 'A grid shaped like the thing it replaced', body: 'Staff down the side, days across the top, grouped by month. It reads like the sheet it stands in for, which is the entire reason it got adopted.' },
      { title: 'Live on every device', body: 'Firestore keeps the grid in sync, so a change made at the front counter is on the manager\'s phone without a refresh or a question.' },
      { title: 'Totals that compute themselves', body: 'Hours per staff member and across the studio for any month, calculated rather than added up — which is where the notebook actually went wrong.' },
      { title: 'Export in the shape payroll wants', body: 'Any month goes out as a CSV formatted for the process that already exists, instead of asking the person doing payroll to change how they work.' },
    ],
    figures: ['monthly summary', 'CSV export'],
    hard: [
      'Month boundaries are where this kind of tool quietly breaks: a shift crossing midnight, a correction made in April to a March total, someone joining mid-month. Getting the totals right meant deciding those cases explicitly with the person who runs payroll, rather than picking whatever the date library made easiest.',
    ],
    nextKicker: 'Where it stands',
    next: [
      'Running, and the notebook is gone. It is built for one studio and one manager; access control is the piece that would need rethinking before it served several, and that is a deliberate limit rather than an oversight.',
    ],
  },
  'engram': {
    heroFigure: 'engram — knowledge graph, full width',
    problem: {
      heading: 'A vector database isn\'t memory. It\'s search with extra steps.',
      paras: [
        'Every agent I built hit the same wall. The model is stateless, so each session starts from zero, and the usual fix — throw the transcript into a vector store and retrieve the nearest chunks — gives you similarity and nothing else. It has no idea what matters, what\'s stale, or that two conversations six weeks apart were about the same project.',
        'Memory needs more than nearest-neighbour lookup. It needs importance, decay, relationships between the things it stored, and a way to hand an LLM a context block that fits in the budget it actually has. Engram is the layer that adds all of that on top of storage, rather than another store competing with the ones that already work.',
      ],
    },
    facts: {
      role: 'Solo — architecture & development',
      year: '2026',
      stack: 'Python · FastAPI · Supermemory · Postgres · Next.js 15 · Go',
      surfaces: 'REST API · Web dashboard · CLI · SDKs in Python, TypeScript and Go',
    },
    how: [
      { title: 'Ingest properly', body: 'Every memory runs one pipeline: clean, chunk on paragraph boundaries, embed, pull keywords and entities, then score importance. Nothing is stored as an undifferentiated blob.' },
      { title: 'Store it twice, deliberately', body: 'Supermemory holds the durable, semantically searchable content. A local mirror owns entity identity, relationships and access signals — the things the graph and the ranking depend on.' },
      { title: 'Rank cognitively', body: 'Raw similarity is only 42% of the score. Importance, recency decay, access frequency and graph centrality make up the rest, and every weight is an environment variable rather than a magic number in the source.' },
      { title: 'Hand back a context block', body: 'One call to /v1/context returns a cited, token-budgeted block ready to paste into a prompt — so consuming Engram from an agent is a single HTTP request, not an integration project.' },
    ],
    figures: ['search — ranking breakdown', 'memory timeline'],
    hard: [
      'Deciding what each store owns. Putting everything in Supermemory made the graph and the ranking hostage to a network call; putting everything local threw away the semantic search I was building on. The split I landed on is that Supermemory owns content and candidate discovery, and the local mirror owns identity and signals — so listing, graphs and analytics stay correct even when Supermemory is unreachable.',
      'The bugs that actually cost me time came from the real API rather than the documented one. Indexing is asynchronous, so deleting a document seconds after creating it returns a 409 saying it\'s still processing. A mock would have passed forever. Every fix in the repo starts from a test written against a live instance, which is also how I found the metadata schema rejecting nested arrays — entities are flattened to name::kind strings because of it.',
    ],
    nextKicker: 'What I\'d do next',
    next: [
      'The evaluation engine reports NDCG against baseline semantic search, but I\'ve only run it on workspaces I seeded myself. The honest next step is a real corpus and a published number, because "cognitive re-ranking improves retrieval" is a claim, not a result, until someone else can reproduce it.',
      'After that: replacing the 256-dimension hash embedding fallback with a real local model so the default install is good rather than merely functional, and a hosted multi-tenant mode so using it doesn\'t require running two services first.',
    ],
  },
  'dealai': {
    heroFigure: 'dealai — agent reasoning, full width',
    problem: {
      heading: 'A stateless assistant gives confident advice about a deal it has never heard of.',
      paras: [
        'A B2B deal runs for months across a dozen calls and several stakeholders who each want something different. Four weeks later nobody remembers that it was the procurement lead specifically who objected to the markup, or what she asked for instead. Reps leave, and their context leaves with them.',
        'Pointing a chatbot at the problem makes it worse. Ask a stateless model what to do next and it tells you to be polite and consider a discount — advice that sounds authoritative and is worth nothing, because it is about no deal in particular. The whole build rests on one claim: memory is what turns generic advice into a specific next move.',
      ],
    },
    facts: {
      role: 'Built for HackBaroda',
      year: '2026',
      stack: 'React 18 · TypeScript · Express · Prisma/SQLite · Groq · Vectorize Hindsight · Clerk',
      surfaces: 'Web app · REST API',
    },
    how: [
      { title: 'Split memory from reasoning', body: 'Vectorize Hindsight retains the facts and recalls them semantically; Groq runs llama-3.3-70b over what comes back. Two layers doing one job each, rather than one model asked to do both badly.' },
      { title: 'Log every interaction', body: 'Transcripts and notes go into the memory bank against the deal they belong to, so context accumulates across the whole cycle instead of evaporating between calls.' },
      { title: 'Answer with names in it', body: 'The agent does not say "address their pricing concerns". It says which stakeholder objected, to what, on which call, and what they asked for instead — because that is what came back from memory.' },
      { title: 'Prove the difference', body: 'A compare endpoint runs the same question twice, with recall and without, and puts both answers side by side. The value of the memory layer is demonstrated on screen rather than asserted in a pitch.' },
    ],
    figures: ['memory compare — with and without recall', 'objection velocity over a deal cycle'],
    hard: [
      'Making the argument land in sixty seconds. A judge will not sit through a setup, so the demo cannot depend on one: a single seed call populates both the database and the memory bank with realistic transcripts, and the compare view is one tab from the login. If the memory-grounded answer is not visibly more specific than the naked one, the entire project has failed — so that comparison is the first thing anyone sees, not the last.',
      'The other problem was resisting the temptation to let the model summarise its way out of a thin recall. When nothing useful comes back from memory, the honest output is a thinner answer — an agent that invents a stakeholder objection is far worse than one that admits it has not heard this deal discussed before.',
    ],
    nextKicker: 'What I\'d do next',
    next: [
      'Recall quality is currently taken on trust. I would want to measure it — how often the right prior objection actually surfaces for a given question — before claiming the memory layer works rather than merely runs.',
      'Then cross-deal patterns: knowing an objection shows up in forty per cent of deals in a segment is worth more to a sales team than remembering one deal perfectly. And hosting that does not spend the first minute waking up.',
    ],
  },
  'repograde': {
    heroImage: { src: '/repoGrade/MainScreen.webp', alt: 'The RepoGrade landing page: a field to paste a GitHub repository, and the six scoring dimensions — documentation, tests and CI, structure, maintenance, discoverability and hygiene', width: 1600, height: 765 },
    /* The analysis, history and my-repos screenshots all show other people's
       GitHub handles next to failing grades. Not shipping those — see
       STATUS.md. Everything below is the placeholder treatment. */
    heroFigure: 'repograde - score screen, full width',
    problem: {
      heading: 'Nobody writes the README, and nobody trusts the ones that exist.',
      paras: [
        'Every developer has shipped a repo with a three-line README and a TODO. The docs drift from the code within a week, so the one file a stranger reads first is the least reliable thing in the project. Existing generators make this worse — they template from the package manifest and produce something confident and wrong.',
        'I wanted the opposite: a tool that reads the actual source, tells you honestly how legible your repo is to an outsider, and then writes documentation grounded in what it found.',
      ],
    },
    facts: {
      role: 'Solo — design & development',
      year: '2026',
      stack: 'Turborepo · Next.js · TypeScript · Postgres · Drizzle · Gemini API',
      surfaces: 'Web app · Browser extension · GitHub Action',
    },
    how: [
      { title: 'Read the codebase', body: 'Walks the tree, identifies entry points, config, tests and dead weight, and builds a picture of the project from source rather than from the manifest.' },
      { title: 'Score it', body: 'Grades legibility for a newcomer — structure, documentation coverage, test presence, dependency hygiene — and shows where the points were lost, not just the total.' },
      { title: 'Write the README', body: 'Generates documentation grounded in what the scan actually found, so the install steps match the real scripts and the feature list matches the real modules.' },
      { title: 'Keep it honest', body: 'The GitHub Action re-scores on every push, so the grade decays visibly when the code and the docs drift apart again.' },
    ],
    /* Deliberately still placeholders. The My Repos, History and analysis
       screenshots all show other people's GitHub accounts — Marshmellow31,
       Kinnariii — beside grades of D and F, plus the names of private
       repositories. Publishing a public page that grades named third parties
       as failures is not something to do without their say-so, and the point
       of the tool survives fine on the landing page alone. Replace these with
       a scan of a well-known public repo, or of Meet's own. */
    figures: ['score breakdown for a repository', 'analysis history'],
    hard: [
      'Three surfaces — web app, extension and Action — needed to agree on what a "score" means. That\'s what pushed it into a Turborepo monorepo with one shared core and one Drizzle schema: scoring logic lives in exactly one place, and all three clients are thin.',
      'The other one was keeping the model honest. Generation is grounded strictly in the scan output, so it can\'t invent a feature the repo doesn\'t have — the constraint that makes the output usable.',
    ],
    nextKicker: 'What I\'d do next',
    next: [
      'Team-level scoring across an org\'s repos, a shared rubric so scores compare like for like, and PR-time suggestions instead of a post-hoc grade.',
    ],
  },
  'jarvis': {
    heroFigure: 'jarvis — live dashboard, full width',
    problem: {
      heading: 'Every voice assistant stops being useful the moment the wifi drops.',
      paras: [
        'The assistants on my machine were thin clients for someone else\'s server. No connection meant no assistant, and everything I said went to a company I had to trust. For something that sits always-on next to my work, both of those were the wrong trade.',
        'So I built one that runs locally by default, can reach for a hosted model when it genuinely helps, and keeps its memory on my disk either way.',
      ],
    },
    facts: {
      role: 'Solo — architecture & development',
      year: '2026',
      stack: 'Python · FastAPI · WebSockets · Groq / Ollama / Claude / OpenAI / Gemini · vector memory',
      surfaces: '',
    },
    how: [
      { title: 'Swappable brain', body: 'One interface, five backends — Groq, Ollama, Claude, OpenAI, Gemini. Ollama keeps it working with no network at all; the others get used when the task is worth the round trip.' },
      { title: '29 tools', body: 'File operations, app control, search, system state and more, each described to the model so it can pick the right one instead of guessing at freeform commands.' },
      { title: 'Semantic memory', body: 'Conversations and facts are embedded and stored locally, so it recalls by meaning rather than exact phrasing — and the recall survives restarts.' },
      { title: 'Live dashboard', body: 'A FastAPI service streams state over WebSockets: what it heard, which tool it chose, what the model returned. Debugging a voice agent without this is guesswork.' },
    ],
    figures: ['tool call trace', 'memory browser'],
    hard: [
      'Tool dispatch was the real work. A model that can call 29 things will call the wrong one confidently, so each tool needed a tight description, strict argument validation, and a failure path that reports back instead of dying silently.',
      'Latency was the other. Local models are slower, so the pipeline overlaps transcription, planning and speech instead of running them in sequence — it has to feel like an answer, not a batch job.',
    ],
    nextKicker: 'What I\'d do next',
    next: [
      'Wake-word detection running fully on-device, a smaller quantised default model, and letting it observe context so I can stop stating what it could already see.',
    ],
  },
  'ai-text-detector': {
    heroImage: { src: '/AI_TextDetector/MainScreen.webp', alt: 'The AI Text Detector running as a Hugging Face Space: a text area, an analyse button, two example buttons, and a note that results under fifty words are unreliable', width: 1600, height: 792 },
    heroFigure: 'the live demo — text in, probability out',
    problem: {
      heading: 'People are being accused by tools nobody has benchmarked.',
      paras: [
        'AI detectors are being used to make decisions about students, and almost none of them publish a number you can check. I wanted to find out how good the public baseline actually was, so I ran OpenAI\'s RoBERTa detector against a held-out set of 3,000 human and ChatGPT answers.',
        'It labelled everything human. 48.1% accuracy, an F1 of zero on the AI class — a perfect false-positive rate achieved by never making a positive prediction. That\'s the tool sitting behind a lot of confident assertions, so I fine-tuned my own and published the benchmark alongside it.',
      ],
    },
    facts: {
      role: 'Solo — architecture & development',
      year: '2026',
      stack: 'PyTorch · Transformers · DeBERTa-v3-base · HC3 · Colab T4',
      surfaces: 'Hugging Face model · Live Space demo · Colab notebook',
    },
    how: [
      { title: 'Split the data honestly', body: 'HC3 — human answers against ChatGPT answers across several domains — split 80/10/10 by sample with a fixed seed, so the test set is never something the model has already seen.' },
      { title: 'Fine-tune the base', body: 'DeBERTa-v3-base with a binary classification head. Two epochs at a learning rate of 2e-5, batch size 16, fp16 mixed precision — about 45 minutes on a single T4.' },
      { title: 'Benchmark against the baseline', body: '3,000 held-out samples, balanced. AUROC 1.0000 against the RoBERTa detector\'s 0.6724; 99.77% accuracy against 48.10%; a 0.49% false positive rate on human writing.' },
      { title: 'Publish it, limitations included', body: 'Model card, a live Space anyone can paste text into, the training notebook, and a limitations section that says plainly what the number does and doesn\'t mean.' },
    ],
    figures: ['benchmark — this model vs the baseline', 'robustness probes — where it fails'],
    hard: [
      'Not the training — that was 45 minutes. The hard part was resisting the number. An AUROC of exactly 1.0000 is not a triumph, it\'s a warning: it means the test set is drawn from the same distribution as the training set, and the honest reading is "this model separates 2022 ChatGPT from HC3 humans", not "this model detects AI".',
      'So I went looking for the failures instead. Text under fifty words returns roughly 0.54 — a coin flip dressed up as a probability. It\'s untested against dedicated paraphrasing tools, which is exactly where detectors are known to collapse. And false positives on non-native English writing are a documented industry harm; my early tests look clean, but "looks clean" is not an evaluation. All of that is on the model card, above the benchmark table.',
    ],
    nextKicker: 'What I\'d do next',
    next: [
      'A proper out-of-distribution evaluation: current-generation model output, other domains, and a systematic ESL set rather than a handful of samples I picked myself. The number that matters isn\'t the one on the data I trained against.',
      'And an adversarial pass against the humanizer tools people actually use. If the model can\'t survive a round-trip through a paraphraser, that belongs on the model card too — a detector that quietly fails is worse than no detector, because someone will act on it.',
    ],
  },
  'hindsight': {
    heroFigure: 'hindsight — capture timeline, full width',
    problem: {
      heading: 'You read the answer three days ago. Good luck finding it.',
      paras: [
        'The thing you need is almost always something you already looked at — a tab, a message, a snippet on a screen you closed. Browser history is too shallow to help, and the tools that solve this properly do it by shipping your screen to a server.',
        'Built for the Supermemory localhost:6767 hackathon, Hindsight takes the opposite position: capture aggressively, process on-device, send nothing.',
      ],
    },
    facts: {
      role: 'Solo — hackathon build',
      year: '2026',
      stack: 'Python · on-device OCR · local index · Windows APIs',
      surfaces: '',
    },
    how: [
      { title: 'Capture quietly', body: 'Window titles, clipboard contents and browser history are collected continuously in the background, at a cost low enough to leave running all day.' },
      { title: 'Read the screen', body: 'Periodic screenshots go through OCR on the device, turning pixels you glanced at into text you can search.' },
      { title: 'Search by memory', body: 'Query the way you actually remember — roughly, by topic and by rough time — rather than by the exact title of a window you closed.' },
      { title: 'Nothing leaves', body: 'No accounts, no sync, no telemetry. The index is a local file, and deleting it is the whole uninstall story.' },
    ],
    figures: ['ocr search results', 'local index settings'],
    hard: [
      'Volume. Screenshot OCR at any useful frequency produces a lot of low-value text, so the pipeline dedupes near-identical frames and skips captures when the foreground window has not changed — otherwise the index drowns in its own noise.',
      'Staying inside the hackathon window meant being ruthless: capture and search shipped, and the nicer UI did not. The thin path had to work end to end first.',
    ],
    nextKicker: 'What I\'d do next',
    next: [
      'Semantic search over the OCR text instead of keyword matching, per-app capture rules, and encryption at rest so the convenience does not become its own risk.',
    ],
  },
  'ambulance': {
    heroFigure: 'paramedic view — severity, vitals and destination',
    problem: {
      heading: 'The patient deteriorates in transit, and the hospital finds out when the doors open.',
      paras: [
        'An ambulance is the one place in the chain where a patient is monitored continuously and nobody downstream can see it. The crew watches the vitals; the emergency department preparing the bay does not. By the time a handover happens verbally at the door, the twenty minutes of trend that would have told them what was coming has already gone.',
        'The obvious fix — stream it to the cloud — fails on the one road where it matters. Connectivity in a moving vehicle is intermittent by nature, and a triage system that stops triaging when the signal drops is worse than none, because it fails exactly when the patient is furthest from help. So the scoring had to happen on board, and the network had to be treated as something that will disappear rather than something that might.',
      ],
    },
    facts: {
      role: 'Team build — TCOE India hackathon',
      year: '2026',
      stack: 'FastAPI · scikit-learn · SQLAlchemy · React 18 · WebSockets · Docker',
      surfaces: 'Paramedic tablet (PWA) · Hospital ER dashboard · Dispatcher console',
    },
    how: [
      { title: 'Score at the edge', body: 'Vitals arrive every two seconds and are scored in-process — a gradient-boosted model with the NEWS2 early-warning score behind it as a fallback. Neither does any I/O, so triage has no network dependency to lose.' },
      { title: 'Buffer, never drop', body: 'When the uplink dies, readings queue on board and the tier keeps updating. On restore the buffer replays in capture order — and the test suite asserts the sequence numbers are contiguous across the gap, which is what makes "zero data loss" a fact rather than a claim.' },
      { title: 'Match on capability, not distance', body: 'Hospitals are ranked on specialty fit and centre level against the patient acuity first, then distance, then free beds. Forty real facilities from OpenStreetMap, each candidate carrying the reasons it was chosen so the crew can see the argument and override it.' },
      { title: 'Arrive already expected', body: 'On confirmation the receiving hospital gets the tier, the full score breakdown, the trend history, a live ETA, and a preparation checklist generated from the actual vitals — the intubation trolley appears because oxygen saturation is scoring three, and it says so.' },
    ],
    figures: ['model vs NEWS2 baseline, side by side', 'hospital ER — inbound queue and readiness'],
    hard: [
      'Justifying the model at all. Label your training data with NEWS2, then feed NEWS2 sub-scores in as features, and you have spent a week rebuilding a lookup table. Two things break the circle: labels come from each synthetic patient’s true physiological state while the model only ever sees a noisy measurement of it, so its real job is surviving sensor error; and the labels encode two interactions the score cannot express — shock index, and silent hypoxia, where a low saturation with a normal respiratory rate is dangerous precisely because the body has stopped responding. On those conflicting cases the model is right 53% of the time against the rules’ 8%. That gap is the entire argument for the model; without it, the rules alone would have been the right call.',
      'The second was learning to distrust it — and the fix is the part worth reading. Version 1.0.0 scored a patient responding only to voice, with every other vital normal, as Stable — at 0.73 confidence — because the training data had never shown it impaired consciousness on its own. The fix was three-layered: new training cases for that slice, a decision threshold tuned for recall on the Critical class rather than overall accuracy, and a hard floor that lets the model escalate above the rules but never below a NEWS2 red score. The trainer now refuses to save a model whose Critical recall drops under 0.95. Over-triage costs a resus bay; the other error costs something else.',
    ],
    nextKicker: 'Where it stands',
    next: [
      'Every patient in this system is synthetic. The model has never seen a real one, so its numbers describe a generated distribution and nothing else — real use would mean retraining on ethically obtained clinical data and prospective validation, and it is not a medical device until that happens. That sentence is in the repository, not just here.',
      'The nearer work is the weakest tier: Urgent sits in a two-point band between two large classes and its precision is about 0.65. Most of its errors are one step, and only ten of 1,287 Critical patients fell as far as Stable — but a narrow middle band is where a triage tool is least useful, and that is the number worth moving next.',
    ],
  },
  'locateme': {
    heroFigure: 'locateme — parent map dashboard',
    problem: {
      heading: 'Most family trackers are surveillance tools that happen to have a nice map.',
      paras: [
        'The category is full of apps built entirely for the parent, where the child is cargo — installed quietly, hidden from the app drawer, designed so the person being tracked never thinks about it. They work right up until they are discovered, and then they detonate whatever trust the family had.',
        'So I took the opposite constraint as the starting point: nothing about this app is allowed to be hidden from the person being located. The child grants the permission on their own device, a status screen always says whether sharing is on, and they can pause or unlink without asking anyone. Every feature had to survive that rule, and a few obvious ones did not.',
      ],
    },
    facts: {
      role: 'Solo — design & development',
      year: '2026',
      stack: 'React Native · Expo SDK 50 · TypeScript · Zustand · Firebase · React Native Maps',
      surfaces: 'iOS · Android',
    },
    how: [
      { title: 'Consent, on the child\'s device', body: 'The child joins with a single-use invite code, grants the permission themselves, and gets a screen that states plainly whether location is being shared right now. Pausing and unlinking are theirs to do.' },
      { title: 'Track without killing the battery', body: 'Background updates every five minutes or hundred metres through Expo Task Manager, with Android’s persistent foreground notification left deliberately visible rather than suppressed.' },
      { title: 'Geofence on the server', body: 'Parents define Places with a radius; Cloud Functions decide enter and exit and send the alert. The phone reports where it is and nothing more, so the rules live somewhere they can be audited.' },
      { title: 'Keep it at sixty frames', body: 'Reanimated worklets run on the UI thread so entrances and the live-tracking pulse survive heavy map rendering — and the pulse respects reduce-motion, because a permanently throbbing ring is a genuine accessibility problem.' },
    ],
    figures: ['child status screen — sharing on or paused', 'places and geofence alerts'],
    hard: [
      'Background location is where apps in this category die. iOS wants Always permission and treats it as a privilege it can revoke; Android needs a foreground service with a notification the user can see; and both will happily starve your updates to save battery. None of it can be tested in Expo Go, so verification meant real development builds, a locked phone, and walking around the neighbourhood watching Firestore for writes that were not arriving.',
      'The design tension was harder than the plumbing. Every request that would have made the app more useful to a parent — silent install, hidden mode, location history going back months — was a request to break the one rule the app is built on. Saying no to those is the product.',
    ],
    nextKicker: 'What I\'d do next',
    next: [
      'This is not store-ready and I would not pretend otherwise. An app that handles children’s location needs COPPA age verification, GDPR-K consent checks, a published privacy policy and working account and data deletion flows before it goes anywhere near a real family. That list is written into the repo as unfinished, because for this app in particular it is not a detail to tidy up later.',
      'After that, the feature I actually want: letting the child see what the parent sees. Symmetry would make the consent real rather than merely disclosed.',
    ],
  },
  'playhub': {
    heroImage: { src: '/playhub/MainScreen.webp', alt: 'PlayHub nearby venues: category filters for Pickleball and Box Cricket, and venue cards with photographs, addresses and hourly rates', width: 1600, height: 762 },
    figureImages: [
      { src: '/playhub/BookingsScreen.webp', alt: 'The bookings screen with Upcoming and Past tabs, showing the empty state prompting a first booking', width: 1600, height: 759 },
      { src: '/playhub/LoginScreen.webp', alt: 'The PlayHub sign-in screen', width: 1600, height: 759 },
    ],
    gallery: [
      { src: '/playhub/ProfileScreen.webp', alt: 'The profile screen: booking and hours-played totals beside account settings for notifications, payment methods and support', width: 1600, height: 757 },
    ],
    heroFigure: 'playhub — booking flow, full width',
    problem: {
      heading: 'Booking a ground still happens over WhatsApp and hope.',
      paras: [
        'Local turf booking runs on phone calls and screenshots of payment confirmations. Players do not know what is free, owners lose slots to double-bookings, and nobody has a record when it goes wrong.',
        'PlayHub puts availability, payment and proof of booking in one place — and had to do it on Android, iOS and the web, because half the players will not install anything.',
      ],
    },
    facts: {
      role: 'Solo — design & development',
      year: '2026',
      stack: 'React Native · Expo · Capacitor · Razorpay · Google Wallet',
      surfaces: '',
    },
    how: [
      { title: 'Real availability', body: 'Slots come from one source of truth, so what a player sees as free is genuinely bookable and an owner cannot be double-booked by two people at once.' },
      { title: 'Payments that settle', body: 'Razorpay handles the money, with the booking only confirmed once payment actually clears — the state machine assumes failure rather than success.' },
      { title: 'Passes in the wallet', body: 'A confirmed booking issues a Google Wallet pass, so the thing you show at the gate is not a screenshot in your camera roll.' },
      { title: 'Three sets of eyes', body: 'Customers book, owners manage slots and see their day, admins see everything. One app, role-based flows, no separate builds.' },
    ],
    figures: ['owner slot manager', 'wallet pass'],
    hard: [
      'Cross-platform for real. Expo covers the native apps and Capacitor covers the web build, which means every native assumption — payments, wallet, permissions — needs a working path on both sides or the feature does not exist.',
      'Payment state was the part worth being paranoid about. Network drops mid-transaction, so the flow is written around reconciliation rather than the happy path — the money and the booking must never disagree.',
    ],
    nextKicker: 'What I\'d do next',
    next: [
      'Recurring bookings for regular teams, a cancellation and refund policy the owner sets themselves, and split payments so one player stops fronting the whole slot.',
    ],
  },
  'learnflex': {
    heroFigure: 'learnflex — practice mode, full width',
    problem: {
      heading: 'Preparation is lonely, and question banks are boring.',
      paras: [
        'Competitive exam prep in India means enormous question banks and very little feedback. Students grind alone, cannot tell whether they are improving, and drop the habit within weeks.',
        'LearnFlex adds the two things that keep people coming back — a daily reason to show up, and someone to compete against — on top of a question bank that has to stay correct as it grows.',
      ],
    },
    facts: {
      role: 'Team of 5 — I built Practice Mode',
      year: '2026',
      stack: 'Postgres (3NF/BCNF) · realtime matches · web app',
      surfaces: '',
    },
    how: [
      { title: 'Practice Mode', body: 'The part I owned: pick a subject and difficulty, work through questions at your own pace, and see explanations and accuracy rather than a bare score.' },
      { title: 'Daily challenges', body: 'A fixed set each day, the same for everyone — a small commitment that turns preparation into a habit instead of an occasional binge.' },
      { title: 'Real-time 1v1', body: 'Two students, the same questions, live. Competition does what streak counters cannot.' },
      { title: 'A schema that holds', body: 'Questions, attempts, subjects and users normalized to 3NF/BCNF, so adding a new exam does not mean duplicating the question model.' },
    ],
    figures: ['daily challenge screen', '1v1 match'],
    hard: [
      'Working in a five-person team meant the schema was the contract. We normalized to 3NF/BCNF early and argued it out once, which is why Practice Mode could be built against attempts and questions without renegotiating them every week.',
      'Practice Mode itself had to stay honest about progress. Showing accuracy per subject over time is more useful — and more sobering — than a single score, so that is what it reports.',
    ],
    nextKicker: 'What I\'d do next',
    next: [
      'Spaced repetition on the questions you get wrong, weak-topic detection from attempt history, and matchmaking by ability instead of whoever is online.',
    ],
  },
  'meetos': {
    heroFigure: 'meetos — desktop, dock and open windows',
    heroImage: { src: '/meetOS/MainScreen.webp', alt: 'The MeetOS desktop: a menu bar, two overlapping windows (About Me and a Projects grid), desktop icons, and a dock along the bottom', width: 1600, height: 759 },
    figureImages: [
      { src: '/meetOS/LauncherScreen.webp', alt: 'The launchpad: a searchable grid of app icons including Projects, Terminal, Finder, Snake and a VS Code window', width: 1600, height: 753 },
      { src: '/meetOS/TimelineScreen.webp', alt: 'The timeline view — a starfield with a year rail from 2023 to 2026 and a profile card for the selected year', width: 1600, height: 758 },
    ],
    problem: {
      heading: 'A portfolio is a document pretending to be an experience.',
      paras: [
        'Everyone\'s portfolio scrolls. You land at the top, you scroll to the bottom, you leave — and the only thing separating one from the next is typography. I wanted to find out what happens if the site is not a page at all.',
        'So the premise was a desktop: the work lives in windows you open, move and close, and the visitor decides what to look at and in what order rather than being walked down a column. The point was to see whether the metaphor could survive being genuinely used, not to make a screenshot of a Mac.',
      ],
    },
    facts: {
      role: 'Solo — design & build',
      year: '2025',
      stack: 'React · TypeScript · CSS',
      surfaces: 'Web app',
    },
    how: [
      { title: 'A real window manager', body: 'Windows drag, stack, focus and close, and z-order is state rather than a pile of z-index constants. Once two windows can overlap, "which one is on top" becomes the whole problem, and it has to be answered in one place.' },
      { title: 'A file system, not a menu', body: 'Content is a tree of folders and files that the interface walks. Adding a project is adding a node — the desktop, the windows and the navigation all read from the same structure.' },
      { title: 'The dock', body: 'Magnification on hover, running indicators, click to open or restore. It is the one piece of pure homage, and it earns its place by being the fastest way back to anything already open.' },
      { title: 'Keyboard and escape hatches', body: 'Escape closes, focus follows the active window, and nothing is reachable only by dragging — the metaphor cannot be the only way in.' },
    ],
    figures: ['launchpad and app grid', 'timeline — travelling by year'],
    hard: [
      'The honest difficulty is that a desktop metaphor is hostile to a phone. There is no cursor, no hover, no room for two windows, and the entire interaction model assumes a pointer and a large canvas. The compromise was to let small screens fall back to one full-bleed window at a time — which works, but is an admission that the idea has a minimum viewport.',
      'It also fights discoverability. A visitor who does not realise the icons open things sees an empty desktop, so the first window opens itself on load rather than waiting to be found.',
    ],
    nextKicker: 'Where it stands',
    next: [
      'Live, and superseded by the site you are reading — which is the point of keeping it. MeetOS answered the question, and the answer was that the metaphor is delightful on a laptop and a liability everywhere else.',
    ],
  },
  'refractor': {
    heroFigure: 'refractor.ai — analysis run',
    problem: {
      heading: 'Every site audit tool tells you what is wrong and not what to do.',
      paras: [
        'Run a site through a standard audit and you get a list of failures scored out of a hundred. It is accurate and close to useless, because it does not rank the failures by what they would actually cost you, and it does not know anything about the site it is looking at.',
        'ReFractor is an attempt at the other shape: crawl the site, hold the results as structured data, and let the advice come from that data rather than from a fixed checklist.',
      ],
    },
    facts: {
      role: 'Solo — design & build',
      year: '2026',
      stack: 'Vite · React · TypeScript · Supabase (Postgres + Auth)',
      surfaces: 'Web app',
    },
    how: [
      { title: 'Infrastructure first', body: 'Auth, the Supabase schema and the analysis routes are in and working end to end. That is deliberate order — the scoring is the part most likely to be rewritten, so it is the part built last, on top of something stable.' },
      { title: 'Runs as records', body: 'An analysis is a row, not a response. Storing every run is what makes "has this got better since last month" a query instead of a rebuild.' },
      { title: 'Analysis separated from advice', body: 'Collecting the facts about a page and deciding what they mean are two different jobs with two different failure modes. Keeping them apart means the scoring can change without re-crawling anything.' },
    ],
    figures: ['analysis route output', 'run history'],
    hard: [
      'The unsolved part is the one that matters: turning a crawl into ranked, specific advice without it collapsing back into a generic checklist. That is the whole thesis of the tool, and it is not done — which is why this is listed as in progress rather than as a finished product with a thin middle.',
    ],
    nextKicker: 'Where it stands',
    next: [
      'In progress and honest about it. The scoring model is the next piece; until it exists this is infrastructure with a demo attached, and describing it as more than that would be the kind of thing the tool is meant to catch.',
    ],
  },
  'transitops': {
    heroFigure: 'transitops — dispatch board',
    problem: {
      heading: 'Fleet software is a state machine wearing a CRUD interface.',
      paras: [
        'The hackathon brief was fleet operations: vehicles, drivers, trips, maintenance. The obvious build is four tables and four forms, and it falls apart the first time someone dispatches a trip to a vehicle that is in the workshop, or assigns a driver who is already out.',
        'With eight hours the decision was where to spend them. We spent them on the rules — because a fleet tool that lets you record an impossible situation is worse than no tool, and a slightly plain interface that refuses to is not.',
      ],
    },
    facts: {
      role: 'Team of 4 — frontend and backend',
      year: '2025',
      stack: 'Full-stack web app',
      surfaces: 'Web app',
    },
    how: [
      { title: 'Rules in the transitions', body: 'A vehicle under maintenance cannot be dispatched; a driver on a trip is not available. Those live as transitions on the entity, not as checks scattered through whichever form happens to be open.' },
      { title: 'Dispatch as the centre', body: 'Trips are where vehicles, drivers and schedules meet, so the dispatch view is the primary screen and everything else is reached from it rather than from a nav bar of equal siblings.' },
      { title: 'Maintenance as first-class', body: 'Servicing is not an attribute of a vehicle, it is a thing that takes the vehicle out of service for a period. Modelling it that way is what makes availability answerable.' },
    ],
    hard: [
      'Eight hours with four people is mostly a coordination problem. Working across both ends meant I was often the seam, and the thing that saved us was agreeing the entity shapes before anyone opened an editor — the interfaces were being written against a contract rather than against whatever the API returned last.',
    ],
    figures: ['vehicle and driver assignment', 'maintenance schedule'],
    nextKicker: 'Where it stands',
    next: [
      'A hackathon build, and it stops where the hackathon did: the rules are enforced and the flows work, but there is no deployment behind it. It is here because the modelling decision is the part worth showing.',
    ],
  },
  'stayfinder': {
    heroFigure: 'airbnb clone — listing and booking',
    problem: {
      heading: 'Building the whole stack once, without leaving anything out.',
      paras: [
        'This was the project where I stopped following tutorials. The goal was not originality — it is a booking site and it is unapologetically an Airbnb clone — it was completeness: authentication, real payments, real uploads, real messaging, all wired together by me, with nothing stubbed because it was the hard part.',
        'Cloning something well understood removes the product questions and leaves only the engineering ones, which is exactly what I wanted from it at the time.',
      ],
    },
    facts: {
      role: 'Solo — full build',
      year: '2025',
      stack: 'Node.js · Express · MongoDB · Passport · Stripe · Cloudinary · Socket.io',
      surfaces: 'Web app',
    },
    how: [
      { title: 'Sessions and OAuth together', body: 'Passport with both a local strategy and Google OAuth, sharing one user record. Getting two sign-in paths to converge on the same account is more fiddly than either one alone, and it is the realistic case.' },
      { title: 'Payments that actually charge', body: 'Stripe checkout against real test flows, including the failure paths. A booking that succeeds when the card declines is the bug that teaches you to treat payment as a state, not a step.' },
      { title: 'Uploads off the box', body: 'Images go to Cloudinary rather than the application server, which keeps deployment stateless and image delivery someone else\'s problem.' },
      { title: 'Messaging over sockets', body: 'Guest and host talk in real time over Socket.io — the piece that turned it from a form-submission app into something that had to hold a connection.' },
    ],
    figures: ['listing page', 'host and guest messaging'],
    hard: [
      'Payments and bookings must not disagree. It is easy to write a handler that creates the booking and then charges the card, and it is wrong in both directions — a charge with no booking, or a booking with no charge. Reasoning about that ordering, and what happens when the process dies between the two, was the most useful thing this project taught me.',
    ],
    nextKicker: 'Where it stands',
    next: [
      'Complete as a build and not deployed. It did its job: everything I use casually now — sessions, webhooks, object storage, socket lifecycles — I first got wrong here.',
    ],
  },
  'mini-resume': {
    heroFigure: 'mini resume — bento grid',
    heroImage: { src: '/miniResume/MainScreen.webp', alt: 'The bento grid: a headline tile, a profile tile, spotlight search, a tech-stack tile, and live GitHub contribution and LeetCode solved counts', width: 1600, height: 789 },
    figureImages: [
      { src: '/miniResume/ProjectsScreen.webp', alt: 'The full-screen project browser — filter chips by technology and a carousel through 21 projects', width: 1600, height: 796 },
      { src: '/miniResume/MainScreen2.webp', alt: 'Further down the bento grid', width: 1600, height: 793 },
    ],
    gallery: [
      // Named LoginScreen in the folder, but it is the loading splash — there
      // is no sign-in on a resume site.
      { src: '/miniResume/LoginScreen.webp', alt: 'The loading splash: an MK monogram over a progress bar reading "building interface"', width: 1600, height: 790 },
    ],
    problem: {
      heading: 'A resume is a ranked list. A dashboard is not.',
      paras: [
        'A CV makes you read top to bottom and decide for yourself which line matters. I wanted the opposite: everything that counts visible at a glance, with the layout doing the ranking that reading order normally does.',
        'A bento grid suits that because the tiles are allowed to be different sizes and different kinds of thing — a headline beside a portrait beside a live contribution count — and size becomes the hierarchy. The tradeoff is that it only works if the numbers are real, because a dashboard of static claims is just a CV with borders.',
      ],
    },
    facts: {
      role: 'Solo — design & build',
      year: '2025',
      stack: 'React · CSS Grid · GitHub contributions API',
      surfaces: 'Single-page site',
    },
    how: [
      { title: 'Density as hierarchy', body: 'Each tile holds one kind of information at one density. The big tile is not important because it is big; it is big because what it contains needs the room.' },
      { title: 'Numbers that fetch themselves', body: 'GitHub contributions and LeetCode solved counts are pulled at load with their own small heatmaps, not typed in. The tiles that date fastest are the ones nobody has to remember to update.' },
      { title: 'Spotlight search', body: 'Command-K opens a search over the whole page. Once the content is tiles rather than sections there is no scroll position to navigate by, so search replaces the scrollbar.' },
      { title: 'A browser for the long tail', body: 'The grid shows the highlights; a full-screen carousel filtered by technology holds all twenty-one projects, so the front page never has to choose between being scannable and being complete.' },
    ],
    figures: ['project browser with technology filters', 'further down the grid'],
    hard: [
      'A dashboard invites you to keep adding tiles, and every tile you add costs the others their prominence. The achievements ticker along the top was the compromise: the things worth stating but not worth a tile of their own scroll past in a single line, rather than each claiming a cell and flattening the hierarchy the layout exists to create.',
    ],
    nextKicker: 'Where it stands',
    next: [
      'Live, and the direct ancestor of this site — the fetched-heatmap idea survived into the Stats page here. It is kept because it is where I worked out that hierarchy can come from layout rather than from order.',
    ],
  },
};


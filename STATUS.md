# STATUS

Working state of this repository. **Update this file whenever you change
something.** It is the handoff document — anyone (or any agent) picking this up
should be able to read it and know what exists, what is deliberately unfinished,
and what will bite them.

_Last updated: 2026-07-31_

---

## What this is

Meet Kapadia's portfolio. React 19 + TypeScript, Vite, React Router (SPA).
18 shown projects (19 in the data — Hindsight is `pending: true`), all with
full case studies. `tier: 'archive'` and `PlainRow` still exist and still
work — nothing currently uses them.

**Deployed on Vercel — see `vercel.json` at the repo root.** Required because
`vite.config.ts` outputs to `site-react/`, not the `dist/` Vercel expects by
default; that mismatch is what took the last deploy down (build succeeded,
"No Output Directory named dist" at the deploy step). The same file adds the
SPA rewrite (`/* → /index.html`) that outstanding item #3 used to flag as
missing — one file fixed both.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build → ./site-react
npm run preview    # serve the build on :4174
npm run typecheck
```

**There is no git repository here.** Deletions are permanent. That is why
superseded work went to `_archive/` instead of being removed.

---

## Layout

| Path | What it is |
| --- | --- |
| `web/content/projects.ts` | **The project list.** Order, categories, tags, links, which five are featured. |
| `web/content/cases.ts` | Case-study prose, keyed by slug. |
| `web/content/stack.ts` | **The technology list**, by category. Feeds the homepage Stack rows. |
| `web/content/stats.ts` | Handles for the Stats page. |
| `web/content/types.ts` | `Project`, `ProjectLinks`. |
| `web/pages/` | Home, Projects, Approach, Stats, Contact, CasePage, NotFound. All but Home are lazy-loaded — see `router.tsx`. |
| `web/components/Hero3D/` | The WebGL hero scene. `index.tsx` is the gate and is the **only** file here in the main bundle; everything else is behind a lazy import. |
| `web/components/` | Layout, Nav, Deck, CommandPalette, Figure, SplitText, demos. |
| `web/hooks/` | Motion, keyboard, document meta, transition navigation. |
| `web/state/` | Shared stores: theme, work view, shortcuts sheet. |
| `web/styles/` | Design system + site/motion/ui/deck layers. |
| `_archive/` | The previous static build, rejected design directions, original `.dc.html` canvas sources. Nothing references it. |
| `_archive/backdrop-reverted/` | A fixed decorative layer (colour fields, rings, dot field, grain) plus hero-recede / figure-parallax scroll effects. Built, worked, and **reverted at Meet's request** — do not re-add without asking. |

---

## Done

- React port complete; all motion carried over (reveals, split headlines,
  cursor, magnetic, tilt, gyroscope parallax, scroll-driven timelines, 3D deck).
- Clean URLs, no `.html` anywhere.
- Shared-element page transitions (project title morphs into case headline).
- Dark mode by reversing every token ramp.
- Command palette: navigation **and** commands (theme, copy email, copy link,
  print, switch view, shortcuts). Context-sensitive.
- Keyboard nav: `⌘K` `/` `j` `k` `Enter` `g h` `g p` `?`.
- Per-route `<title>`/description, back-forward scroll restoration, focus moves
  to `#main` on navigation.
- One unified projects list — no separate archive card grid.
- `/stats` page: shipping record counted from data, GitHub heatmap, GitHub
  streak, LeetCode heatmap.
- Homepage marquee: each term in its own palette step, flipping with the
  theme automatically because the ramps reverse; the band is aria-hidden since
  it repeats the paragraph above it.
- Client work split into four separate case studies (Bhumi Developers, BD
  Buildcon, Mann Beauty Loyalty, Mann Beauty Attendance) rather than one
  combined page.
- **Every project now has a case study.** The five that were link-only rows
  (MeetOS, ReFractor.ai, TransitOps, Airbnb clone, Mini Resume) were promoted
  to `tier: 'case'` with full entries in `cases.ts`. MeetOS and ReFractor.ai
  moved to **AI & tooling**; the rest kept their category.
- **Tech-stack icons** — `components/TechIcon.tsx`. Hand-drawn 24x24 glyphs in
  `currentColor`, matched by substring against a technology name. Used by the
  homepage Stack rows and as `<StackChips>` on every case study, which splits
  the `facts.stack` string on `·` into chips. See the header comment for why
  these aren't a dependency.
- **Mobile navigation is a real menu.** Below 640px the links move into a
  sheet behind a burger. It previously hid Approach, then Stats, to make room
  — which left both pages unreachable on a phone.
- **Touch targets** — a 44px floor below 640px for buttons, nav, TOC links,
  the deck switch and the back link.
- Verified at 375x812: no horizontal overflow on any route, no control under
  44px, palette opens and fits, menu navigates and closes.
- **Both heatmaps are drawn from real data** — `components/Heatmap.tsx`. The
  third-party card images are gone. Levels map onto palette ramp steps, so the
  grids invert with the theme; tiles carry a date/count tooltip and lift on
  hover. GitHub uses the accent ramp, LeetCode the second accent.
- **LeetCode panel shows real stats**: problems solved and rank, plus a
  solved-by-difficulty breakdown where each bar is that tier's share of the
  problems that exist (37 hard read against 958, not in a vacuum), then
  streak, active days and total submissions above the heatmap.
- Seven case studies carry real screenshots, converted to WebP.
- **Homepage "Core Tools" is now "Stack"** — five cards with a paragraph each
  replaced by three rolling rows of icon chips (`TechMarquee`), carrying all
  43 technologies from `content/stack.ts`. Every one resolves to a real glyph
  in `TechIcon`; none fall through to the placeholder dot. Rows alternate
  direction, pause on hover, and fade at both edges.
- **Second motion layer** — `hooks/useMotionPlus.ts` + `styles/motion-plus.css`.
  Strictly additive: every selector targets a hook that did not exist before
  (`.is-split`, `.hl`, `[data-velocity]`, `[data-figure]`, `.kicker-rule`,
  `.ul-sweep`, `.has-smooth-scroll`). Delete the two files and their two
  imports and the site is byte-for-byte its previous self. Contains:
  inertial wheel scrolling, word-by-word text reveal, highlight sweeps,
  count-up numbers, scroll-velocity skew, figure wipe-in, section kicker
  rules. All off under `prefers-reduced-motion`.
- **Performance pass — route-based code splitting, prefetch, and four fixed
  full-tree rescans.** Measured, not assumed; numbers are from real
  `npm run build` output, before and after:

  | | Before | After (Home-only visit) |
  |---|---|---|
  | JS shipped | 441.25 kB (141.17 kB gzip), one file | 355.72 kB (113.43 kB gzip), two files fetched in parallel |
  | CSS | 40.61 kB (8.67 kB gzip) | unchanged — one global stylesheet, see below |

  - **`router.tsx`**: every route but Home (`Projects`, `Approach`, `Stats`,
    `CasePage`, `NotFound`) is `React.lazy`. Home stays eager — it's the one
    thing every first visit needs, and lazy-loading it would add a
    round-trip for zero benefit. Real per-route chunk costs, gzipped: Projects
    1.0 kB, Approach 2.6 kB, Stats 4.0 kB, CasePage 24.5 kB (carries every
    case study's prose from `cases.ts`, correctly deferred until it's needed).
  - **Hover/focus/keyboard-highlight prefetch**, not just lazy-loading. A
    route chunk with no warning is a route that pauses to fetch itself the
    first time anyone clicks it — the visible stutter this whole pass was
    supposed to remove. `router.tsx` exports `prefetchRoute(path)`; `TLink`
    calls it on `onPointerEnter`/`onFocus`, `Nav`'s primary links do the same,
    and `CommandPalette` calls it as the arrow keys move the highlight over a
    link entry. By the time a click lands, the chunk is almost always already
    in the browser's cache. Verified against the real production build
    (`npm run preview`): hovering a not-yet-loaded nav link fetches exactly
    one chunk, matching exactly what was hovered — checked with a temporary
    console log against the network panel, not assumed.
  - **`components/RouteFallback.tsx`** is the Suspense fallback for the rare
    case prefetch didn't win the race — a click that outran its own hover.
    A quiet pulsing dot with `min-height: 60vh` so the footer doesn't jump up
    to meet the nav for the instant it's showing.
  - **`vite.config.ts`**: React/ReactDOM/react-router split into their own
    `react-vendor` chunk (99.3 kB / 33.25 kB gzip). They change on a dependency
    bump, not on every commit — separating them means a deploy only
    invalidates the chunk that actually changed, and a returning visitor's
    browser can keep serving `react-vendor` from cache indefinitely.
  - **Four `MutationObserver`s were rescanning the entire document on every
    DOM mutation anywhere in `<body>`.** `useReveals` (useMotion.ts),
    `useTextReveal` and `useHighlights` (useMotionPlus.ts) each ran a full
    `document.querySelectorAll(...)` inside their sweep callback — and that
    callback fired on *any* childList mutation in `<body>`, including ones
    with nothing to do with reveals, like the command palette re-rendering
    its filtered list on every keystroke. That was four full-tree queries per
    keypress while someone was trying to fast-search. Rewritten to scope each
    sweep to `mutation.addedNodes` — the only place a new `[data-reveal]` /
    `[data-lines]` / `.hl` element can ever appear — for identical behaviour
    at a cost proportional to what actually changed. Verified: case-study
    figures still reveal (including ones mounted well after initial load, via
    a lazy-route navigation — the scenario this logic exists for), the
    4-second safety net still fires, word-by-word text reveal still splits
    and animates correctly.
  - **Not changed, and why**: this codebase has no Framer Motion dependency
    anywhere — it never did; the motion system is hand-rolled CSS transitions
    plus `requestAnimationFrame` and `animation-timeline`. Introducing Framer
    Motion now would add a real dependency to fight the bundle-size goal
    this pass exists for, for animations that already work. `content-visibility:
    auto` on the Projects page's 19 rows was considered and deliberately
    **not** applied — the list is short enough that the paint/layout saving is
    marginal, and guessing wrong on `contain-intrinsic-size` risks a small
    scroll-jump on a page whose whole point is to feel smooth. `Deck.tsx` was
    audited for a per-pointermove re-render (the classic cause of dropped
    frames during a drag interaction) and found to already avoid it — the drag
    and tilt-tracking handlers write straight to `style.setProperty` on refs;
    `setState` only fires on a discrete threshold crossing, a click, or an
    arrow key. No React.memo/useMemo were added to WorkRow, Deck, or the
    stack marquee: none of them sit under a parent that re-renders on
    anything faster than a route change, so memoizing them would be
    inert — added complexity with nothing to actually prevent.
- **`/contact` — a dedicated page**, not just the shared closing block.
  `pages/Contact.tsx`, lazy-loaded like every other route, nav entry added,
  indexed in the command palette. The existing `<Contact />` block
  (`components/Contact.tsx`) is untouched and still ends every other page —
  same name, different thing; see the comment in `router.tsx`. Content is
  three reach-me cards (email/GitHub/LinkedIn, each explaining what it's
  *for*, not just a link) plus the same "worth reaching out about" list
  Approach already states, so the two pages don't contradict each other. The
  page's own "Ways to reach me" section carries `id="contact"`, so the
  nav's persistent "Get in touch" pill still resolves to something sensible
  when clicked from this page too.

  It closes on a "Before you write" band. That exists for two reasons, and
  the first is a bug fix: **this is the only page that does not end with the
  shared `<Contact />` block, and that block is where every other page gets
  its `10vh` of bottom padding from.** Without it the final list ran flush
  into the footer with no gap — which is what made the page read as
  unfinished. The band restores the bottom padding *and* gives the page a
  terminal beat instead of stopping mid-list. Its content is deliberately
  not a fourth restatement of the email address: the cards above say which
  channel to use, the band says what happens after you use one, and it
  claims nothing about response times that the site does not already claim
  elsewhere.
- **`WorkRow` now renders `project.status`.** It only lived on `PlainRow`
  before, so a case-tier project's `status` field was silently inert — the
  one place this bit (ReFractor.ai) worked around it by duplicating "In
  progress" into its `tags` array instead. That duplicate is gone now that
  the real mechanism works; J.A.R.V.I.S and PlayHub carry `status: 'In
  progress'` the same way, each with an honest reason in `projects.ts` (no
  public URL exists for a local voice assistant; PlayHub's own screenshots
  show a gamification layer the case study doesn't describe).
- **DealAI Agent replaces Hindsight** as the fifth featured project. Both
  were hackathon builds about memory and read as repetitive back to back;
  DealAI has a live demo and a public repo to click through, Hindsight has
  neither. Hindsight is `pending: true`, not deleted — full write-up still in
  `cases.ts`, and there's no git here so deletion is permanent. Flip
  `pending` back if a demo or repo ever exists for it.
- **Two more case studies photographed**: Connected Ambulance (paramedic
  view, hospital ER queue, audit trail — all synthetic demo data, "DEMO
  MODE" visible in every shot, no real patient information) and LearnFlex
  (Practice Mode — the part actually built — plus session results, history,
  and the dashboard as a gallery extra). `scripts/images.mjs` now converts
  `.jpg`/`.jpeg` sources as well as `.png` — the Ambulance screenshots were
  JPEGs and the script silently skipped non-PNG files before this. Both
  case studies' `figures`/`heroFigure` captions were rewritten to describe
  what the real screenshots show, replacing guesses written before any
  screenshot existed (e.g. LearnFlex's placeholder said "1v1 match", a
  screen that was never actually captured).

---

## Outstanding — in priority order

### 1. Prerender the routes  ⚠️ blocks launch
This is an SPA. Crawlers and link previews get `<div id="root"></div>`.
Walk the route list through `react-dom/server` at build time and emit real HTML
per route. ~40 lines. **Nothing else on this list matters as much.**

Since the last pass, every route but Home is behind `React.lazy` (see
`router.tsx` and the Done list). Plain `renderToString` doesn't resolve
Suspense boundaries — the prerender script will need `renderToStaticMarkup`
run per-route with each route's own lazy import awaited first (or
`renderToPipeableStream`/`renderToReadableStream` with the stream drained to
completion), or every prerendered page except Home will emit the
`RouteFallback` pulse rather than real content. Worth ten minutes of testing
against one lazy route before assuming the naive approach works.

### 2. Error boundary  ⚠️ blocks launch
There is none. One uncaught error anywhere = blank white page, no way out.
Catch, render the NotFound-style page, offer a link home.

### 3. SPA rewrite rule on the host  ✅ done
`vercel.json` at the repo root now carries `rewrites: [{ source: '/(.*)',
destination: '/index.html' }]`, plus `outputDirectory: 'site-react'` (see
"What this is" above — that second part is what the last deploy actually
needed). Static assets under `outputDirectory` still serve directly; Vercel
checks the filesystem before falling through to the rewrite. If this site
ever moves host, the equivalent rule (Netlify `_redirects`, the GitHub Pages
404 trick) still needs adding there.

### 4. Real images — mostly done
Screenshots are in `web/public/<Project>/`. Seven case studies use them:
Bhumi Developers, Mini Resume and PlayHub (4 each), BD Buildcon and MeetOS
(3 each), RepoGrade and AI Text Detector (hero only). The rest are still
placeholders.

Beyond the hero and the two-up, `CaseContent.gallery` takes any number of
extra images and renders them as an auto-fit strip — added so projects with
more than three good screenshots don't have to discard them. **Every
non-private screenshot in `web/public/` is now on the site**; the only ones
left out are the ones in §7, held back deliberately.

`node scripts/images.mjs` converts every PNG to WebP at **three widths**: the
1600 keeps the plain name, plus `-800` and `-1200` beside it. **Originals are
kept, never overwritten.** Re-running skips anything already current. Paths are
case-sensitive on most hosts: the folder is `repoGrade`, not `repograde`.

`cases.ts` stores one path per image — the 1600. `Figure` rebuilds the srcset
by convention (`-800 800w, -1200 1200w, base 1600w`), so adding an image is
still one line. **If you ever add a `.webp` by hand, generate its two siblings
too, or the srcset will point at files that do not exist.**

The full-bleed hero passes `priority`, which makes it `loading="eager"` and
`fetchpriority="high"`; everything else stays lazy. Lazy-loading the one image
above the fold was most of why the pages felt slow.

Measured: a case study with four screenshots is **86 KB of images** at mobile
width (was ~5 MB of PNGs for the same four). Note that `naturalWidth` on these
reads *smaller* than the file — with `w` descriptors the browser divides by the
effective density. That is correct, not a bug.

**Screenshots deliberately not used — see §8.**

### 5. Missing data
- **Repo URLs** — only DealAI has one. Every other `links.repo` is empty.
- **Mann Beauty URLs** — both apps (`mann-loyalty`, `mann-attendance`) have
  none. The attendance tool is internal; confirm whether it is public at all.
- **Years** — client projects are guesses (`2025`/`2026`). TODOs in the data.
- **Codolio profile URL** — slot exists in `stats.ts`. No embeddable card
  format found; it will render as a titled link-out unless one exists.
- **The five new case studies are written from their READMEs and from what
  the deployed versions do.** They are honest about scope and about what is
  unfinished, but Meet has not reviewed the prose. TransitOps in particular
  claims "I worked across frontend and backend" from an earlier message —
  worth confirming before it goes public.

### 6. Open questions for Meet
- **Connected Ambulance** — team build. Which parts were his? The case study
  currently describes the system without claiming any decision, which is
  accurate but generic.
- **DealAI** — README says "we built this". Solo or team?
- **PayMatrix** — deliberately excluded (`pending: true`). His contribution was
  the bill-scanning idea, not the build; Harshil engineered it. Flip
  `pending: false` only if he decides otherwise.
- **PlayHub naming** — branded PlayHub in the UI, deployed at
  `pickle-rage-booking`. Case study says PlayHub. Reads as a mismatch.
- **PlayHub leaderboard** — screenshots show a gamification layer (ranks, court
  hours, badges) the case study does not mention.

### 7. Screenshots held back on purpose  ⚠️ do not "fix" these
Three sets of screenshots exist in `web/public/` and are **not** referenced by
`cases.ts`. Each was checked and rejected for a reason:

- **`mannAttendance/MainScreen`, `SummaryScreen`, `ManageStaffScreen`** —
  these show eight named salon employees (Damini, Sonu, Akshu, Sheela, Bhumi,
  Tanu, Hitanshi, Anita), their job titles, and their exact clock-in/clock-out
  times for every day of a month. That is real employee personal data from a
  live client system, and it is not Meet's to publish. It would also be a
  working-hours profile of eight identifiable people. Mann Beauty Attendance
  therefore has **no images at all**. If it needs one, seed a demo tenant with
  fake staff and screenshot that.
- **`mannAttendance/LockScreen`** — clean of personal data, but it shows the
  "Enter your secret key" admin gate, which is exactly the mechanism §8 says
  not to advertise. Held back for that reason, not a privacy one.
- **`repoGrade/RepoAnalysisScreen`, `OwnRepoScreen`, `HistoryScreen`** — all
  show other people's GitHub accounts (`Marshmellow31`, `Kinnariii`) beside
  grades of D and F, plus the names of private repositories. Publishing a page
  that grades named third parties as failures is not on without their consent.
  Replace with a scan of a well-known public repo, or one of Meet's own.
- **`playhub/LeaderBoardScreen`** — real user names and a profile photograph.
  Not shipped. (It also shows a gamification layer the case study never
  mentions — see the PlayHub note below.)

### 8. Security note (not on the site, deliberately)
Mann Beauty's attendance app gates admin with `VITE_ADMIN_SECRET`. Anything
`VITE_`-prefixed is compiled into the browser bundle — it is not a secret. The
case study says "scoped to a single salon" rather than describing the mechanism,
because publishing how to get into a live client's staff tool would be
irresponsible. **Do not add that detail to the site.** It should move behind
Firebase Auth with a role, like the loyalty app already does.

### 9. Next performance win: lazy-load the command palette itself
`CommandPalette.tsx` (370 lines — fuzzy search, the whole project index, the
results list) is the single biggest thing left in the eager main chunk,
because `PaletteProvider` wraps every route so `⌘K`/`/` work immediately
everywhere. The provider (a few lines: `isOpen` state, the keyboard listener)
needs to stay eager; the modal UI it renders when opened does not. Splitting
those two apart — keep the open/close plumbing synchronous, `React.lazy` the
`Palette` component it renders — would shrink the initial bundle further
without costing the first keypress anything a prefetch-on-idle couldn't cover.
Not done in this pass: it means reshaping the provider/component boundary in
a 370-line file, which is a real change to get right rather than a
five-minute one, and the code-splitting already done was the higher-confidence
win for the time available.

### 10. Codolio — endpoint found, but the profile 404s
Meet asked for a Codolio integration on `/stats`, reverse-engineered rather
than scraped. Investigated live against `codolio.com/profile/Lucifer_17`
(Next.js App Router; no `window.__NEXT_DATA__`, data streams in via RSC
`self.__next_f.push`, so nothing useful sits in the initial HTML — the real
data comes from a client-side fetch).

**The endpoint**: `GET https://api.codolio.com/profile?userKey=<handle>`
(siblings exist: `/github/profile`, `/dev/project`, `/dev/project/config`,
same `userKey` param). No cookies, no auth header, no login required — a
plain cross-origin `fetch()` from a completely different origin got a real,
specific JSON response back rather than a CORS block, which means it's
genuinely public.

**The problem**: for `userKey=Lucifer_17`, it returns HTTP 400 —
`{"error":"Profile not found","errorDetails":"Authentication Failure"}` —
and **the live profile page shows Codolio's own 404** ("Oops... Page Not
Found"). This isn't a fetch-side mistake: it's what Codolio's own frontend
gets back for this exact handle right now. Tried case variants
(`lucifer_17`, `LUCIFER_17`) — same 406 "Profile not found". A hyphen
variant (`Lucifer-17`) returned a *different* error (404 "User not found"),
which suggests `Lucifer_17` with the underscore is a real registered
identifier, just not one whose profile currently resolves — most likely
either renamed, or set to private, or `userKey` wants something other than
the display handle (a slug/ID that isn't `Lucifer_17` even though the URL
shows it).

**Nothing was built against this.** Wiring a card to an endpoint that 404s
for its own subject would ship a broken feature, not a working one — Stats
already has the pattern for a service that might fail (`loading → error →
ready`, GitHub/LeetCode), but that pattern is for *transient* failures, not
"this profile doesn't exist." **Needs from Meet before this goes further**:
confirm the current, correct Codolio profile URL — check codolio.com while
logged in — and re-share it. Once one resolves, the endpoint above (`GET
/profile?userKey=<handle>`, public, unauthenticated, JSON) is what to build
against; it slots into the same `useGitHubCalendar`/`useLeetCode` pattern
already in `components/Heatmap.tsx`, client-side, no backend needed — this
is a static Vercel SPA, and a Node proxy for one already-public GET endpoint
would be new infrastructure to solve a problem that doesn't exist here.

### 11. 3D hero — built, but never seen rendering  ⚠️ needs a human look
`web/components/Hero3D/` is implemented and wired into Home. **Every
structural claim below was verified against the production build. The one
thing that could not be checked is whether it actually looks good** — see
"what is unverified" at the end of this entry. Look at it before trusting it.

**Architecture.** `index.tsx` is the gate and the only file here in the main
bundle; it must never import three. It calls `getDeviceProfile()`, and on
`'none'` returns `null` — the `React.lazy` import is inside a branch that
never runs, so an unsupported device downloads nothing. Everything else
(`HeroCanvas`, `OrganicField`, `Particles`, `CameraRig`, `palette`) is
reachable only through that lazy import and lands in one chunk.

**Measured cost** (`npm run build`):

| | gzip |
|---|---|
| main bundle before | 80.38 kB |
| main bundle after | 81.02 kB (**+0.64 kB** — the gate and the device profile) |
| `HeroCanvas` chunk | **242.19 kB** (896.77 kB raw), lazy, gated |

Verified by grep that `WebGLRenderer`/`IcosahedronGeometry` appear in the
hero chunk and in **neither** the main bundle nor `react-vendor`. The 242 kB
is essentially the price of three.js itself; it is worth revisiting only by
dropping features (`transmission` and the PMREM environment are the two
candidates), and that trade was not measured — it would cost real visual
quality for a fraction of a chunk that already never blocks first paint.

**Dependencies added**: `three`, `@react-three/fiber`, `@types/three`.
Deliberately **not** Drei (its `<Environment>` wants an HDR over the network,
which the brief rules out; everything else wanted from it is a few lines) and
**not** postprocessing (bloom/DOF is two more packages and a second
full-screen pass on exactly the phones this has to stay smooth on).

**Device gating** — `hooks/useDeviceProfile.ts`, resolved synchronously and
cached:
- `none` (no chunk at all): `prefers-reduced-motion`, no WebGL2 context,
  Data Saver on, ≤2 GB RAM or ≤2 cores.
- `low` (4 forms, 90 particles, no transmission, DPR ≤1.5): coarse pointer,
  <900px wide, ≤4 GB or ≤4 cores.
- `high` (7 forms, 260 particles, transmission, DPR ≤2): everything else.
Verified live: 1440px → `high`, DPR-2 buffer; 375px → `low`, buffer clamped
to 1.5×.

**Colours come from the stylesheet, not from constants.** `palette.ts` reads
`--color-accent-*` / `--color-accent-2-*` off `document.documentElement` and
`HeroCanvas` re-reads on every `useTheme()` change, so the scene inverts with
the ramps in dark mode like everything else. **Do not hardcode a hex in this
folder** — that is the one change that would visibly break the branding.

**The static blob is the failure path, and it is not conditional.** Home
always renders `.hero-blob`; it fades out only via
`.hero3d.is-ready ~ .hero-blob` once the canvas reports a live WebGL context.
An earlier version hid the blob whenever the *capability check* passed, which
was wrong — the check says the device could run WebGL, not that it did, so a
lost context or a chunk that never arrived would have left the hero emptier
than before the 3D existed. Two consequences: **the blob must stay after
`<Hero3D />` in the DOM** (forward sibling selector), and **its opacity must
stay in the stylesheet, not inline** — an inline value outranks the fade rule
and the blob sits on top of the scene forever. Both of those were real bugs
during the build.

**Why not instanced meshes for the forms.** The brief asked for instancing
"where possible". Seven meshes is seven draw calls, noise next to the
transmission pass, and instancing forces one shared material — losing the
per-form colour and opacity that make the cluster read as depth. The
particles *are* the thousands-of-elements case and are a single `<points>`.

**What is unverified — read this before assuming it works.** The preview
browser reports `document.visibilityState === 'hidden'` and fires **zero**
rAF callbacks (measured: 0 frames in 1s). Consequences:
- R3F never receives a ResizeObserver callback, so it never sizes itself.
  Dispatching a manual `window.resize` unblocks it, and after that the canvas
  sized correctly (1685×828), `onCreated` fired, `.is-ready` applied and the
  fade rules resolved to their correct targets (0.85 high / 0.7 low, blob 0).
  So init, WebGL2 context, shader compilation and the fade chain are all
  confirmed working — **that is an environment artifact, not a bug.**
- CSS transitions do not advance either, so opacity had to be read with
  transitions forced off to see target values.
- **No frame was ever rendered, and no screenshot was ever obtained.** The
  composition, the colours in motion, whether the forms read as organic
  rather than as spheres, whether 0.85 opacity is too strong behind the
  headline — none of that has been seen by anyone. `gl.render()` could have
  been forced synchronously, but R3F v9 no longer exposes `__r3f` on the
  canvas, so the scene/camera handles were not reachable.

Confirmed clean regardless: no console **errors** (only a three.js
`Clock`-deprecation warning that comes from R3F itself, and an ANGLE
float-precision warning from three's own shaders); no horizontal overflow at
1440px or 375px — a real risk given the layer is inset `-10vw`; the canvas is
`pointer-events: none` and hit-testing at the headline and the CTA tag
returns the text, not the canvas, so nothing in the hero became unclickable.

**Likely first adjustments once someone sees it**: the opacity pair in
`site.css` (`.hero3d[data-tier=...].is-ready`), and the `FORMS` table at the
top of `OrganicField.tsx`, which is the whole composition in seven lines.

---

## Gotchas — read before touching these

**@react-three/fiber augments the global JSX namespace, and it broke a file
that has nothing to do with 3D.** Installing R3F adds every Three.js object
(`<mesh>`, `<points>`, `<meshPhysicalMaterial>`…) to `JSX.IntrinsicElements`
*globally*. `SplitText` typed its `as` prop as React's `ElementType`, so
TypeScript started trying to find props valid across HTML elements **and**
Three.js objects simultaneously, and collapsed `children`, `ref`, `className`
and `style` to `never` — four errors in a component that renders a headline.
Fixed by narrowing `as` to the tags it actually supports (`SplitTag`), which
was more honest anyway. **If a similar `never` error appears in an unrelated
component after any R3F upgrade, this is why** — narrow the type, don't cast
the props.

**The hero scene's colours are read from CSS, and must stay that way.** See
outstanding item 11; `Hero3D/palette.ts` is the only place that knows what a
colour is, and hardcoding a hex anywhere in that folder breaks dark mode
silently.

**Every page but Home is `React.lazy`, and the loader functions are shared
between two things that must never drift apart.** `router.tsx` keeps one
`loaders` object; `lazy()` wraps each entry for the actual route element, and
`prefetchRoute()` calls the *same* function reference to warm the chunk
early. If a new page is added, it needs an entry in `loaders`, a `lazy()`
wrapper, **and** a branch in `prefetchRoute`'s path-matching ladder — miss the
last one and the page still works, it just loses the "already loaded by the
time you click" feel every other route has.

**Every page component is a named export, not a default one.** That's the
existing convention throughout `web/pages/`, and `React.lazy` needs a
`{ default }` shape — so each loader in `router.tsx` is wrapped with
`.then((m) => ({ default: m.PageName }))` rather than changing how pages
export themselves. Miss the rename on a new page and TypeScript catches it
immediately (`Property 'default' is missing`), so this fails loudly, not
silently.

**Reveal/text-reveal/highlight sweeps are scoped to `mutation.addedNodes`,
not the whole document.** They used to re-run a full `document.querySelectorAll`
on every mutation anywhere in `<body>` — including the command palette
re-rendering its list on every keystroke, which made typing to search cost
four full-tree scans per keypress. If you're adding a fifth
`[data-something]` sweep, copy this pattern (check the added node itself with
`.matches()`, then its descendants with `.querySelectorAll()`) rather than the
old whole-document one — the old shape is exactly the kind of thing that gets
copy-pasted back in by accident.

**View transitions are order-sensitive.** See `hooks/useTransitionNavigate.ts`.
Three approaches failed before the working one:
- `startViewTransition(() => flushSync(navigate))` — a data router's `navigate()`
  is async; nothing has committed when the callback returns, so both snapshots
  capture the *outgoing* page and the morph animates nowhere.
- Awaiting `navigate()` inside the callback — same.
- Router-owned transition + scroll reset afterwards — correct DOM, stale scroll,
  headline flies off the top of the screen.

The working combination: reset scroll **first**, `behavior: 'instant'`, then let
the router run the transition. The stylesheet sets `scroll-behavior: smooth`,
which silently animates any scroll reset over several hundred milliseconds —
long after the browser has measured both snapshots. **Any new programmatic
scroll must pass `behavior: 'instant'`.**

**Reveals must survive mid-route mounting.** `useReveals` watches the DOM with a
MutationObserver, not just route changes, because CSS hides `[data-reveal]`
indefinitely if nothing observes it. Switching the work list to the deck and
back was the bug that found this. Every late arrival also gets its own 4s
safety net — content must never depend on an animation to become visible.

**`scrollbar-gutter: stable` is load-bearing.** The command palette locks scroll
with `overflow: hidden`; without the reserved gutter the viewport widens ~15px
and the whole page — including the fixed nav — shifts under the custom cursor.

**Deck pointer capture.** The 3D deck captures the pointer only after 6px of
movement. Capturing on pointerdown retargets the click to the viewport and the
cards stop being clickable entirely.

**StrictMode spends "first render" flags.** React mounts, unmounts and
remounts every component in development. `Layout.tsx` moves focus to `#main`
on navigation and must *not* do it on first load; the guard used to be a
`useRef(true)` flipped in the effect, which the throwaway mount consumed — so
a fresh dev load focused the header and drew a 2px accent ring around the
whole hero. It reads as a stray rectangle, not as a focus ring. The guard is
now "has the path actually changed", which is idempotent under remounting.
`[tabindex="-1"]:focus { outline: none }` in `site.css` is the second half of
that fix: the focus move is announced, and does not also need to be drawn.

**The smooth scroll calls preventDefault, which is the dangerous part.**
`useSmoothScroll` takes the wheel and eases the page toward a target. If the
loop ever fails to run a frame, the page becomes completely unscrollable — so
every wheel event arms a 400ms watchdog that the first frame disarms. If no
frame arrives, the hijack unbinds itself permanently and native scrolling
returns. **Do not remove that watchdog.**

Three more rules hold it together:
- **Any scroll it did not cause wins.** It compares the real `scrollY` against
  the value it last wrote; a difference over 2px means something else moved
  the page (scroll restoration, the instant reset before a view transition,
  find-in-page) and the loop stands down immediately.
- **Every write passes `behavior: 'instant'`**, and `.has-smooth-scroll` sets
  `scroll-behavior: auto`. Without both, each frame's write would itself
  animate and the page would crawl.
- **Anchors are eased by the loop**, not by CSS — turning off
  `scroll-behavior: smooth` would otherwise make "Get in touch" jump.

Wheel only, fine pointers only: touch already has better momentum from the OS.

**rAF does not run in the preview browser.** `document.visibilityState` is
`hidden` there, so `requestAnimationFrame` never fires and nothing driven by
it — smooth scroll, count-up, velocity skew — can be verified by driving the
page. The scroll loop's arithmetic was instead proven by simulation (converges
to target, clamps at both ends, adopts an external jump in both directions).
**CSS transitions still run**, so the reveal, highlight and figure states are
verifiable normally. Anything rAF-driven needs a real browser to check.

**A marquee half must be wider than the viewport.** Both marquees translate
their track by -50%, which needs two *identical* halves or the loop jumps at
the seam. Less obviously, each half must also exceed the widest screen it will
meet, or a gap opens as it slides. One pass of the shortest Stack row is about
1700px — fine on a laptop, a visible hole on a wide monitor — so each half
renders its items **twice**. Halves currently measure 3353 / 4196 / 4470px.

**The Stack rows are aria-hidden, with a replacement.** They duplicate every
chip four times over, scramble the reading order and drop the category each
item belongs to, so the animated rows are hidden and a real `<ul class="sr-only">`
carries the grouped list once. This is *not* the same as the hero marquee,
which is aria-hidden with no replacement because the paragraph above it already
says the same words. **If you add anything to `stack.ts`, it reaches assistive
tech only through that list** — do not delete it.

**Counters derive from order.** `caseStudies` is sorted by category rank in
`projects.ts`; `/projects` re-sorts the combined list the same way so the row
counter matches its position. If you add a category, add it to `CATEGORIES` or
its projects sort to the end.

**The heatmaps depend on two unofficial APIs.** `github-contributions-api.
jogruber.de` and `alfa-leetcode-api.onrender.com`. Both are CORS-enabled,
which is why they were chosen — LeetCode's own GraphQL endpoint is not, so it
cannot be called from the browser. Neither has an uptime guarantee. Each panel
renders `loading → error → ready` explicitly, and the error state keeps the
heading and the profile link, so a dead API costs a grid and nothing else.
**The two LeetCode endpoints disagree about `submissionCalendar`.** This is the
trap in that file. `/<user>/calendar` returns it as a JSON **string** that needs
a second parse; `/userProfile/<user>` returns the same data **already parsed
into an object**. Calling `JSON.parse` on the object throws, which silently put
the whole panel into its error state while the request itself was a healthy
200 — exactly the symptom that looks like "the API is down" and is not.
`parseCalendar()` accepts either shape. Keys are UTC-midnight unix seconds
in both.

**One request, not two.** `/userProfile` carries the calendar *and* the solved
counts, so the grid and the numbers cost a single call. The streak and
active-day totals only exist on `/calendar`, so that is fetched second and its
failure is swallowed — losing a streak line is not a reason to show an error
where a heatmap could be.

**Retries are load-bearing.** Free-tier Render sleeps and rate-limits, so a
lone failure means nothing. `fetchRetrying` backs off 700ms then 1.4s, and
retries only 429 and 5xx — a wrong username will not improve by being asked
again.

**Heatmap levels are not the same on both.** GitHub's API buckets days into
0–4 itself, so those are used as given. LeetCode returns raw counts, bucketed
here at 1–2 / 3–5 / 6–9 / 10+. Deliberately fixed rather than scaled to the
maximum: one sixty-submission day would otherwise flatten the entire year into
level 1.

**The old LeetCode panel was a cropped image, and that is why it is gone.**
`leetcard.jacoblin.cool` renders a 500x320 card — username, ranking, solved
counts, then the heatmap — and only the heatmap was wanted, so it was shown
through a fixed-ratio window at `translateY(-64.0625%)`. That worked, but the
magic percentage silently shows the wrong band the moment the service changes
its layout, and an image can never be themed or hovered. **Do not reintroduce
a cropped card.** The data is available; draw the grid.

**Third-party requests.** The two heatmap fetches on `/stats` are now the only
external requests the whole site makes — no third-party images anywhere. The
`streak-stats.demolab.com` panel was dropped when the heatmaps became real:
the LeetCode API returns streak and active-day counts for free, so those are
rendered as text from the same response, and the last un-themeable image on
the page went with it. `github-readme-stats.vercel.app` errors for this
account on every variant; don't try it again.

---

## Adding a project

1. One object in `web/content/projects.ts`. `tier: 'archive'` for a link-only
   entry; `tier: 'case'` also needs `category`, `title`, `desc`.
2. For a case study, an entry in `web/content/cases.ts` keyed by the same slug.
3. Nothing else. Counters, the next-project chain, the command palette, the
   Stats totals and the nav all derive from the list.

`pending: true` keeps an entry in the data but out of the build.

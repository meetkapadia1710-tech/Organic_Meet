# STATUS

Working state of this repository. **Update this file whenever you change
something.** It is the handoff document — anyone (or any agent) picking this up
should be able to read it and know what exists, what is deliberately unfinished,
and what will bite them.

_Last updated: 2026-07-29_

---

## What this is

Meet Kapadia's portfolio. React 19 + TypeScript, Vite, React Router (SPA).
19 projects, all 19 with full case studies. `tier: 'archive'` and `PlainRow`
still exist and still work — nothing currently uses them.

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
| `web/content/stats.ts` | Handles for the Stats page. |
| `web/content/types.ts` | `Project`, `ProjectLinks`. |
| `web/pages/` | Home, Projects, Approach, Stats, CasePage, NotFound. |
| `web/components/` | Layout, Nav, Deck, CommandPalette, Figure, SplitText, demos. |
| `web/hooks/` | Motion, keyboard, document meta, transition navigation. |
| `web/state/` | Shared stores: theme, work view, shortcuts sheet. |
| `web/styles/` | Design system + site/motion/ui/deck layers. |
| `_archive/` | The previous static build, rejected design directions, original `.dc.html` canvas sources. Nothing references it. |

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
  `currentColor`, matched by substring against a technology name. Used on the
  homepage Core Tools cards and as `<StackChips>` on every case study, which
  splits the `facts.stack` string on `·` into chips. See the header comment
  for why these aren't a dependency.
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
- Seven case studies carry real screenshots, converted to WebP.
- **Second motion layer** — `hooks/useMotionPlus.ts` + `styles/motion-plus.css`.
  Strictly additive: every selector targets a hook that did not exist before
  (`.is-split`, `.hl`, `[data-velocity]`, `[data-figure]`, `.kicker-rule`,
  `.ul-sweep`, `.has-smooth-scroll`). Delete the two files and their two
  imports and the site is byte-for-byte its previous self. Contains:
  inertial wheel scrolling, word-by-word text reveal, highlight sweeps,
  count-up numbers, scroll-velocity skew, figure wipe-in, section kicker
  rules. All off under `prefers-reduced-motion`.

---

## Outstanding — in priority order

### 1. Prerender the routes  ⚠️ blocks launch
This is an SPA. Crawlers and link previews get `<div id="root"></div>`.
Walk the route list through `react-dom/server` at build time and emit real HTML
per route. ~40 lines. **Nothing else on this list matters as much.**

### 2. Error boundary  ⚠️ blocks launch
There is none. One uncaught error anywhere = blank white page, no way out.
Catch, render the NotFound-style page, offer a link home.

### 3. SPA rewrite rule on the host
`/*` → `/index.html`, or every clean URL 404s on refresh.
Netlify `_redirects`, Vercel `rewrites`, or the GitHub Pages 404 trick.

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

---

## Gotchas — read before touching these

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
LeetCode's `submissionCalendar` arrives as a JSON **string** inside the JSON
response, keyed by UTC-midnight unix seconds — it needs a second parse.

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

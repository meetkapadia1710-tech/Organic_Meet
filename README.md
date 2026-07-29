# Meet Kapadia — portfolio

React 19 + TypeScript, built with Vite. Ten case studies, an archive of
smaller work, and an approach page, on the **Organic** design system (cream
ground, terracotta and sage, Caprasimo over Figtree).

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # typecheck + build → ./site-react
npm run preview   # serve the build on :4174
```

## Layout

| Path | What it is |
| --- | --- |
| `web/content/projects.ts` | **The project list.** What appears, in what order, with what links. |
| `web/content/cases.ts` | The prose of every case study. One entry per slug. |
| `web/content/types.ts` | `Project`, `ProjectLinks`. |
| `web/pages/` | Home, Projects, Approach, CasePage, NotFound. |
| `web/components/` | Layout, Nav, Deck, CommandPalette, SplitText, demos. |
| `web/hooks/` | Motion, keyboard, document meta, transition navigation. |
| `web/state/` | Shared stores: theme, work view, shortcuts sheet. |
| `web/styles/` | The design system plus the site, motion, ui and deck layers. |
| `_archive/` | The previous static build and the rejected design directions. Nothing references it; delete when you're sure. |

## Adding a project

Two files. An archive entry is one object in `projects.ts`:

```ts
{ slug: 'thing', name: 'Thing', year: '2026', tier: 'archive',
  tags: ['React'], summary: 'One sentence.',
  links: { live: 'https://…', repo: 'https://…' } }
```

A case study is that object with `tier: 'case'`, a `category`, and `title` /
`desc` for the `<head>` — plus an entry in `cases.ts` keyed by the same slug
holding the prose. Counters, the next-project chain and the command palette
all derive from the list, so nothing else needs renumbering.

`pending: true` keeps an entry in the data but out of the build.

## Motion

`web/styles/motion.css` and the hooks in `web/hooks/useMotion.ts`. Everything
is progressive enhancement: reveals, split headlines, the cursor, magnetic
buttons, card tilt, gyroscope parallax, scroll-driven timelines. All of it
yields to `prefers-reduced-motion`, and content never depends on an animation
to become visible — reveals and headlines carry a 4-second safety net.

**Page transitions** use the View Transitions API. A project title on the
index morphs into the case-study headline via a shared
`view-transition-name`. The ordering is fragile and documented in
`useTransitionNavigate.ts`: the scroll reset must happen *before* the router
starts the transition, and it must be `behavior: 'instant'` — the stylesheet
sets `scroll-behavior: smooth`, which would otherwise animate the reset long
after the browser has measured both snapshots.

## Command palette

⌘K, Ctrl-K, `/`, or the nav button. Navigates *and* runs commands — theme,
copy email, copy link, print a case study, switch the work view. Commands are
context-sensitive: print only appears on a case study, the view switch only on
the homepage.

## Before it goes live

- [ ] **Prerender the routes.** This is a single-page app: crawlers and link
      previews currently see an empty `<div>`. Walking the route list through
      `react-dom/server` at build time fixes it without changing the
      architecture.
- [ ] **Add an error boundary.** One uncaught error currently means a blank
      page with no way out.
- [ ] **SPA rewrite rule** on the host (`/*` → `/index.html`), or the clean
      URLs 404 on refresh.
- [ ] Replace the image placeholders — every figure is still a striped block.
- [ ] Fill in `links` for the projects that have none.
- [ ] Confirm the ambulance case study's team credit, and PayMatrix's status
      (currently excluded — see the comment in `projects.ts`).

import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';

/* Clean URLs, no extensions anywhere: /, /projects, /approach, /engram.
   The fixed routes (including /contact) come before the case-study route, so
   they match first — :slug is a catch-all for anything else, and it renders
   NotFound itself for a slug with no content behind it. If /contact ever fell
   through to :slug instead, CasePage would fail to find a project called
   "contact" and silently render the 404 page.

   Home ships in the main bundle — it's what every first visit needs, so
   there is nothing to gain and a network round-trip to lose by lazy-loading
   it. Everything reachable only by a click is split into its own chunk: the
   3D deck, the two Stats network calls and their heatmap renderer, the
   table-of-contents/scroll-spy machinery on a case page, all previously
   shipped to a visitor who only ever looked at the homepage.

   The loaders are kept separately from the lazy() wrappers so `prefetchRoute`
   below can warm a chunk on hover/focus without needing a component to
   render — the same trick Next.js and Vercel's own sites use to make a click
   feel instant: the code is usually already sitting in the browser's module
   cache by the time the pointer gets there. */
const loaders = {
  projects: () => import('./pages/Projects'),
  approach: () => import('./pages/Approach'),
  stats: () => import('./pages/Stats'),
  contact: () => import('./pages/Contact'),
  about: () => import('./pages/About'),
  uses: () => import('./pages/Uses'),
  case: () => import('./pages/CasePage'),
  notFound: () => import('./pages/NotFound'),
};

/* Every page is a named export, not a default one — that's the convention
   the rest of this codebase uses throughout, and it isn't worth breaking for
   React.lazy's sake. lazy() needs a `{ default }` shape, so each loader above
   is re-mapped to one here rather than changing how the pages export
   themselves.

   pages/Contact.tsx and components/Contact.tsx both export something named
   `Contact` — the page and the small closing block every other page renders
   at its foot. They're different modules with no import collision, but don't
   let the shared name suggest they're the same thing: the block is untouched
   and still does its own job everywhere else. */
const Projects = lazy(() => loaders.projects().then((m) => ({ default: m.Projects })));
const Approach = lazy(() => loaders.approach().then((m) => ({ default: m.Approach })));
const Stats = lazy(() => loaders.stats().then((m) => ({ default: m.Stats })));
const ContactPage = lazy(() => loaders.contact().then((m) => ({ default: m.Contact })));
const About = lazy(() => loaders.about().then((m) => ({ default: m.About })));
const Uses = lazy(() => loaders.uses().then((m) => ({ default: m.Uses })));
const CasePage = lazy(() => loaders.case().then((m) => ({ default: m.CasePage })));
const NotFound = lazy(() => loaders.notFound().then((m) => ({ default: m.NotFound })));

/** Warms the chunk a path will need, before the click that needs it.
 *  Safe to call repeatedly — a module import() already in flight or done is
 *  cached by the browser, so this never re-fetches. Failures (offline, a
 *  dropped request) are swallowed: worst case is the ordinary Suspense
 *  fallback shows for the click that follows, exactly as if this had never
 *  run. */
export function prefetchRoute(to: string): void {
  const path = to.split(/[?#]/)[0];
  /* A lookup rather than the nested ternary this used to be: at four routes
     that was readable, at seven it was not, and the fall-through to `case`
     for anything unrecognised is the part that has to stay obvious. */
  const fixed: Record<string, (() => Promise<unknown>) | undefined> = {
    '/projects': loaders.projects,
    '/approach': loaders.approach,
    '/stats': loaders.stats,
    '/contact': loaders.contact,
    '/about': loaders.about,
    '/uses': loaders.uses,
  };

  const loader = path ? (fixed[path] ?? (path !== '/' ? loaders.case : undefined)) : undefined;
  loader?.().catch(() => {});
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'projects', element: <Projects /> },
      { path: 'approach', element: <Approach /> },
      { path: 'stats', element: <Stats /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'about', element: <About /> },
      { path: 'uses', element: <Uses /> },
      { path: ':slug', element: <CasePage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

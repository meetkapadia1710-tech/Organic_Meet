import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';

/* Clean URLs, no extensions anywhere: /, /projects, /approach, /engram.
   The case-study route is last so it only catches what the fixed routes
   didn't, and it renders NotFound itself for a slug with no content.

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
  case: () => import('./pages/CasePage'),
  notFound: () => import('./pages/NotFound'),
};

/* Every page is a named export, not a default one — that's the convention
   the rest of this codebase uses throughout, and it isn't worth breaking for
   React.lazy's sake. lazy() needs a `{ default }` shape, so each loader above
   is re-mapped to one here rather than changing how the pages export
   themselves. */
const Projects = lazy(() => loaders.projects().then((m) => ({ default: m.Projects })));
const Approach = lazy(() => loaders.approach().then((m) => ({ default: m.Approach })));
const Stats = lazy(() => loaders.stats().then((m) => ({ default: m.Stats })));
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
  const loader =
    path === '/projects'
      ? loaders.projects
      : path === '/approach'
        ? loaders.approach
        : path === '/stats'
          ? loaders.stats
          : path && path !== '/'
            ? loaders.case
            : null;

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
      { path: ':slug', element: <CasePage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

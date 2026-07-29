import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { Approach } from './pages/Approach';
import { Stats } from './pages/Stats';
import { NotFound } from './pages/NotFound';
import { CasePage } from './pages/CasePage';

/* Clean URLs, no extensions anywhere: /, /projects, /approach, /engram.
   The case-study route is last so it only catches what the fixed routes
   didn't, and it renders NotFound itself for a slug with no content. */
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

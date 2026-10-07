import { renderToString } from 'react-dom/server';
import { Route, Routes, StaticRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { Approach } from './pages/Approach';
import { Stats } from './pages/Stats';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { Uses } from './pages/Uses';
import { CasePage } from './pages/CasePage';
import { NotFound } from './pages/NotFound';

export function render(path: string) {
  return renderToString(
    <StaticRouter basename={import.meta.env.BASE_URL} location={`${import.meta.env.BASE_URL}${path.slice(1)}`}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="approach" element={<Approach />} />
          <Route path="stats" element={<Stats />} />
          <Route path="contact" element={<Contact />} />
          <Route path="about" element={<About />} />
          <Route path="uses" element={<Uses />} />
          <Route path=":slug" element={<CasePage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </StaticRouter>,
  );
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { createAppRouter } from './router';
import './styles/index.css';

const host = document.getElementById('root');
if (!host) throw new Error('#root is missing from index.html');

createRoot(host).render(
  <StrictMode>
    <RouterProvider router={createAppRouter()} />
  </StrictMode>
);

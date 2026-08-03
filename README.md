# Meet Kapadia — Portfolio

A modern, interactive portfolio website for Meet Kapadia. Built with React 19, TypeScript, and Vite, featuring a robust custom design system ("Organic"), smooth page transitions, and an integrated command palette.

![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.3-purple?style=flat-square&logo=vite)

## ✨ Features

- **Organic Design System:** A cohesive visual language utilizing a cream ground, terracotta, and sage color palette, powered by Caprasimo and Figtree typography.
- **View Transitions:** Seamless, native page morphing and transitions utilizing the View Transitions API.
- **Command Palette (⌘K):** Context-aware omnibar for quick navigation, theme toggling, and quick actions like copying contact info or printing case studies.
- **Progressive Enhancement & Motion:** Graceful degradation for motion. Includes scroll-driven timelines, magnetic buttons, text reveals, and parallax effects—all respecting `prefers-reduced-motion`.
- **Dynamic Content Architecture:** A cleanly separated content layer for case studies and an archive of smaller projects.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev       # Available at http://localhost:5173
   ```

3. **Build and preview for production:**
   ```bash
   npm run build     # Typechecks and builds to ./site-react
   npm run preview   # Serves the production build on port 4174
   ```

## 📂 Project Structure

| Path | Description |
| --- | --- |
| `web/content/projects.ts` | **The project list.** Controls what appears, in what order, and handles routing data. |
| `web/content/cases.ts` | The prose content of every case study, mapped by slug. |
| `web/pages/` | Main application routes: Home, Projects, Approach, CasePage, NotFound. |
| `web/components/` | Reusable UI components including Layout, Nav, CommandPalette, and more. |
| `web/hooks/` | Custom React hooks for motion, keyboard events, document meta, and transition navigation. |
| `web/state/` | Shared global state stores for theme, work view, and shortcuts sheet. |
| `web/styles/` | The core design system css including site, motion, ui, and deck layers. |

## 📝 Content Management

### Adding a New Project
Projects are managed across two files. To add a new archive entry, insert an object into the array in `web/content/projects.ts`:

```ts
{ 
  slug: 'thing', 
  name: 'Thing', 
  year: '2026', 
  tier: 'archive',
  tags: ['React'], 
  summary: 'One sentence.',
  links: { live: 'https://…', repo: 'https://…' } 
}
```

To create a full **Case Study**, set `tier: 'case'`, provide a `category`, `title`, and `desc` (for SEO/head meta). Then, add a matching entry in `web/content/cases.ts` using the same slug for the full prose content.

*Note: Use `pending: true` to keep a project entry in the data file but exclude it from the active build.*

## 🎬 Motion & Transitions

All animations are handled via `web/styles/motion.css` and `web/hooks/useMotion.ts`. 
- **View Transitions:** Project titles on the index morph seamlessly into case-study headlines via shared `view-transition-name` properties.
- **Accessibility:** Content visibility never relies solely on animations. A 4-second safety net ensures text reveals and headlines appear even if javascript fails, and all animations yield to OS-level reduced motion settings.

## 📋 Pre-Launch Checklist

- [ ] **Prerender the routes:** Implement static rendering (`react-dom/server`) to ensure link previews and crawlers index content properly (currently an SPA).
- [ ] **Add an error boundary:** Prevent blank pages from uncaught exceptions.
- [ ] **SPA rewrite rules:** Ensure your hosting provider rewrites `/*` to `/index.html` to prevent 404s on refresh.
- [ ] **Asset Replacement:** Replace all striped placeholder figures with production images.
- [ ] **Links:** Complete the `links` object for all projects.
- [ ] **Final Copy Review:** Verify team credits for the ambulance case study and confirm PayMatrix's status.

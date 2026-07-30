import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { toggleTheme, useTheme } from '../state/theme';
import { usePalette } from './CommandPalette';
import { prefetchRoute } from '../router';
import { SwapText } from './SwapText';
import { setDevMode, useDevMode } from '../state/devmode';
import { useLogoTap } from '../hooks/useLogoTap';

/* Padding and the wordmark size live in site.css rather than here, because
   the condensed state past the hero has to override them — and an inline
   style outranks any class, which would have meant `!important` on every
   condensed rule. The resting values are unchanged, just relocated. */
const NAV_STYLE: React.CSSProperties = {
  viewTransitionName: 'site-nav',
  position: 'fixed',
  top: 'var(--space-4)',
  left: 'var(--space-6)',
  right: 'var(--space-6)',
  zIndex: 500,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: 999,
  background: 'color-mix(in srgb, var(--color-surface) 88%, transparent)',
  backdropFilter: 'blur(10px)',
  boxShadow: 'var(--shadow-sm)',
};

/* Padding is in site.css for the same reason as the nav's own — see above.
   `.nav-sheet .nlink` already carried `!important` on its padding to beat the
   old inline value, so the mobile sheet is unaffected either way. */
const LINK_STYLE: React.CSSProperties = {
  color: 'var(--color-text)',
  textDecoration: 'none',
  borderRadius: 999,
};

const SunIcon = () => (
  <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </svg>
);

const MoonIcon = () => (
  <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
  </svg>
);

export function Nav() {
  const theme = useTheme();
  const palette = usePalette();
  const { pathname, hash } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const devMode = useDevMode();
  const logoTap = useLogoTap(() => setDevMode(true));

  // On the homepage "Index" is an in-page jump; anywhere else it's a route.
  const atHome = pathname === '/';

  /* The sheet must not outlive the navigation that was made from it — leaving
     it open over the new page is the classic mobile-menu bug. Hash is in the
     dependency list because "Get in touch" is an in-page jump, which changes
     the hash and nothing else. */
  useEffect(() => setMenuOpen(false), [pathname, hash]);

  /* Escape closes it, and the sheet stops existing entirely once the viewport
     is wide enough to show the links inline — otherwise resizing a desktop
     window down and back up can strand an invisible open sheet holding focus. */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const wide = window.matchMedia('(min-width: 641px)');
    const onWide = () => wide.matches && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    return () => {
      document.removeEventListener('keydown', onKey);
      wide.removeEventListener('change', onWide);
    };
  }, [menuOpen]);

  const links = (
    <>
      {atHome ? (
        <a className="nlink" href="#main" style={LINK_STYLE}><SwapText>Index</SwapText></a>
      ) : (
        <NavLink className="nlink" to="/" viewTransition style={LINK_STYLE}><SwapText>Index</SwapText></NavLink>
      )}
      {/* These four are lazy-loaded routes (see router.tsx); warming the
          chunk on hover/focus is what makes the click land instantly instead
          of pausing on a Suspense fallback. */}
      <NavLink className="nlink nlink-projects" to="/projects" viewTransition style={LINK_STYLE} onPointerEnter={() => prefetchRoute('/projects')} onFocus={() => prefetchRoute('/projects')}><SwapText>Projects</SwapText></NavLink>
      <NavLink className="nlink" to="/about" viewTransition style={LINK_STYLE} onPointerEnter={() => prefetchRoute('/about')} onFocus={() => prefetchRoute('/about')}><SwapText>About</SwapText></NavLink>
      <NavLink className="nlink" to="/approach" viewTransition style={LINK_STYLE} onPointerEnter={() => prefetchRoute('/approach')} onFocus={() => prefetchRoute('/approach')}><SwapText>Approach</SwapText></NavLink>
      <NavLink className="nlink" to="/stats" viewTransition style={LINK_STYLE} onPointerEnter={() => prefetchRoute('/stats')} onFocus={() => prefetchRoute('/stats')}><SwapText>Stats</SwapText></NavLink>
      <NavLink className="nlink" to="/contact" viewTransition style={LINK_STYLE} onPointerEnter={() => prefetchRoute('/contact')} onFocus={() => prefetchRoute('/contact')}><SwapText>Contact</SwapText></NavLink>
    </>
  );

  return (
    <>
      <nav className="site-nav" aria-label="Primary" style={NAV_STYLE}>
        {/* The wordmark is also the mobile door into developer mode — seven
            taps inside five seconds. Taps one to six do nothing, so it keeps
            working as the way home; see useLogoTap. */}
        <Link
          to="/"
          viewTransition
          className="site-brand"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', textDecoration: 'none' }}
          {...logoTap}
        >
          {devMode ? 'organic_meet.exe' : 'Meet Kapadia'}
        </Link>

        {devMode && (
          <span className="dev-badge" title="Esc to exit">
            ● developer mode
          </span>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-1)', fontSize: 14, fontWeight: 600, alignItems: 'center' }}>
          <div className="nav-links" style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
            {links}
          </div>

          <button
            type="button"
            className="theme-toggle"
            data-search=""
            aria-label="Search (press / or Command K)"
            title="Search — / or ⌘K"
            onClick={() => palette.open()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>

          <button
            type="button"
            className="theme-toggle"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={(e) => {
              const box = e.currentTarget.getBoundingClientRect();
              toggleTheme({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
            }}
          >
            <SunIcon />
            <MoonIcon />
          </button>

          <a data-magnetic className="btn btn-primary nav-cta" href="#contact" style={{ borderRadius: 999 }}>
            Get in touch
          </a>

          {/* The narrow-screen replacement for the link row. It used to simply
              hide Approach and Stats, which made two pages unreachable on a
              phone unless you knew about the command palette. */}
          <button
            type="button"
            className="theme-toggle nav-burger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="nav-sheet"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      <div
        id="nav-sheet"
        className={`nav-sheet${menuOpen ? ' is-open' : ''}`}
        hidden={!menuOpen}
      >
        {links}
        <a className="btn btn-primary" href="#contact" style={{ borderRadius: 999, marginTop: 'var(--space-2)' }}>
          Get in touch
        </a>
      </div>
    </>
  );
}

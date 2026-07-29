import { Outlet, useLocation, useNavigationType } from 'react-router';
import { Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { Nav } from './Nav';
import { Footer } from './Footer';
import { Preloader } from './Preloader';
import { PaletteProvider } from './CommandPalette';
import { ShortcutsSheet } from './ShortcutsSheet';
import { RouteFallback } from './RouteFallback';
import { useSiteMotion } from '../hooks/useMotion';
import { useMotionPlus } from '../hooks/useMotionPlus';
import { useKeyboard } from '../hooks/useKeyboard';

/* The persistent shell. Chrome that must survive a navigation — cursor,
   progress bar, preloader, nav — lives above <Outlet />, so a route change
   swaps only the page beneath it. */
function Shell() {
  const { pathname, search } = useLocation();

  useSiteMotion();
  useMotionPlus();
  useKeyboard();

  /* Scroll handling has two jobs that a naive "always scroll to top" gets
     wrong in opposite directions.

     A new page (PUSH) should start at the top, the way a document navigation
     does. Going back or forward (POP) should land where you left — the
     browser does that for free on a real navigation, and losing it is the
     regression a client-side router introduces.

     It has to be useLayoutEffect, not useEffect. React Router performs the
     DOM swap inside document.startViewTransition(), and the browser captures
     the "new" snapshot once that work is committed. A scroll that lands
     after commit happens mid-transition instead, moving the page under the
     snapshot and reducing the shared-element morph — the project title
     growing into the case-study headline — to a plain crossfade. */
  const navigationType = useNavigationType();
  const positions = useRef(new Map<string, number>());

  useLayoutEffect(() => {
    const saved = positions.current;
    const key = `${pathname}${search}`;

    if (navigationType === 'POP') {
      const previous = saved.get(key);
      if (previous != null) window.scrollTo({ top: previous, behavior: 'instant' });
    } else if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    const remember = () => saved.set(key, window.scrollY);
    window.addEventListener('scroll', remember, { passive: true });
    return () => {
      remember();
      window.removeEventListener('scroll', remember);
    };
  }, [pathname, search, navigationType]);

  /* Focus follows the navigation. Without this a keyboard or screen-reader
     user stays parked on the link they just activated, and nothing announces
     that the page changed. Moving focus to the new page's heading container
     is what a real document navigation does implicitly.

     Skipped on first load, where the browser's own focus is correct.

     The guard is "has the path actually changed", not a boolean flipped on
     first run. StrictMode mounts, unmounts and remounts in development, so a
     `firstRender` flag gets spent on the throwaway pass and the real mount
     then focuses — drawing a focus ring around the whole header on a fresh
     page load. Seeding the ref with the current path is idempotent: a
     remount re-seeds it to the same value and still declines to focus. */
  const focusedPath = useRef(pathname);
  useEffect(() => {
    if (focusedPath.current === pathname) return;
    focusedPath.current = pathname;

    const main = document.getElementById('main');
    if (!main) return;
    main.setAttribute('tabindex', '-1');
    main.focus({ preventScroll: true });
    // The tabindex is only there to receive this programmatic focus; leaving
    // it would put the heading into the tab order.
    main.addEventListener('blur', () => main.removeAttribute('tabindex'), { once: true });
  }, [pathname]);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>

      <div id="cursor" aria-hidden="true" />
      <div id="cursor-ring" aria-hidden="true" />
      <div id="cursor-label" aria-hidden="true" />
      <div id="progress" aria-hidden="true" />

      <Preloader />
      <ShortcutsSheet />

      <div className="site-main">
        <Nav />
        {/* Every route past Home is a separate chunk (see router.tsx). This
            boundary only ever shows RouteFallback for a click that outran its
            own hover-prefetch. */}
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
        <Footer />
      </div>
    </>
  );
}

export function Layout() {
  return (
    <PaletteProvider>
      <Shell />
    </PaletteProvider>
  );
}

import type { ReactNode, Ref } from 'react';
import { Link } from 'react-router';
import { useTransitionNavigate } from '../hooks/useTransitionNavigate';
import { prefetchRoute } from '../router';

/* A <Link> that routes through useTransitionNavigate, so the view transition
   and the scroll reset happen in the same frame.

   It stays a real <Link>, so the href is present for middle-click, "open in
   new tab", copy-link and crawlers; the handler only takes over the plain
   left-click that would otherwise navigate in place.

   It also warms the destination's chunk on hover or keyboard focus, before
   any click happens — the difference between a route that pauses to fetch
   itself and one that feels like it was already there. Callers (the 3D deck
   in particular) sometimes supply their own onFocus/onPointerEnter for
   unrelated behaviour — Deck.tsx recentres itself when a card receives
   focus — so both are merged rather than overwritten. */
export function TLink({
  to,
  children,
  ref,
  onClick,
  onFocus,
  onPointerEnter,
  ...rest
}: {
  to: string;
  children: ReactNode;
  ref?: Ref<HTMLAnchorElement>;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLAnchorElement>) => void;
  onPointerEnter?: (e: React.PointerEvent<HTMLAnchorElement>) => void;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick' | 'onFocus' | 'onPointerEnter'>) {
  const go = useTransitionNavigate();

  return (
    <Link
      {...rest}
      to={to}
      ref={ref}
      onPointerEnter={(e) => {
        prefetchRoute(to);
        onPointerEnter?.(e);
      }}
      onFocus={(e) => {
        prefetchRoute(to);
        onFocus?.(e);
      }}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        // Leave the browser's own behaviour alone for anything that isn't a
        // plain left-click.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        go(to);
      }}
    >
      {children}
    </Link>
  );
}

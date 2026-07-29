import type { ReactNode, Ref } from 'react';
import { Link } from 'react-router';
import { useTransitionNavigate } from '../hooks/useTransitionNavigate';

/* A <Link> that routes through useTransitionNavigate, so the view transition
   and the scroll reset happen in the same frame.

   It stays a real <Link>, so the href is present for middle-click, "open in
   new tab", copy-link and crawlers; the handler only takes over the plain
   left-click that would otherwise navigate in place. */
export function TLink({
  to,
  children,
  ref,
  onClick,
  ...rest
}: {
  to: string;
  children: ReactNode;
  ref?: Ref<HTMLAnchorElement>;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'>) {
  const go = useTransitionNavigate();

  return (
    <Link
      {...rest}
      to={to}
      ref={ref}
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

/* Keyboard navigation: ⌘K / Ctrl-K / "/" open search, j/k walk the project
   rows, Enter opens the selected one, g-h and g-p jump, ? shows the sheet.

   The row cursor is re-derived per route because the rows themselves change
   with the page. */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { useTransitionNavigate } from './useTransitionNavigate';
import { usePalette } from '../components/CommandPalette';
import { setSheetOpen, toggleSheet } from '../state/sheet';

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

export function useKeyboard(): void {
  const palette = usePalette();
  const navigate = useTransitionNavigate();
  const { pathname } = useLocation();
  const cursor = useRef(-1);

  // Rows change with the route, so the cursor resets with it.
  useEffect(() => { cursor.current = -1; }, [pathname]);

  useEffect(() => {
    let chord = '';
    let chordTimer: number | null = null;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const select = (next: number) => {
      const rows = Array.from(document.querySelectorAll<HTMLElement>('.work, .arch'));
      if (!rows.length) return;
      rows[cursor.current]?.classList.remove('is-cursor');
      cursor.current = Math.max(0, Math.min(rows.length - 1, next));
      const row = rows[cursor.current];
      if (!row) return;
      row.classList.add('is-cursor');
      row.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
    };

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        palette.open();
        return;
      }
      if (isTyping(e.target) || e.altKey || e.ctrlKey || e.metaKey) return;
      if (palette.isOpen) return;

      if (chord === 'g') {
        chord = '';
        if (chordTimer !== null) window.clearTimeout(chordTimer);
        if (e.key === 'h') { e.preventDefault(); navigate('/'); return; }
        if (e.key === 'p') { e.preventDefault(); navigate('/projects'); return; }
      }

      switch (e.key) {
        case '/': e.preventDefault(); palette.open(); break;
        case '?': e.preventDefault(); toggleSheet(); break;
        case 'Escape': setSheetOpen(false); break;
        case 'j': e.preventDefault(); select(cursor.current + 1); break;
        case 'k': e.preventDefault(); select(cursor.current <= 0 ? 0 : cursor.current - 1); break;
        case 'Enter': {
          const rows = Array.from(document.querySelectorAll<HTMLElement>('.work, .arch'));
          const row = rows[cursor.current];
          if (row?.tagName === 'A') { e.preventDefault(); row.click(); }
          break;
        }
        case 'g':
          chord = 'g';
          chordTimer = window.setTimeout(() => { chord = ''; }, 900);
          break;
        default: break;
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (chordTimer !== null) window.clearTimeout(chordTimer);
    };
  }, [palette, navigate]);

}

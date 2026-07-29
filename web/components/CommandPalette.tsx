/* ─────────────────────────────────────────────────────────────────────────
   CommandPalette — ⌘K / Ctrl-K / "/" / the nav's search button.

   The index is imported from the project data rather than parsed out of a
   <script type="application/json"> tag, which is the one place the React
   port is straightforwardly better than the static build.

   Same fuzzy scoring as before: subsequence matching with bonuses for
   consecutive letters and word boundaries, and an exact substring always
   outranking a scattered match.
   ───────────────────────────────────────────────────────────────────────── */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router';
import { useTransitionNavigate } from '../hooks/useTransitionNavigate';
import { prefetchRoute } from '../router';
import { toggleTheme, useTheme } from '../state/theme';
import { setView, useWorkView, type WorkView } from '../state/view';
import { setSheetOpen } from '../state/sheet';
import { archive, caseStudies } from '../content/projects';

/* An entry is either somewhere to go or something to do. Commands are built
   per-render so they can be sensitive to where you are: "Print this case
   study" only exists on a case study, and the view switch only on the
   homepage, rather than offering things that would silently do nothing. */
type Entry =
  | { kind: 'link'; title: string; subtitle: string; url: string; group: string; keywords: string }
  | {
      kind: 'command';
      title: string;
      subtitle: string;
      group: string;
      keywords: string;
      run: () => void;
      /** Shown in place of the subtitle before the palette closes. */
      done?: string;
    };

const EMAIL = 'kapadiameet07@gmail.com';
const trim = (s: string) => (s.length > 96 ? `${s.slice(0, 93).trimEnd()}…` : s);

function buildLinks(): Entry[] {
  return [
    { kind: 'link', title: 'Home', subtitle: 'Selected work and contact', url: '/', group: 'Pages', keywords: 'index start' },
    { kind: 'link', title: 'All projects', subtitle: `${caseStudies.length} case studies and ${archive.length} more`, url: '/projects', group: 'Pages', keywords: 'work archive everything' },
    { kind: 'link', title: 'Approach', subtitle: 'How I actually work', url: '/approach', group: 'Pages', keywords: 'process method about' },
    { kind: 'link', title: 'Stats', subtitle: 'Contribution activity and practice', url: '/stats', group: 'Pages', keywords: 'github leetcode codolio heatmap contributions numbers' },
    { kind: 'link', title: 'Contact', subtitle: 'Email, GitHub or LinkedIn', url: '/contact', group: 'Pages', keywords: 'email reach hire get in touch' },
    ...caseStudies.map<Entry>((p) => ({
      kind: 'link', title: p.name, subtitle: trim(p.summary), url: `/${p.slug}`,
      group: 'Case studies', keywords: [...p.tags, p.category ?? '', p.year].join(' '),
    })),
    ...archive.map<Entry>((p) => ({
      kind: 'link', title: p.name, subtitle: trim(p.summary), url: '/projects',
      group: 'Also built', keywords: [...p.tags, p.category ?? '', p.year].join(' '),
    })),
    { kind: 'link', title: 'GitHub', subtitle: 'github.com/meetkapadia1710-tech', url: 'https://github.com/meetkapadia1710-tech', group: 'Elsewhere', keywords: 'code source repos profile' },
    { kind: 'link', title: 'LinkedIn', subtitle: 'linkedin.com/in/meet-kapadia17', url: 'https://linkedin.com/in/meet-kapadia17', group: 'Elsewhere', keywords: 'cv resume profile' },
  ];
}

async function copy(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard access is refused outside a secure context, and on http://
    // during local testing. Fall back to a selection-based copy.
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;top:-1000px';
    document.body.appendChild(field);
    field.select();
    try { document.execCommand('copy'); } catch { /* nothing else to try */ }
    field.remove();
  }
}

function buildCommands(pathname: string, theme: string, view: WorkView): Entry[] {
  const onCaseStudy = caseStudies.some((p) => `/${p.slug}` === pathname);
  const onHome = pathname === '/';

  const commands: Entry[] = [
    {
      kind: 'command',
      title: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
      subtitle: 'Currently ' + theme,
      group: 'Commands',
      keywords: 'theme dark light mode appearance toggle',
      // No origin, so it cross-fades rather than wiping from a control that
      // is about to be unmounted with the palette.
      run: () => toggleTheme(),
    },
    {
      kind: 'command',
      title: 'Copy email address',
      subtitle: EMAIL,
      group: 'Commands',
      keywords: 'email contact copy clipboard hire',
      run: () => void copy(EMAIL),
      done: 'Copied to clipboard',
    },
    {
      kind: 'command',
      title: 'Copy link to this page',
      subtitle: 'Share what you are looking at',
      group: 'Commands',
      keywords: 'copy url link share clipboard',
      run: () => void copy(window.location.href),
      done: 'Copied to clipboard',
    },
    {
      kind: 'command',
      title: 'Email me',
      subtitle: 'Opens your mail client',
      group: 'Commands',
      keywords: 'email contact hire write mailto',
      run: () => { window.location.href = `mailto:${EMAIL}`; },
    },
  ];

  if (onHome) {
    commands.push({
      kind: 'command',
      title: view === 'deck' ? 'Show the work as a list' : 'Show the work as a 3D deck',
      subtitle: 'Changes how selected work is displayed',
      group: 'Commands',
      keywords: 'deck list view 3d cards switch layout',
      run: () => setView(view === 'deck' ? 'list' : 'deck'),
    });
  }

  if (onCaseStudy) {
    commands.push({
      kind: 'command',
      title: 'Print this case study',
      subtitle: 'Opens the print dialog',
      group: 'Commands',
      keywords: 'print pdf save export paper',
      // The palette has to be gone before the dialog opens, or it prints too.
      run: () => window.setTimeout(() => window.print(), 60),
    });
  }

  commands.push({
    kind: 'command',
    title: 'Keyboard shortcuts',
    subtitle: 'Everything you can press',
    group: 'Commands',
    keywords: 'keyboard shortcuts keys help hotkeys',
    run: () => setSheetOpen(true),
  });

  return commands;
}

function score(query: string, text: string): { score: number; hits: number[] } | null {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (!q) return { score: 0, hits: [] };

  const exact = t.indexOf(q);
  if (exact !== -1) {
    const hits = Array.from({ length: q.length }, (_, i) => exact + i);
    return { score: 1000 - exact * 2 + (exact === 0 ? 200 : 0), hits };
  }

  let qi = 0;
  let total = 0;
  let streak = 0;
  const found: number[] = [];
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] !== q[qi]) { streak = 0; continue; }
    found.push(i);
    streak++;
    total += 10 + streak * 6;
    if (i === 0 || /[\s\-—·/&]/.test(t[i - 1] ?? '')) total += 18;
    qi++;
  }
  if (qi < q.length) return null;
  return { score: total - (found[0] ?? 0), hits: found };
}

function Highlight({ text, hits }: { text: string; hits: number[] }) {
  if (!hits.length) return <>{text}</>;
  const set = new Set(hits);
  return (
    <>
      {Array.from(text).map((ch, i) =>
        set.has(i) ? <mark key={i}>{ch}</mark> : <span key={i}>{ch}</span>
      )}
    </>
  );
}

interface PaletteApi { open: () => void; close: () => void; isOpen: boolean }
const PaletteContext = createContext<PaletteApi | null>(null);

export function usePalette(): PaletteApi {
  const api = useContext(PaletteContext);
  if (!api) throw new Error('usePalette must be used inside <PaletteProvider>');
  return api;
}

export function PaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const api = useMemo<PaletteApi>(
    () => ({ open: () => setOpen(true), close: () => setOpen(false), isOpen }),
    [isOpen]
  );
  return (
    <PaletteContext.Provider value={api}>
      {children}
      {isOpen && <Palette onClose={() => setOpen(false)} />}
    </PaletteContext.Provider>
  );
}

function Palette({ onClose }: { onClose: () => void }) {
  const { pathname } = useLocation();
  const theme = useTheme();
  const view = useWorkView();

  // Commands come first: with an empty query the palette should open on the
  // things you can do, not on a list of pages the nav already shows.
  const entries = useMemo(
    () => [...buildCommands(pathname, theme, view), ...buildLinks()],
    [pathname, theme, view]
  );

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [flash, setFlash] = useState<{ index: number; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const go_ = useTransitionNavigate();
  const restore = useRef<Element | null>(null);

  const results = useMemo(() => {
    const scored: Array<{ entry: Entry; score: number; hits: number[] }> = [];
    for (const entry of entries) {
      const byTitle = score(query, entry.title);
      if (byTitle) { scored.push({ entry, score: byTitle.score, hits: byTitle.hits }); continue; }
      const byKeyword = score(query, entry.keywords);
      if (byKeyword) scored.push({ entry, score: byKeyword.score * 0.4, hits: [] });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 12);
  }, [entries, query]);

  useEffect(() => { setActive(0); }, [query]);

  // Focus in, scroll locked, focus restored on the way out.
  useEffect(() => {
    restore.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
      (restore.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  const go = useCallback(
    (index: number) => {
      const chosen = results[index];
      if (!chosen) return;
      const { entry } = chosen;

      if (entry.kind === 'link') {
        onClose();
        if (/^(https?:|mailto:)/.test(entry.url)) window.open(entry.url, '_blank', 'noopener');
        else go_(entry.url);
        return;
      }

      entry.run();

      // A command that produced something invisible — a clipboard write —
      // needs to say so, or you press it twice wondering if it worked.
      if (entry.done) {
        setFlash({ index, text: entry.done });
        window.setTimeout(onClose, 850);
        return;
      }
      onClose();
    },
    [results, go_, onClose]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % Math.max(results.length, 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + results.length) % Math.max(results.length, 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(active); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'Tab') e.preventDefault();
  };

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  // Arrowing onto a result warms its chunk, so pressing Enter a moment later
  // never pauses on the Suspense fallback — the same hover-prefetch TLink and
  // Nav do, triggered by keyboard highlight instead of a pointer.
  useEffect(() => {
    const entry = results[active]?.entry;
    if (entry?.kind === 'link' && !/^(https?:|mailto:)/.test(entry.url)) prefetchRoute(entry.url);
  }, [active, results]);

  let lastGroup: string | null = null;

  return (
    <div
      className="cmdk-backdrop is-open"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="cmdk" role="dialog" aria-modal="true" aria-label="Search" onKeyDown={onKeyDown}>
        <div className="cmdk-field">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            className="cmdk-input"
            type="text"
            placeholder="Search or run a command…"
            aria-label="Search pages and projects, or run a command"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-list"
            aria-activedescendant={results.length ? `cmdk-opt-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="cmdk-hint">Esc</span>
        </div>

        <ul className="cmdk-list" id="cmdk-list" role="listbox" ref={listRef}>
          {!results.length && <li className="cmdk-empty">Nothing matches “{query}”</li>}
          {results.map((result, i) => {
            const header = result.entry.group !== lastGroup ? result.entry.group : null;
            lastGroup = result.entry.group;
            const confirmed = flash?.index === i;
            return (
              <li key={`${result.entry.group}:${result.entry.title}`}>
                {header && <div className="cmdk-group" aria-hidden="true">{header}</div>}
                <div
                  className="cmdk-item"
                  role="option"
                  id={`cmdk-opt-${i}`}
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(i)}
                >
                  <span className="cmdk-item-title">
                    <Highlight text={result.entry.title} hits={result.hits} />
                  </span>
                  <span
                    className="cmdk-item-sub"
                    style={confirmed ? { color: 'var(--color-accent-700)', fontWeight: 600 } : undefined}
                  >
                    {confirmed ? `${flash.text} ✓` : result.entry.subtitle}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}


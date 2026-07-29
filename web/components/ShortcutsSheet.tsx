import { useEffect } from 'react';
import { setSheetOpen, useSheetOpen } from '../state/sheet';

export const SHORTCUTS: Array<[string, string[]]> = [
  ['Open search', ['⌘', 'K']],
  ['Open search', ['/']],
  ['Next project', ['j']],
  ['Previous project', ['k']],
  ['Open selected', ['Enter']],
  ['Go home', ['g', 'h']],
  ['Go to projects', ['g', 'p']],
  ['This sheet', ['?']],
];

export function ShortcutsSheet() {
  const open = useSheetOpen();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="cmdk-backdrop is-open"
      data-keys=""
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setSheetOpen(false);
      }}
    >
      <div className="cmdk" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
        <div className="cmdk-field">
          <span className="cmdk-item-title">Keyboard shortcuts</span>
          <span className="cmdk-hint">Esc</span>
        </div>
        <dl className="keys" style={{ padding: 'var(--space-6)' }}>
          {SHORTCUTS.map(([label, keys], i) => (
            <div className="keys-row" key={`${label}-${i}`}>
              <dt>{label}</dt>
              <dd>
                {keys.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

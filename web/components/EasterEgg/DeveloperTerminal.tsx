/* ─────────────────────────────────────────────────────────────────────────
   DeveloperTerminal — ⌘/Ctrl + `

   A real small shell rather than a prop: history recall on ↑/↓, Tab
   completion, unknown commands that say so. The things that make a fake
   terminal annoying are all absences, and they are cheap to fill in.

   Accessibility is the part a terminal usually gets wrong. This one is a
   labelled dialog, the output is a polite live region so a screen reader
   hears the response to what was just typed, and focus is trapped to the
   input while it is open — there is nothing else in here to tab to.
   ───────────────────────────────────────────────────────────────────────── */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTransitionNavigate } from '../../hooks/useTransitionNavigate';
import { setDevMode, setTerminalOpen } from '../../state/devmode';
import { commandNames, run, type Line } from './commands';
import { SecretQuotes } from './SecretQuotes';

interface Block {
  input: string;
  lines: Line[];
}

const BANNER: Line[] = [
  { text: 'organic shell · v1.0', tone: 'accent' },
  { text: "Type `help` for commands, Esc to close.", tone: 'muted' },
];

export function DeveloperTerminal() {
  const navigate = useTransitionNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [value, setValue] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  // -1 means "composing a new line", not browsing history.
  const [cursor, setCursor] = useState(-1);

  const names = useMemo(() => commandNames(), []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Follow the output as it grows.
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [blocks]);

  const submit = () => {
    const input = value;
    setValue('');
    setCursor(-1);
    if (input.trim()) setHistory((h) => [input, ...h]);

    const outcome = run(input, {
      navigate: (to) => {
        setTerminalOpen(false);
        navigate(to);
      },
      open: (url) => window.open(url, '_blank', 'noopener,noreferrer'),
    });

    if (outcome.kind === 'clear') {
      setBlocks([]);
      return;
    }
    if (outcome.kind === 'exit') {
      setTerminalOpen(false);
      setDevMode(false);
      return;
    }
    setBlocks((b) => [...b, { input, lines: outcome.lines }]);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
      return;
    }

    /* Escape is deliberately *not* handled here. DeveloperMode owns it with a
       single document-level listener that closes the terminal if it is open
       and otherwise leaves the garden. Handling it in both places meant
       reasoning about whether React's synthetic event reached the document
       listener before or after this one — and getting it wrong dismissed both
       layers on one keypress. */

    if (e.key === 'Tab') {
      e.preventDefault();
      const partial = value.trim().toLowerCase();
      if (!partial) return;
      const match = names.find((n) => n.startsWith(partial));
      if (match) setValue(match);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(cursor + 1, history.length - 1);
      if (next >= 0) {
        setCursor(next);
        setValue(history[next] ?? '');
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = cursor - 1;
      setCursor(next);
      setValue(next < 0 ? '' : history[next] ?? '');
    }
  };

  return (
    <div
      className="devterm"
      role="dialog"
      aria-modal="false"
      aria-label="Developer terminal"
    >
      <div className="devterm-bar">
        <span className="devterm-dot" aria-hidden="true" />
        <span className="devterm-title">meet@organic — organic shell</span>
        <button
          type="button"
          className="devterm-close"
          aria-label="Close terminal"
          onClick={() => setTerminalOpen(false)}
        >
          ✕
        </button>
      </div>

      <div className="devterm-body" ref={scrollRef}>
        <div className="devterm-out" aria-live="polite">
          {BANNER.map((line, i) => (
            <div key={`banner-${i}`} className={`devterm-line tone-${line.tone ?? 'plain'}`}>
              {line.text || ' '}
            </div>
          ))}

          {blocks.map((block, bi) => (
            <div key={bi}>
              <div className="devterm-line tone-echo">
                <span className="devterm-prompt">meet@organic:~$</span> {block.input}
              </div>
              {block.lines.map((line, li) => (
                <div key={li} className={`devterm-line tone-${line.tone ?? 'plain'}`}>
                  {line.text || ' '}
                </div>
              ))}
            </div>
          ))}
        </div>

        <label className="devterm-input-row">
          <span className="devterm-prompt" aria-hidden="true">meet@organic:~$</span>
          <span className="sr-only">Terminal command</span>
          <input
            ref={inputRef}
            className="devterm-input"
            value={value}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </label>
      </div>

      {/* A persistent status line, like a shell's. It was inside the scrolling
          body at first, which meant it vanished the moment the first command
          pushed it off the top — visible for about four seconds, ever. */}
      <div className="devterm-foot">
        <SecretQuotes />
      </div>
    </div>
  );
}

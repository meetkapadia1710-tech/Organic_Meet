import { Fragment, useEffect, useRef, useState } from 'react';

/* Headlines rise word by word out of a mask. The mask/inner pair and the
   --i stagger index are exactly what motion.css already styles, so this is
   the same animation the static site runs — only the wrapping moved from a
   startup script into the render.

   Above the fold it lights on the next frame; lower down it waits for the
   viewport, with the same 4s safety net so a headline can never stay hidden
   because an observer didn't fire. */

/* `as` used to be React's `ElementType`, which broke the moment
   @react-three/fiber was added: R3F augments the global JSX namespace with
   every Three.js object, so `ElementType` started including `<mesh>`,
   `<points>` and the rest. TypeScript then tried to find props valid for
   *all* of them at once and collapsed `children`, `ref`, `className` and
   `style` to `never`.

   Narrowing to the tags this is actually used with fixes that, and is more
   honest besides — it was never meant to render arbitrary components. */
type SplitTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';

export function SplitText({
  as = 'h1',
  text,
  className,
  style,
  lift = false,
  ...rest
}: {
  as?: SplitTag;
  text: string;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Split each word into characters as well, so `useCursorLift` has something
   * per-letter to move. Opt-in and used only by the hero — every other
   * headline keeps the exact word-level markup it already had.
   *
   * Per-character spans make some screen readers spell the line out, so this
   * also puts the string on `aria-label` and hides the split from the
   * accessibility tree. Selection and copy still yield clean text, because
   * the characters are ordinary inline spans.
   */
  lift?: boolean;
} & Record<string, unknown>) {
  /* Pinned to one concrete tag for typing only; the runtime value is
     whatever `as` was. Every tag in SplitTag takes the same className/style/
     ref shape, so the substitution is safe. */
  const Tag = as as 'h1';
  const ref = useRef<HTMLHeadingElement>(null);
  const [lit, setLit] = useState(false);
  const words = text.trim().split(/\s+/);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setLit(true); return; }

    if (el.getBoundingClientRect().top < window.innerHeight) {
      const frame = requestAnimationFrame(() => setLit(true));
      return () => cancelAnimationFrame(frame);
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) { setLit(true); io.disconnect(); }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    const net = window.setTimeout(() => setLit(true), 4000);
    return () => { io.disconnect(); window.clearTimeout(net); };
  }, [text]);

  return (
    <Tag
      ref={ref}
      // Only when split to characters — at word level the markup already
      // reads correctly, and an aria-label there would be redundant.
      {...(lift ? { 'aria-label': text } : {})}
      className={[className, lit ? 'is-lit' : null].filter(Boolean).join(' ')}
      style={style}
      {...rest}
    >
      {words.map((word, i) => (
        // The space belongs between the masks, not inside one — a mask is
        // overflow:hidden, and a trailing space in there collapses the gap.
        <Fragment key={`${word}-${i}`}>
          <span className="split">
            <span style={{ '--i': i } as React.CSSProperties}>
              {/* `lift` nests a per-character layer *inside* the word span
                  rather than replacing it. The reveal keeps animating the
                  word (this span); useCursorLift writes `--lift` to the
                  characters one level down. Two different elements, so the
                  transforms compose instead of overwriting each other, and
                  the reveal is untouched. */}
              {lift
                ? Array.from(word).map((char, c) => (
                    <span key={c} className="lift-char">
                      {char}
                    </span>
                  ))
                : word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}

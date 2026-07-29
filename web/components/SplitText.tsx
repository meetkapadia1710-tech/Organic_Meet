import { Fragment, useEffect, useRef, useState, type ElementType } from 'react';

/* Headlines rise word by word out of a mask. The mask/inner pair and the
   --i stagger index are exactly what motion.css already styles, so this is
   the same animation the static site runs — only the wrapping moved from a
   startup script into the render.

   Above the fold it lights on the next frame; lower down it waits for the
   viewport, with the same 4s safety net so a headline can never stay hidden
   because an observer didn't fire. */
export function SplitText({
  as: Tag = 'h1',
  text,
  className,
  style,
  ...rest
}: {
  as?: ElementType;
  text: string;
  className?: string;
  style?: React.CSSProperties;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
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
      className={[className, lit ? 'is-lit' : null].filter(Boolean).join(' ')}
      style={style}
      {...rest}
    >
      {words.map((word, i) => (
        // The space belongs between the masks, not inside one — a mask is
        // overflow:hidden, and a trailing space in there collapses the gap.
        <Fragment key={`${word}-${i}`}>
          <span className="split">
            <span style={{ '--i': i } as React.CSSProperties}>{word}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}

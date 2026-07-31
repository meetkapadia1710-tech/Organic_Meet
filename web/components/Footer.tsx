import { useEffect, useState } from 'react';
import { TLink } from './TLink';
import { prefetchRoute } from '../router';
import { SOCIAL } from '../content/site';

/** The owner's clock, not the visitor's — Asia/Kolkata regardless of where
 *  the page is being read. */
function useIndiaTime(): string {
  const [time, setTime] = useState('—');

  useEffect(() => {
    const tick = () => {
      try {
        setTime(
          new Date().toLocaleTimeString('en-GB', {
            timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit',
          })
        );
      } catch {
        /* engine without full ICU — leave the em dash */
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return time;
}

export function Footer() {
  const time = useIndiaTime();
  return (
    <footer
      className="site-footer"
      style={{
        maxWidth: 'var(--page-max)', margin: '0 auto',
        padding: '0 var(--gutter) var(--space-8)',
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap',
        gap: 'var(--space-3)', fontSize: 13, color: 'var(--color-neutral-700)',
      }}
    >
      <span>Designed &amp; developed by Meet Kapadia</span>
      {/* Secondary pages live here rather than in the nav pill, which is
          already carrying six items plus three controls before anything is
          added to it. /uses in particular is a page people arrive at from
          elsewhere, not one they hunt for in a navbar. */}
      <span style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <TLink to="/about" onPointerEnter={() => prefetchRoute('/about')}>About</TLink>
        <TLink to="/uses" onPointerEnter={() => prefetchRoute('/uses')}>Uses</TLink>
        <a href={SOCIAL.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </span>
      <span>Bharuch, Gujarat — {time} IST</span>
      <span>© 2026</span>
    </footer>
  );
}

import { useEffect, useState } from 'react';

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
        maxWidth: 1400, margin: '0 auto',
        padding: '0 var(--space-8) var(--space-8)',
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap',
        gap: 'var(--space-3)', fontSize: 13, color: 'var(--color-neutral-700)',
      }}
    >
      <span>Designed &amp; developed by Meet Kapadia</span>
      <span>Bharuch, Gujarat — {time} IST</span>
      <span>© 2026</span>
    </footer>
  );
}

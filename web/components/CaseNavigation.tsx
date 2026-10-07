import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

export function CaseNavigation({ sections }: { sections: Array<{ id: string; label: string }> }) {
  const { pathname } = useLocation();
  const [active, setActive] = useState(sections[0]?.id ?? '');
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const targets = sections.map(({ id }) => document.getElementById(id)).filter((node): node is HTMLElement => !!node);
    if (!targets.length || typeof IntersectionObserver !== 'function') return;
    const update = () => {
      let current = targets[0]!;
      for (const target of targets) if (target.getBoundingClientRect().top <= innerHeight * 0.35) current = target;
      setActive(current.id);
    };
    const observer = new IntersectionObserver(update, { rootMargin: '-15% 0px -55% 0px', threshold: [0, 1] });
    targets.forEach((target) => observer.observe(target));
    update();
    return () => observer.disconnect();
  }, [pathname, sections]);
  const links = sections.map(({ id, label }, index) =>
    <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined}
      onClick={() => { if (details.current) details.current.open = false; }}>
      <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{label}
    </a>);
  return <nav className="case-navigation" aria-label="Case study sections">
    <div className="case-section-links case-section-desktop">{links}</div>
    <details ref={details}>
      <summary>In this case study <span aria-hidden="true">+</span></summary>
      <div className="case-section-links">{links}</div>
    </details>
  </nav>;
}

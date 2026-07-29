/* The 3D work deck. Same maths as the static build: each card's place is a
   pure function of its distance from the active one, written to custom
   properties that deck.css turns into transforms. No layout is read in any
   pointer or wheel handler.

   Real 3D — one perspective camera, a stage rotating inside it, and cards
   whose contents sit at different translateZ values, so they separate as the
   camera turns. */

import { useCallback, useEffect, useRef, useState } from 'react';
import { TLink } from './TLink';
import type { Project } from '../content/types';
import { Tags } from './WorkRow';

export function Deck({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<Array<HTMLAnchorElement | null>>([]);
  const drag = useRef({ on: false, captured: false, startX: 0, moved: 0 });

  const go = useCallback(
    (next: number) => setActive((a) => Math.max(0, Math.min(projects.length - 1, next === -1 ? a : next))),
    [projects.length]
  );

  /* Position every card from the active index. */
  const layout = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    // Spread scales with the viewport: a fixed offset that reads as a neat
    // stack at 1280px leaves neighbours bleeding through the active card on
    // a phone.
    const width = viewport.clientWidth;
    const spread = width < 720 ? Math.max(190, width * 0.62) : 210;
    const depth = width < 720 ? 300 : 230;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      const d = i - active;
      const abs = Math.abs(d);
      const state = abs === 0 ? 'active' : abs <= 2 ? 'side' : 'far';

      card.style.setProperty('--x', String(Math.round(d * spread)));
      card.style.setProperty('--z', String(-Math.min(abs, 3) * depth));
      card.style.setProperty('--y', String(abs * 8));
      card.style.setProperty('--ry', String(d * -26));
      card.style.setProperty('--s', String(1 - Math.min(abs, 3) * 0.06));
      card.style.zIndex = String(100 - abs);
      card.dataset['state'] = state;
      card.setAttribute('tabindex', state === 'far' ? '-1' : '0');
      card.setAttribute('aria-hidden', state === 'far' ? 'true' : 'false');
    });
  }, [active]);

  useEffect(() => { layout(); }, [layout]);

  useEffect(() => {
    let timer: number | null = null;
    const onResize = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(layout, 150);
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [layout]);

  /* Only horizontal wheel intent steers the deck — vertical scrolling has to
     keep scrolling the page, or the deck becomes a scroll trap. */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let locked = false;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (locked) return;
      locked = true;
      setActive((a) => Math.max(0, Math.min(projects.length - 1, a + (e.deltaX > 0 ? 1 : -1))));
      window.setTimeout(() => { locked = false; }, 320);
    };
    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', onWheel);
  }, [projects.length]);

  const onPointerMove = (e: React.PointerEvent) => {
    const viewport = viewportRef.current;
    const stage = stageRef.current;
    if (!viewport || !stage) return;

    if (drag.current.on) {
      drag.current.moved = e.clientX - drag.current.startX;

      /* Capture only once the pointer has actually travelled. Capturing on
         pointerdown retargets every subsequent event — including the click —
         to the viewport, so the card's own anchor never sees it and the deck
         stops being clickable at all. */
      if (!drag.current.captured && Math.abs(drag.current.moved) > 6) {
        drag.current.captured = true;
        viewport.classList.add('is-dragging');
        try { viewport.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
      }

      if (Math.abs(drag.current.moved) > 90) {
        setActive((a) => Math.max(0, Math.min(projects.length - 1, a + (drag.current.moved < 0 ? 1 : -1))));
        drag.current.startX = e.clientX;
        drag.current.moved = 0;
      }
      return;
    }

    const box = viewport.getBoundingClientRect();
    const nx = (e.clientX - box.left) / box.width - 0.5;
    const ny = (e.clientY - box.top) / box.height - 0.5;
    viewport.classList.add('is-tracking');
    stage.style.setProperty('--yaw', (nx * 16).toFixed(2));
    stage.style.setProperty('--pitch', (-ny * 10).toFixed(2));
  };

  return (
    <div className="deck is-on" aria-roledescription="carousel" aria-label="Selected work, 3D view">
      <div
        className="deck-viewport"
        ref={viewportRef}
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          const viewport = viewportRef.current;
          const stage = stageRef.current;
          viewport?.classList.remove('is-tracking');
          stage?.style.setProperty('--yaw', '0');
          stage?.style.setProperty('--pitch', '0');
        }}
        onPointerDown={(e) => {
          // No capture yet — see the pointermove handler.
          drag.current = { on: true, captured: false, startX: e.clientX, moved: 0 };
        }}
        onPointerUp={(e) => {
          drag.current.on = false;
          viewportRef.current?.classList.remove('is-dragging');
          if (drag.current.captured) {
            try { viewportRef.current?.releasePointerCapture(e.pointerId); } catch { /* already released */ }
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
          else if (e.key === 'Home') { e.preventDefault(); go(0); }
          else if (e.key === 'End') { e.preventDefault(); go(projects.length - 1); }
        }}
      >
        <div className="deck-stage" ref={stageRef}>
          <div className="deck-floor" aria-hidden="true" />
          {projects.map((project, i) => (
            <TLink
              key={project.slug}
              className="deck-card"
              data-cursor="View case"
              to={`/${project.slug}`}
              ref={(node) => { cardsRef.current[i] = node; }}
              onClick={(e) => {
                // A click that followed a drag is not a click. Otherwise every
                // card opens its case study — centring a side card first and
                // making you click again was the wrong call: a card that looks
                // like a link should behave like one.
                if (Math.abs(drag.current.moved) > 8) { e.preventDefault(); return; }
              }}
              onFocus={() => { if (i !== active) setActive(i); }}
            >
              <span className="deck-num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="deck-title">{project.name}</h3>
              <p className="deck-summary">
                {project.summary.length > 112 ? `${project.summary.slice(0, 109).trimEnd()}…` : project.summary}
              </p>
              <div className="deck-tags"><Tags tags={project.tags} /></div>
              <span className="deck-go">Case study →</span>
            </TLink>
          ))}
        </div>
      </div>

      <div className="deck-controls">
        <button type="button" data-deck="prev" aria-label="Previous project" onClick={() => go(active - 1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
        </button>
        <span className="deck-count" aria-live="polite">
          {String(active + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
        </span>
        <button type="button" data-deck="next" aria-label="Next project" onClick={() => go(active + 1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg>
        </button>
      </div>
      <p className="deck-hint">Drag, arrow keys, or move your pointer to look around.</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   WorkPreview — a thumbnail that follows the pointer across the work list.

   One element for the whole list, not one per row. Rows are delegated to via
   a single listener on the list container, so adding a sixth project costs
   nothing and there is only ever one thing being positioned per frame.

   **Every row gets a preview, including the ones with no screenshot.** Three
   of the five featured projects (Engram, DealAI Agent, LocateMe) have no
   image in `public/` at all. Showing a panel on two rows and nothing on the
   other three makes the hover read as broken rather than as sparse, so the
   imageless rows get a typographic card in the heading face instead. When a
   screenshot arrives, adding `preview:` to the entry in projects.ts is the
   only change needed.

   Fine pointers only — there is no hover on a touchscreen, and a preview
   that appears on tap would fight the navigation the tap is trying to do.
   Off entirely under reduced motion.
   ───────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from 'react';
import type { Project } from '../content/types';

/** Panel size, and how far above the cursor it rides.
 *  The offset clears the cursor label puck, which grows to a 104px circle
 *  centred on the pointer when it is over a row carrying `data-cursor`. */
const OFFSET_Y = -196;
const OFFSET_X = 54;
/** Lower than the ring's 0.16 — the panel should trail the pointer, not be
 *  glued to it, or the parallax between the two reads as one stiff object. */
const EASE = 0.12;

interface Shown {
  slug: string;
  name: string;
  src: string | undefined;
}

export function WorkPreview({ projects }: { projects: Project[] }) {
  const [shown, setShown] = useState<Shown | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const list = document.querySelector<HTMLElement>('.work-list');
    const el = panel.current;
    if (!list || !el) return;

    const bySlug = new Map(projects.map((p) => [p.slug, p]));

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    let placed = false;

    const frame = () => {
      x += (targetX - x) * EASE;
      y += (targetY - y) * EASE;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = Math.abs(targetX - x) > 0.2 || Math.abs(targetY - y) > 0.2 ? requestAnimationFrame(frame) : 0;
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX + OFFSET_X;
      targetY = e.clientY + OFFSET_Y;
      /* The first move after entering a row jumps the panel into place
         rather than easing it in from wherever the last row left it — an
         empty panel sliding across the screen is more distracting than the
         thing it is previewing. */
      if (!placed) {
        placed = true;
        x = targetX;
        y = targetY;
      }
      wake();
    };

    const onOver = (e: PointerEvent) => {
      const row = (e.target as Element | null)?.closest?.('.work');
      if (!row) return;
      const slug = row.getAttribute('href')?.replace(/^\//, '') ?? '';
      const project = bySlug.get(slug);
      if (!project) return;
      setShown((prev) => (prev?.slug === project.slug ? prev : { slug: project.slug, name: project.name, src: project.preview }));
    };

    const onLeave = () => {
      setShown(null);
      placed = false;
    };

    list.addEventListener('pointerover', onOver);
    list.addEventListener('pointermove', onMove, { passive: true });
    list.addEventListener('pointerleave', onLeave);

    return () => {
      list.removeEventListener('pointerover', onOver);
      list.removeEventListener('pointermove', onMove);
      list.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [projects]);

  return (
    <div ref={panel} className={`wprev${shown ? ' is-on' : ''}`} aria-hidden="true">
      {shown?.src ? (
        <img src={shown.src} alt="" width={320} height={170} loading="lazy" decoding="async" />
      ) : (
        <span className="wprev-name">{shown?.name ?? ''}</span>
      )}
    </div>
  );
}

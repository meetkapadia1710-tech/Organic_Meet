import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../lib/assets';
import { useMotionPreference } from '../state/motion';
import type { Project } from '../content/types';

/** One scoped, supplementary preview. Keyboard positioning is independent of the pointer. */
export function WorkPreview({ projects }: { projects: Project[] }) {
  const reduced = useMotionPreference();
  const panel = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<Project | null>(null);
  const [ready, setReady] = useState<string | null>(null);
  useEffect(() => {
    const el = panel.current;
    const list = el?.closest('section')?.querySelector<HTMLElement>('.work-list');
    if (!el || !list || reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setShown(null); return;
    }
    let sequence = 0; let frame = 0; let keyboard = false; let placed = false;
    let x = 0; let y = 0; let targetX = 0; let targetY = 0;
    const position = (left: number, top: number) => {
      targetX = Math.max(16, Math.min(left, innerWidth - el.offsetWidth - 16));
      targetY = Math.max(16, Math.min(top, innerHeight - el.offsetHeight - 16));
      if (!placed || keyboard) { x = targetX; y = targetY; placed = true; }
      const tick = () => {
        x += (targetX - x) * .18; y += (targetY - y) * .18;
        el.style.transform = `translate3d(${x}px,${y}px,0)`;
        frame = Math.abs(x - targetX) + Math.abs(y - targetY) > .5 ? requestAnimationFrame(tick) : 0;
      };
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const show = (row: Element) => {
      const project = projects.find((item) => item.slug === (row as HTMLElement).dataset.project);
      if (!project) return;
      const request = ++sequence;
      setShown(project); setReady(null);
      if (project.preview) {
        const image = new Image(); image.src = assetUrl(project.preview);
        image.decode().then(() => { if (sequence === request) setReady(image.src); }).catch(() => {});
      }
    };
    const over = (event: PointerEvent) => {
      if (keyboard) return;
      const row = (event.target as Element).closest('.work');
      if (row && !row.contains(event.relatedTarget as Node | null)) show(row);
    };
    const move = (event: PointerEvent) => {
      if (!keyboard) position(event.clientX + 42, event.clientY - 190);
    };
    const hide = () => { sequence++; setShown(null); placed = false; if (frame) cancelAnimationFrame(frame); frame = 0; };
    const leave = () => { if (!keyboard) hide(); };
    const focus = (event: FocusEvent) => {
      const row = (event.target as Element).closest('.work');
      if (!row || !row.matches(':focus-visible')) return;
      keyboard = true; show(row);
      const box = row.getBoundingClientRect();
      const above = box.top - el.offsetHeight - 12;
      const below = box.bottom + 12;
      if (above >= 16) position(box.right - el.offsetWidth - 20, above);
      else if (below + el.offsetHeight <= innerHeight - 16) position(box.right - el.offsetWidth - 20, below);
      else hide(); // Inline artwork remains available when neither gap fits.
    };
    const blur = () => { keyboard = false; hide(); };
    list.addEventListener('pointerover', over);
    list.addEventListener('pointermove', move, { passive: true });
    list.addEventListener('pointerleave', leave);
    list.addEventListener('focusin', focus);
    list.addEventListener('focusout', blur);
    return () => {
      sequence++; if (frame) cancelAnimationFrame(frame);
      list.removeEventListener('pointerover', over); list.removeEventListener('pointermove', move);
      list.removeEventListener('pointerleave', leave); list.removeEventListener('focusin', focus); list.removeEventListener('focusout', blur);
    };
  }, [projects, reduced]);
  return <div ref={panel} className={`wprev${shown ? ' is-on' : ''}`} aria-hidden="true">
    {ready ? <img key={ready} src={ready} alt="" width={320} height={180} /> : <span className="wprev-name">{shown?.name ?? ''}</span>}
    <span className="wprev-caption">{shown?.name} <span>View case ↗</span></span>
  </div>;
}

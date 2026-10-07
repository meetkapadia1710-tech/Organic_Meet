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
  const [slide, setSlide] = useState({ index: 0, total: 1 });
  useEffect(() => {
    const el = panel.current;
    const list = el?.closest('section')?.querySelector<HTMLElement>('.work-list');
    if (!el || !list || reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setShown(null); return;
    }
    let sequence = 0; let frame = 0; let timer = 0; let keyboard = false; let placed = false;
    let focusedRow: Element | null = null;
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
      window.clearTimeout(timer);
      const request = ++sequence;
      setShown(project); setReady(null); setSlide({ index: 0, total: 1 });
      const display = async (src: string, index: number, total: number) => {
        const image = new Image(); image.src = assetUrl(src);
        try {
          await image.decode();
          if (sequence === request) { setReady(image.src); setSlide({ index, total }); }
        } catch { /* Keep the previous decoded screenshot on a failed slide. */ }
      };
      // Load only the selected project's first image immediately. Case data
      // stays in a lazy chunk; no gallery requests run after hover ends.
      const initial = project.preview ? display(project.preview, 0, 1) : Promise.resolve();
      void (async () => {
        await initial;
        try {
          const { cases } = await import('../content/cases');
          if (sequence !== request) return;
          const content = cases[project.slug];
          const sources = [...new Set([
            project.preview?.replace(/-800\.webp$/, '.webp'),
            content?.heroImage?.src,
            ...(content?.figureImages ?? []).map((image) => image?.src),
            ...(content?.gallery ?? []).map((image) => image.src),
          ].filter((src): src is string => !!src))];
          const previews = sources.map((src) => src.endsWith('.webp') ? src.replace(/\.webp$/, '-800.webp') : src);
          if (previews.length < 2) return;
          setSlide({ index: 0, total: previews.length });
          let index = 0;
          const advance = async () => {
            if (sequence !== request) return;
            index = (index + 1) % previews.length;
            await display(previews[index]!, index, previews.length);
            if (sequence === request) timer = window.setTimeout(() => { void advance(); }, 2600);
          };
          timer = window.setTimeout(() => { void advance(); }, 2600);
        } catch { /* The first preview remains usable if the lazy chunk fails. */ }
      })();
    };
    const over = (event: PointerEvent) => {
      if (keyboard) return;
      const row = (event.target as Element).closest('.work');
      if (row && !row.contains(event.relatedTarget as Node | null)) show(row);
    };
    const move = (event: PointerEvent) => {
      if (!keyboard) position(event.clientX + 42, event.clientY - 190);
    };
    const hide = () => { sequence++; window.clearTimeout(timer); setShown(null); placed = false; if (frame) cancelAnimationFrame(frame); frame = 0; };
    const leave = () => { if (!keyboard) hide(); };
    const placeFocused = () => {
      if (!keyboard || !focusedRow) return;
      const box = focusedRow.getBoundingClientRect();
      const above = box.top - el.offsetHeight - 12;
      const below = box.bottom + 12;
      if (above >= 16) position(box.right - el.offsetWidth - 20, above);
      else if (below + el.offsetHeight <= innerHeight - 16) position(box.right - el.offsetWidth - 20, below);
      else hide();
    };
    const focus = (event: FocusEvent) => {
      const row = (event.target as Element).closest('.work');
      if (!row || !row.matches(':focus-visible')) return;
      keyboard = true; focusedRow = row; show(row); placeFocused();
    };
    const blur = () => { keyboard = false; focusedRow = null; hide(); };
    window.addEventListener('scroll', placeFocused, { passive: true });
    window.addEventListener('resize', placeFocused);
    list.addEventListener('pointerover', over);
    list.addEventListener('pointermove', move, { passive: true });
    list.addEventListener('pointerleave', leave);
    list.addEventListener('focusin', focus);
    list.addEventListener('focusout', blur);
    return () => {
      sequence++; window.clearTimeout(timer); if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', placeFocused); window.removeEventListener('resize', placeFocused);
      list.removeEventListener('pointerover', over); list.removeEventListener('pointermove', move);
      list.removeEventListener('pointerleave', leave); list.removeEventListener('focusin', focus); list.removeEventListener('focusout', blur);
    };
  }, [projects, reduced]);
  return <div ref={panel} className={`wprev${shown ? ' is-on' : ''}`} aria-hidden="true">
    {ready ? <img key={ready} src={ready} alt="" width={320} height={180} /> : <span className="wprev-name">{shown?.name ?? ''}</span>}
    <span className="wprev-caption">{shown?.name} <span>{slide.total > 1 ? `${slide.index + 1}/${slide.total} · ` : ''}View case ↗</span></span>
  </div>;
}

import { useEffect, useRef, useState } from 'react';
import type { FigureImage } from './Figure';
import { assetUrl } from '../lib/assets';

export interface ViewerImage extends FigureImage { caption?: string }

export function ImageViewer({ images, initialIndex, onClose }: {
  images: ViewerImage[]; initialIndex: number; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState(initialIndex);
  const [failed, setFailed] = useState(false);
  const image = images[index];

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const opener = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (typeof el.showModal === 'function') el.showModal();
    else el.setAttribute('open', '');
    closeButton.current?.focus();
    return () => {
      if (el.open && typeof el.close === 'function') el.close();
      document.body.style.overflow = overflow;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  const move = (direction: number) => {
    setFailed(false);
    setIndex((current) => (current + direction + images.length) % images.length);
  };

  if (!image) return null;
  return (
    <dialog ref={dialog} className="image-viewer" aria-label="Screenshot viewer"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') { event.preventDefault(); onClose(); }
        if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
        if (event.key === 'Tab') {
          const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
          const first = buttons[0]; const last = buttons.at(-1);
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      }}>
      <div className="viewer-surface">
        <header className="viewer-toolbar">
          <span className="kicker">A closer look</span>
          <span>{index + 1} / {images.length}</span>
          <button ref={closeButton} type="button" className="viewer-close" onClick={onClose} aria-label="Close screenshot viewer">Close ×</button>
        </header>
        <div className="viewer-image">
          {failed ? <p role="status">This image could not load. Try another screenshot or close this view.</p>
            : <img key={image.src} src={assetUrl(image.src)} alt={image.alt} width={image.width} height={image.height} decoding="async" onError={() => setFailed(true)} />}
        </div>
        <footer className="viewer-footer">
          <p aria-live="polite">{image.caption || image.alt}</p>
          {images.length > 1 && <div className="viewer-controls">
            <button type="button" onClick={() => move(-1)} aria-label="Previous screenshot">←</button>
            <button type="button" onClick={() => move(1)} aria-label="Next screenshot">→</button>
          </div>}
        </footer>
      </div>
    </dialog>
  );
}

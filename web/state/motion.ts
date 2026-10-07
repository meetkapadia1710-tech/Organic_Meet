import { useSyncExternalStore } from 'react';

export type MotionSetting = 'system' | 'reduced';
const listeners = new Set<() => void>();
let initialized = false;
let setting: MotionSetting = 'system';

export function motionReduced(): boolean {
  return typeof window === 'undefined' || setting === 'reduced'
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function update(): void {
  document.documentElement.dataset.motion = motionReduced() ? 'reduced' : 'full';
  document.documentElement.classList.toggle('motion-paused', document.hidden);
  listeners.forEach((listener) => listener());
}

export function initializeMotion(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  try { setting = localStorage.getItem('mk-motion') === 'reduced' ? 'reduced' : 'system'; } catch { /* optional storage */ }
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  window.addEventListener('storage', (event) => {
    if (event.key === 'mk-motion' || event.key === null) {
      setting = event.newValue === 'reduced' ? 'reduced' : 'system';
      update();
    }
  });
  update();
}

export function setMotionSetting(next: MotionSetting): void {
  setting = next;
  try { localStorage.setItem('mk-motion', next); } catch { /* optional storage */ }
  update();
}

function subscribe(listener: () => void): () => void {
  initializeMotion();
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** Hidden tabs stop decorative loops as well as respecting the live preference. */
export function useMotionPreference(): boolean {
  return useSyncExternalStore(subscribe, () => motionReduced() || document.hidden, () => true);
}

export function useMotionSetting(): MotionSetting {
  return useSyncExternalStore(subscribe, () => setting, () => 'system');
}

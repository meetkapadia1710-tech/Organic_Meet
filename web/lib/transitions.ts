let releaseTimer = 0;

export function transitionBusy(): boolean {
  return document.documentElement.matches('.route-transitioning, .theme-switching, .view-switching');
}

export function markRouteTransition(): void {
  const root = document.documentElement;
  root.classList.add('route-transitioning');
  window.clearTimeout(releaseTimer);
  releaseTimer = window.setTimeout(() => root.classList.remove('route-transitioning'), 700);
}

/** Name only the clicked artwork; hidden/offscreen copies never participate. */
export function prepareProjectArtwork(link: HTMLAnchorElement): void {
  document.querySelectorAll<HTMLElement>('[data-art-source]').forEach((node) => {
    node.style.removeProperty('view-transition-name');
    node.removeAttribute('data-art-source');
  });
  const image = link.querySelector<HTMLImageElement>('img[data-project-art]');
  const slug = link.dataset.project;
  if (!image?.complete || !image.naturalWidth || !slug) return;
  const rect = image.getBoundingClientRect();
  if (rect.bottom <= 0 || rect.top >= innerHeight) return;
  image.dataset.artSource = '';
  image.style.viewTransitionName = `project-art-${slug}`;
  window.setTimeout(() => {
    image.style.removeProperty('view-transition-name');
    image.removeAttribute('data-art-source');
  }, 800);
}

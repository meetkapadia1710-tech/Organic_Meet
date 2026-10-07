/** Public assets must work at both a domain root and a GitHub Pages subpath. */
export function assetUrl(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  return `${import.meta.env.BASE_URL}${path.slice(1)}`;
}

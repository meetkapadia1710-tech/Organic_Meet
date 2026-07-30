/* The direct routes out of the hero: profiles and an address, as icons.

   Inline SVG rather than an icon dependency, for the same reason TechIcon
   draws its own — see the header comment there. These are four paths; a
   package would be a network of them.

   Each carries a visible-on-hover label as well as an accessible name, so
   the row is not a line of unexplained glyphs. `data-cursor` gives the
   custom cursor something to say over each one.

   The handles come from content/stats.ts where they already exist, so a
   changed username updates the Stats page and this row together. */

import { stats } from '../content/stats';

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.47c.53.1.72-.23.72-.5v-1.8c-2.92.63-3.54-1.4-3.54-1.4-.48-1.22-1.17-1.54-1.17-1.54-.96-.65.07-.64.07-.64 1.06.08 1.62 1.09 1.62 1.09.94 1.61 2.47 1.15 3.07.88.1-.68.37-1.15.67-1.41-2.33-.27-4.78-1.17-4.78-5.19 0-1.15.41-2.09 1.08-2.82-.11-.27-.47-1.34.1-2.79 0 0 .88-.28 2.89 1.08a10 10 0 0 1 5.26 0c2-1.36 2.88-1.08 2.88-1.08.58 1.45.22 2.52.11 2.79.68.73 1.08 1.67 1.08 2.82 0 4.03-2.45 4.91-4.79 5.17.38.33.71.97.71 1.96v2.9c0 .28.19.61.72.5A10.5 10.5 0 0 0 12 1.5Z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm6.5 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.76-1.95 4.02 0 4.76 2.5 4.76 5.76V21h-4v-5.6c0-1.34-.03-3.06-1.9-3.06-1.9 0-2.19 1.45-2.19 2.96V21h-4V9Z" />
  </svg>
);

/* LeetCode's mark drawn as its three strokes rather than the wordmark —
   at 20px the wordmark is unreadable anyway. */
const LeetCodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.5 3 7.9 9.9a3 3 0 0 0 0 4.2l3.4 3.5a3 3 0 0 0 4.3 0l1.9-2" />
    <path d="M9.5 12h9" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
    <path d="m3 7 8.2 5.6a1.4 1.4 0 0 0 1.6 0L21 7" />
  </svg>
);

interface Entry {
  label: string;
  href: string;
  icon: () => React.JSX.Element;
}

const LINKS: Entry[] = [
  stats.github ? { label: 'GitHub', href: `https://github.com/${stats.github}`, icon: GitHubIcon } : null,
  { label: 'LinkedIn', href: 'https://linkedin.com/in/meet-kapadia17', icon: LinkedInIcon },
  stats.leetcode ? { label: 'LeetCode', href: `https://leetcode.com/u/${stats.leetcode}/`, icon: LeetCodeIcon } : null,
  { label: 'Email', href: 'mailto:kapadiameet07@gmail.com', icon: MailIcon },
].filter(Boolean) as Entry[];

export function HeroLinks() {
  return (
    <ul className="hero-links" aria-label="Profiles and contact">
      {LINKS.map(({ label, href, icon: Icon }) => (
        <li key={label}>
          <a
            href={href}
            data-cursor={label}
            {...(href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            aria-label={label}
          >
            <Icon />
            <span className="hero-link-label">{label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

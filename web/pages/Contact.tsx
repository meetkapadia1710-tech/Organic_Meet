import { SplitText } from '../components/SplitText';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

/* Three ways to reach him, in the order they're actually useful: email for
   anything real, GitHub to see the work first, LinkedIn for the professional
   paper trail. Kept as monoline strokes at 2.75, matching Nav's own icon
   language (the sun/moon/search glyphs) rather than TechIcon's filled marks,
   which belong to the stack chips, not the site's own UI. */
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
    <path d="m3.5 6 8.5 7 8.5-7" />
  </svg>
);
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9.5 19.4c-4.3 1.4-4.3-2.5-6-3M18 22v-3.4c0-.85-.3-1.4-.6-1.7 2-.2 4.1-1 4.1-4.5a3.5 3.5 0 0 0-.95-2.4 3.3 3.3 0 0 0-.1-2.4s-.8-.25-2.55.95a8.8 8.8 0 0 0-4.6 0C11.55 7.4 10.75 7.65 10.75 7.65a3.3 3.3 0 0 0-.1 2.4 3.5 3.5 0 0 0-.95 2.4c0 3.45 2.1 4.3 4.1 4.5-.25.25-.5.7-.6 1.4V22" />
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M7.5 10.5v6M7.5 7.5v.01M12 16.5v-3.7c0-1.5 1-2.3 2.25-2.3S16.5 11.3 16.5 12.8v3.7" />
  </svg>
);

/* Repeats what's already claimed elsewhere on the site — the location and
   status in Home's fact strip, the fit criteria on Approach — rather than
   inventing anything new. A contact page contradicting the rest of the site
   about who's available for what would undercut both pages. */
const METHODS = [
  {
    icon: MailIcon,
    title: 'Email',
    body: 'The fastest way to reach me, and the only one I check like it matters. Say what you\'re building and I\'ll reply from there.',
    label: 'kapadiameet07@gmail.com',
    href: 'mailto:kapadiameet07@gmail.com',
    external: false,
  },
  {
    icon: GitHubIcon,
    title: 'GitHub',
    body: 'Before you email — the commit history answers "can this person actually build it" faster than I can argue the point.',
    label: '@meetkapadia1710-tech',
    href: 'https://github.com/meetkapadia1710-tech',
    external: true,
  },
  {
    icon: LinkedInIcon,
    title: 'LinkedIn',
    body: 'For the professional version — roles, timeline, and the people who\'ll vouch for the work.',
    label: 'meet-kapadia17',
    href: 'https://linkedin.com/in/meet-kapadia17',
    external: true,
  },
];

const FIT = [
  'Full-stack web apps where one person owns schema through UI',
  'AI tooling that has to be grounded in real data, not vibes',
  'Local-first or privacy-constrained systems',
  'Getting a stalled prototype to something shippable',
];

const FACTS: Array<[string, string]> = [
  ['Based in', 'Bharuch, Gujarat'],
  ['Status', 'Available now'],
  ['Open to', 'Internships & freelance'],
];

/* Kept to what the site already claims elsewhere — the shared Contact block
   says the inbox is open and answered quickly, and the footer already puts
   the clock in IST. Nothing here invents a response-time promise Meet hasn't
   made. */
const EXPECT: Array<[string, string]> = [
  [
    'A real reply',
    'There is no form, no autoresponder and nobody else reading it. Mail goes straight to me and I answer it myself.',
  ],
  [
    'Allow for IST',
    'I am in Gujarat, so a message sent during a European or US working day will usually be answered the following morning my time.',
  ],
  [
    'Say what you are building',
    'A sentence about the problem is worth more than a formal introduction — it is the fastest way for me to tell you honestly whether I am the right person for it.',
  ],
];

export function Contact() {
  useDocumentMeta(
    'Contact',
    'Email, GitHub or LinkedIn — three ways to reach Meet Kapadia, and what each one is actually good for.'
  );

  return (
    <>
      <header id="main" style={{ padding: '22vh var(--space-8) 0', maxWidth: 1400, margin: '0 auto', position: 'relative' }}>
        <div
          aria-hidden="true"
          data-parallax
          style={{ position: 'absolute', top: '14vh', right: -120, width: 380, height: 380, borderRadius: 999, background: 'var(--color-accent-2-200)', opacity: 0.55, animation: 'float 9s ease-in-out infinite' }}
        />
        <div style={{ position: 'relative' }}>
          <span className="tag tag-accent" style={{ borderRadius: 999 }}>Currently available</span>
          <SplitText
            as="h1"
            text="Let's talk."
            style={{ fontSize: 'clamp(56px, 10vw, 160px)', lineHeight: 0.95, letterSpacing: '-0.02em', margin: 'var(--space-4) 0 0', maxWidth: '10ch' }}
          />
          <p data-lines style={{ maxWidth: '52ch', fontSize: 20, lineHeight: 1.6, marginTop: 'var(--space-6)', color: 'var(--color-neutral-800)' }}>
            For collaborations, internships or anything you think I&apos;d find interesting. Pick whichever of the three below fits — I read all of it and reply personally.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-8)' }}>
          {FACTS.map(([label, value]) => (
            <div key={label} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-6)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-700)', marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
      </header>

      {/* The nav's persistent "Get in touch" pill jumps to #contact on every
          page; here that means this block, since the page it's already on
          doesn't need a second jump target further down. */}
      <section id="contact" style={{ maxWidth: 1400, margin: '0 auto', padding: '14vh var(--space-8) 0' }}>
        <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}>Ways to reach me</h6>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {METHODS.map(({ icon: Icon, title, body, label, href, external }) => (
            <a
              key={title}
              className="card elev-sm"
              data-tilt
              data-reveal
              data-magnetic="0.06"
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              style={{ borderRadius: 'var(--radius-lg)', textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 44, height: 44, borderRadius: 999,
                  background: 'var(--color-accent-200)', color: 'var(--color-accent-800)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <Icon />
              </span>
              <h3 className="card-title" style={{ fontSize: 22 }}>{title}</h3>
              <p className="card-body">{body}</p>
              <span style={{ display: 'inline-block', marginTop: 'var(--space-3)', fontSize: 14, fontWeight: 600, color: 'var(--color-accent-700)' }}>
                {label} {external ? '↗' : '→'}
              </span>
            </a>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '12vh var(--space-8) 0' }}>
        <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}>Worth reaching out about</h6>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-3)' }}>
          {FIT.map((item) => (
            <li key={item} data-reveal style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'baseline', fontSize: 17, lineHeight: 1.6, background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
              <span style={{ color: 'var(--color-accent-2-700)', fontWeight: 700 }}>✦</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* The page needs an ending, and it needs bottom padding.

          Every other page closes on the shared <Contact /> band, which is
          also where their `10vh` of bottom padding comes from. This page
          can't use that block — it would be a third copy of the same email
          button — so without something here the last list ran straight into
          the footer with no gap, which is what made the page feel unfinished.

          What it says is deliberately not a repeat of the cards above: those
          explain *which* channel, this explains what actually happens after
          you use one. */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '12vh var(--space-8) 10vh' }}>
        <div
          data-reveal
          style={{ background: 'var(--color-accent-200)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)', position: 'relative', overflow: 'hidden' }}
        >
          <div
            aria-hidden="true"
            data-parallax
            style={{ position: 'absolute', right: -90, bottom: -120, width: 340, height: 340, borderRadius: 999, background: 'var(--color-accent-300)', opacity: 0.55 }}
          />
          <div style={{ position: 'relative' }}>
            <h6 style={{ color: 'var(--color-accent-800)', marginBottom: 'var(--space-4)' }}>Before you write</h6>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
              {EXPECT.map(([title, body]) => (
                <div key={title}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-accent-900)', marginBottom: 6 }}>{title}</div>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'var(--color-accent-900)', opacity: 0.85 }}>{body}</p>
                </div>
              ))}
            </div>
            <a data-magnetic className="btn btn-primary" href="mailto:kapadiameet07@gmail.com" style={{ borderRadius: 999 }}>
              kapadiameet07@gmail.com
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

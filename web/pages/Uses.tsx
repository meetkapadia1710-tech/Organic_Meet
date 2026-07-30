import { SplitText } from '../components/SplitText';
import { Contact } from '../components/Contact';
import { ScrambleText } from '../components/ScrambleText';
import { TechIcon } from '../components/TechIcon';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { stack } from '../content/stack';
import { SOFTWARE_ORDER, USES } from '../content/uses';

export function Uses() {
  useDocumentMeta(
    'Uses',
    'The editor, the machine and the tools behind the work — what I actually build with.'
  );

  /* The software half is the real stack, reordered. Anything in `stack.ts`
     that SOFTWARE_ORDER does not name still renders, appended — so adding a
     new group to the stack can never silently drop it from this page. */
  const groups = [
    ...SOFTWARE_ORDER.map((name) => stack.find((g) => g.name === name)).filter(Boolean),
    ...stack.filter((g) => !SOFTWARE_ORDER.includes(g.name as (typeof SOFTWARE_ORDER)[number])),
  ] as typeof stack;

  const hardware = USES.filter((g) => !g.todo);

  return (
    <>
      <header id="main" style={{ padding: '22vh var(--space-8) 0', maxWidth: 1400, margin: '0 auto', position: 'relative' }}>
        <div
          aria-hidden="true"
          data-parallax
          style={{ position: 'absolute', top: '16vh', right: -140, width: 400, height: 400, borderRadius: 999, background: 'var(--color-accent-2-200)', opacity: 0.5, animation: 'float 10s ease-in-out infinite' }}
        />
        <div style={{ position: 'relative' }}>
          <span className="tag tag-neutral" style={{ borderRadius: 999 }}>Uses</span>
          <SplitText
            as="h1"
            text="What I build with."
            style={{ fontSize: 'clamp(56px, 10vw, 160px)', lineHeight: 0.95, letterSpacing: '-0.02em', margin: 'var(--space-4) 0 0', maxWidth: '13ch' }}
          />
          <p style={{ maxWidth: '52ch', fontSize: 20, lineHeight: 1.6, marginTop: 'var(--space-6)', color: 'var(--color-neutral-800)' }}>
            The software list here is the same one the rest of the site is built from — it cannot drift, because there
            is only one copy of it.
          </p>
        </div>
      </header>

      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '12vh var(--space-8) 0' }}>
        <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-6)' }}><ScrambleText>Software</ScrambleText></h6>
        <div className="uses-grid">
          {groups.map((group) => (
            <div key={group.name} className="card elev-sm" data-reveal style={{ borderRadius: 'var(--radius-lg)' }}>
              <h3 className="card-title" style={{ fontSize: 20, margin: '0 0 var(--space-4)' }}>{group.name}</h3>
              <ul className="uses-list">
                {group.items.map((item) => (
                  <li key={item}>
                    <TechIcon name={item} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ⚠️ Empty until the hardware and daily-driver entries in
          content/uses.ts are filled in with real answers — nothing in this
          repo knows what machine it was written on, and a /uses page is read
          by people who will notice an invented one. */}
      {hardware.length > 0 && (
        <section style={{ maxWidth: 1400, margin: '0 auto', padding: '12vh var(--space-8) 0' }}>
          <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-6)' }}><ScrambleText>Desk</ScrambleText></h6>
          <div className="uses-grid">
            {hardware.map((group) => (
              <div key={group.name} className="card elev-sm" data-reveal style={{ borderRadius: 'var(--radius-lg)' }}>
                <h3 className="card-title" style={{ fontSize: 20, margin: '0 0 var(--space-2)' }}>{group.name}</h3>
                {group.note && <p className="card-body" style={{ marginBottom: 'var(--space-4)' }}>{group.note}</p>}
                <ul className="uses-list uses-list-plain">
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <span>
                        {item.name}
                        {item.note && <em className="uses-note"> — {item.note}</em>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <Contact />
    </>
  );
}

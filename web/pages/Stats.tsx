import { SplitText } from '../components/SplitText';
import { Contact } from '../components/Contact';
import { ScrambleText } from '../components/ScrambleText';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { stats } from '../content/stats';
import { archive, caseStudies } from '../content/projects';
import { Heatmap, HeatmapLegend, useGitHubCalendar, useLeetCode } from '../components/Heatmap';

/* A panel wrapping a third-party image. It always renders the link, so if the
   service is slow, blocked or gone, the visitor still has somewhere to go —
   which is the part that actually matters. */
function Panel({
  title,
  note,
  href,
  src,
  alt,
  height = 200,
}: {
  title: string;
  note?: string;
  href: string;
  src?: string;
  alt?: string;
  height?: number;
}) {
  return (
    <div className="card elev-sm" data-tilt data-reveal style={{ borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <h3 className="card-title" style={{ fontSize: 22, margin: 0 }}>{title}</h3>
        <a
          className="btn btn-ghost"
          data-magnetic
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 13 }}
        >
          Profile ↗
        </a>
      </div>
      {note && <p className="card-body" style={{ marginTop: 'var(--space-2)' }}>{note}</p>}
      {src && (
        <img
          src={src}
          alt={alt ?? title}
          loading="lazy"
          decoding="async"
          style={{ width: '100%', height: 'auto', maxHeight: height, objectFit: 'contain', marginTop: 'var(--space-3)' }}
        />
      )}
    </div>
  );
}

export function Stats() {
  useDocumentMeta(
    'Stats',
    'Contribution activity, problem-solving practice and what the shipping record actually looks like.'
  );

  const { github, leetcode, codolio, hackerrank } = stats;
  const gh = useGitHubCalendar(github);
  const lc = useLeetCode(leetcode);
  const shipped = caseStudies.length + archive.length;
  const withCaseStudies = caseStudies.length;
  const live = [...caseStudies, ...archive].filter((p) => p.links?.live).length;

  return (
    <>
      <header id="main" style={{ padding: '22vh var(--space-8) 0', maxWidth: 1400, margin: '0 auto', position: 'relative' }}>
        <div
          aria-hidden="true"
          data-parallax
          style={{ position: 'absolute', top: '16vh', right: -140, width: 400, height: 400, borderRadius: 999, background: 'var(--color-accent-2-200)', opacity: 0.5, animation: 'float 10s ease-in-out infinite' }}
        />
        <div style={{ position: 'relative' }}>
          <span className="tag tag-neutral" style={{ borderRadius: 999 }}>Stats</span>
          <SplitText
            as="h1"
            text="The receipts."
            style={{ fontSize: 'clamp(56px, 10vw, 160px)', lineHeight: 0.95, letterSpacing: '-0.02em', margin: 'var(--space-4) 0 0', maxWidth: '13ch' }}
          />
          <p style={{ maxWidth: '52ch', fontSize: 20, lineHeight: 1.6, marginTop: 'var(--space-6)', color: 'var(--color-neutral-800)' }}>
            Contribution activity, problem-solving practice, and what the shipping record looks like when you count it
            rather than describe it.
          </p>
        </div>
      </header>

      {/* Counted from the project data rather than typed in, so it cannot drift. */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '10vh var(--space-8) 0' }}>
        <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}><ScrambleText>Shipping record</ScrambleText></h6>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          {[
            ['Projects', String(shipped)],
            ['Written up', String(withCaseStudies)],
            ['Live to click', String(live)],
            ['Paying clients', '3'],
          ].map(([label, value]) => (
            <div key={label} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-6)', minWidth: 150 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-700)', marginBottom: 4 }}>
                {label}
              </div>
              {/* The markup already holds the final number — data-countup only
                  animates toward what is written here, so the correct value is
                  what shows if the script never runs. */}
              <div data-countup style={{ fontFamily: 'var(--font-heading)', fontSize: 38, lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>
      </section>

      {github && (
        <section style={{ maxWidth: 1400, margin: '0 auto', padding: '12vh var(--space-8) 0' }}>
          <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}><ScrambleText>GitHub</ScrambleText></h6>

          <div className="card elev-sm" data-reveal style={{ borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <h3 className="card-title" style={{ fontSize: 22, margin: 0 }}>
                Contributions
                {gh.state === 'ready' && (
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--color-neutral-700)', marginLeft: 'var(--space-3)' }}>
                    {gh.data.total.toLocaleString()} in the last year
                  </span>
                )}
              </h3>
              <a className="btn btn-ghost" data-magnetic href={`https://github.com/${github}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13 }}>
                @{github} ↗
              </a>
            </div>

            <div style={{ marginTop: 'var(--space-4)' }}>
              {gh.state === 'loading' && <div className="hm-skeleton" />}
              {gh.state === 'error' && (
                <p className="card-body" style={{ margin: 0 }}>
                  The contribution data could not be loaded just now — the profile link above still works.
                </p>
              )}
              {gh.state === 'ready' && (
                <>
                  <Heatmap grid={gh.data.grid} unit="contribution" ramp="accent" />
                  <HeatmapLegend />
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {(leetcode || codolio || hackerrank) && (
        <section style={{ maxWidth: 1400, margin: '0 auto', padding: '12vh var(--space-8) 0' }}>
          <h6 className="kicker-rule" style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-4)' }}><ScrambleText>Problem solving</ScrambleText></h6>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
            {leetcode && (
              <div className="card elev-sm" data-tilt data-reveal style={{ borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <h3 className="card-title" style={{ fontSize: 22, margin: 0 }}>LeetCode</h3>
                  <a
                    className="btn btn-ghost"
                    data-magnetic
                    href={`https://leetcode.com/u/${leetcode}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 13 }}
                  >
                    Profile ↗
                  </a>
                </div>

                <div style={{ marginTop: 'var(--space-4)' }}>
                  {lc.state === 'loading' && <div className="hm-skeleton" />}
                  {lc.state === 'error' && (
                    <p className="card-body" style={{ margin: 0 }}>
                      The submission data could not be loaded just now — the profile link above still works.
                    </p>
                  )}
                  {lc.state === 'ready' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 44, lineHeight: 1 }}>
                          {lc.data.solved.total.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 15, color: 'var(--color-neutral-700)' }}>
                          problems solved
                          {lc.data.ranking > 0 && <> · rank {lc.data.ranking.toLocaleString()}</>}
                        </span>
                      </div>

                      {/* Solved-by-difficulty. The bar is the share of that
                          tier that has been solved, so "37 hard" is read
                          against the 958 that exist rather than in a vacuum. */}
                      <div style={{ display: 'grid', gap: 'var(--space-3)', margin: 'var(--space-4) 0' }}>
                        {([
                          ['Easy', lc.data.solved.easy, lc.data.available.easy, 'var(--color-accent-2-600)'],
                          ['Medium', lc.data.solved.medium, lc.data.available.medium, 'var(--color-accent-600)'],
                          ['Hard', lc.data.solved.hard, lc.data.available.hard, 'var(--color-accent-800)'],
                        ] as const).map(([tier, done, available, colour]) => (
                          <div key={tier}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>
                              <span>{tier}</span>
                              <span style={{ color: 'var(--color-neutral-700)', fontVariantNumeric: 'tabular-nums' }}>
                                {done.toLocaleString()}
                                {available > 0 && <span style={{ opacity: 0.65 }}> / {available.toLocaleString()}</span>}
                              </span>
                            </div>
                            <div style={{ height: 6, borderRadius: 999, background: 'var(--color-neutral-300)', overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: available > 0 ? `${Math.max(1.5, (done / available) * 100)}%` : '0%',
                                  background: colour,
                                  borderRadius: 999,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-4)', fontSize: 14, color: 'var(--color-neutral-800)' }}>
                        {lc.data.streak > 0 && <span><strong>{lc.data.streak}</strong> day streak</span>}
                        {lc.data.activeDays > 0 && <span><strong>{lc.data.activeDays}</strong> active days</span>}
                        <span><strong>{lc.data.submissions.toLocaleString()}</strong> submissions</span>
                      </div>

                      <Heatmap grid={lc.data.grid} unit="submission" ramp="accent-2" />
                      <HeatmapLegend />
                    </>
                  )}
                </div>
              </div>
            )}
            {codolio && (
              <Panel
                title="Codolio"
                note="Practice across every judge in one place — the aggregate view, rather than one platform's slice of it."
                href={codolio}
              />
            )}
            {hackerrank && (
              <Panel title="HackerRank" href={`https://www.hackerrank.com/profile/${hackerrank}`} />
            )}
          </div>
        </section>
      )}

      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '12vh var(--space-8) 0' }}>
        <p style={{ fontSize: 14, color: 'var(--color-neutral-700)', maxWidth: '62ch' }}>
          The panels above are rendered by third-party services from a username. Everything else on this site makes no
          external requests; these do, which means they can be slow or unavailable — so every panel links to the profile
          it summarises.
        </p>
      </section>

      <Contact />
    </>
  );
}

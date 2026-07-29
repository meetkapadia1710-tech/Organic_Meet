/* A working NEWS2 scorer — the real banding from the ambulance project,
   running client-side.

   National Early Warning Score 2 (RCP, 2017). Each parameter is banded 0-3
   and summed; 5 escalates, 7 escalates further, and any single parameter
   scoring 3 escalates on its own regardless of the total — the "red score",
   which is why a patient can look fine on aggregate and still be critical. */

import { useMemo, useState } from 'react';

interface Param {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  band: (v: number) => number;
}

const PARAMS: Param[] = [
  { key: 'resp', label: 'Respiratory rate', unit: '/min', min: 4, max: 40, step: 1, initial: 16, band: (v) => (v <= 8 ? 3 : v <= 11 ? 1 : v <= 20 ? 0 : v <= 24 ? 2 : 3) },
  { key: 'spo2', label: 'Oxygen saturation', unit: '%', min: 80, max: 100, step: 1, initial: 98, band: (v) => (v <= 91 ? 3 : v <= 93 ? 2 : v <= 95 ? 1 : 0) },
  { key: 'sbp', label: 'Systolic BP', unit: 'mmHg', min: 60, max: 240, step: 1, initial: 120, band: (v) => (v <= 90 ? 3 : v <= 100 ? 2 : v <= 110 ? 1 : v <= 219 ? 0 : 3) },
  { key: 'hr', label: 'Heart rate', unit: 'bpm', min: 30, max: 180, step: 1, initial: 72, band: (v) => (v <= 40 ? 3 : v <= 50 ? 1 : v <= 90 ? 0 : v <= 110 ? 1 : v <= 130 ? 2 : 3) },
  { key: 'temp', label: 'Temperature', unit: '°C', min: 33, max: 41.5, step: 0.1, initial: 36.8, band: (v) => (v <= 35 ? 3 : v <= 36 ? 1 : v <= 38 ? 0 : v <= 39 ? 1 : 2) },
];

const TIERS = {
  stable: {
    label: 'Stable',
    color: 'var(--color-accent-2-600)',
    glyph: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" fill="none" stroke="var(--color-bg)" strokeWidth="2.2" strokeLinecap="round" /></>,
  },
  urgent: {
    label: 'Urgent',
    color: '#c9922e',
    glyph: <><path d="M12 3 22 20H2Z" /><path d="M12 10v4.5M12 17.2v.1" fill="none" stroke="var(--color-bg)" strokeWidth="2.2" strokeLinecap="round" /></>,
  },
  critical: {
    label: 'Critical',
    color: 'var(--color-accent-600)',
    glyph: <><path d="M8.2 2.5h7.6L21.5 8.2v7.6l-5.7 5.7H8.2L2.5 15.8V8.2Z" /><path d="M12 7v6M12 16.2v.1" fill="none" stroke="var(--color-bg)" strokeWidth="2.2" strokeLinecap="round" /></>,
  },
} as const;

export function News2Demo() {
  const [values, setValues] = useState<Record<string, number>>(
    () => Object.fromEntries(PARAMS.map((p) => [p.key, p.initial]))
  );
  const [onOxygen, setOnOxygen] = useState(false);
  const [alert, setAlert] = useState(true);

  const result = useMemo(() => {
    let total = 0;
    let red: string | null = null;
    const points: Record<string, number> = {};

    for (const p of PARAMS) {
      const pts = p.band(values[p.key] ?? p.initial);
      points[p.key] = pts;
      total += pts;
      if (pts === 3 && !red) red = p.label;
    }
    if (onOxygen) total += 2;
    if (!alert) { total += 3; if (!red) red = 'Consciousness'; }

    let tier: keyof typeof TIERS = total >= 7 ? 'critical' : total >= 5 ? 'urgent' : 'stable';
    let why = tier === 'critical' ? 'Total of 7 or more.' : tier === 'urgent' ? 'Total in the 5-6 band.' : 'Total of 4 or below.';
    if (red) {
      tier = 'critical';
      why = `${red} scores 3 on its own — red score, critical regardless of the total.`;
    }
    return { total, tier, why, points };
  }, [values, onOxygen, alert]);

  const tier = TIERS[result.tier];

  return (
    <div className="demo">
      <div className="demo-head">
        <h3 className="demo-title">Score a patient</h3>
        <span className="tag tag-neutral" style={{ borderRadius: 999 }}>NEWS2 · RCP 2017</span>
      </div>
      <p className="demo-note">
        The same banding the ambulance runs on board, computed here in your browser. Drop oxygen saturation to 91 or
        below and watch the total stop mattering — a single parameter scoring 3 is critical on its own.
      </p>

      <div className="vitals">
        {PARAMS.map((p) => {
          const pts = result.points[p.key] ?? 0;
          return (
            <div className="vital" key={p.key}>
              <label htmlFor={`v-${p.key}`}>
                <span>{p.label}</span>
                <span>
                  <output>{values[p.key]}</output> {p.unit}{' '}
                  <span className="pts" style={{ color: pts === 3 ? 'var(--color-accent-600)' : 'var(--color-neutral-700)' }}>
                    {pts ? `+${pts}` : ''}
                  </span>
                </span>
              </label>
              <input
                id={`v-${p.key}`}
                type="range"
                min={p.min}
                max={p.max}
                step={p.step}
                value={values[p.key]}
                onChange={(e) => setValues((v) => ({ ...v, [p.key]: Number(e.target.value) }))}
              />
            </div>
          );
        })}

        <div className="vital">
          <label style={{ display: 'block', marginBottom: 8 }}>
            <input type="checkbox" checked={onOxygen} onChange={(e) => setOnOxygen(e.target.checked)} /> Supplemental oxygen{' '}
            <span className="pts">{onOxygen ? '+2' : ''}</span>
          </label>
          <label style={{ display: 'block' }}>
            <input type="checkbox" checked={!alert} onChange={(e) => setAlert(!e.target.checked)} /> Not fully alert (V/P/U){' '}
            <span className="pts">{!alert ? '+3' : ''}</span>
          </label>
        </div>
      </div>

      <div className="score" role="status" aria-live="polite">
        <span className="score-total">{result.total}</span>
        <span className="score-tier" style={{ color: tier.color }}>
          <svg className="glyph" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{tier.glyph}</svg>
          {tier.label}
        </span>
        <span className="score-why">{result.why}</span>
      </div>
    </div>
  );
}

/** Click-to-load embed — an always-on iframe would make every visitor pay for
 *  a demo most of them won't open, and this one is a cold-starting free tier. */
export function EmbedDemo({ src, label, note }: { src: string; label: string; note?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);

  return (
    <div className="demo">
      <div className="demo-head">
        <h3 className="demo-title">Try it here</h3>
        <span className="tag tag-neutral" style={{ borderRadius: 999 }}>Loads on request</span>
      </div>
      {note && <p className="demo-note">{note}</p>}
      <div className="embed-slot">
        {!loaded ? (
          <button type="button" className="btn btn-primary" data-magnetic style={{ borderRadius: 999, justifySelf: 'start' }} onClick={() => setLoaded(true)}>
            Load the {label}
          </button>
        ) : (
          <>
            {!ready && <p className="demo-note">Loading — this can take a moment on a cold start.</p>}
            <iframe src={src} loading="lazy" title={label} allow="clipboard-write" onLoad={() => setReady(true)} />
          </>
        )}
      </div>
    </div>
  );
}

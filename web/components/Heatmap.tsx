/* ─────────────────────────────────────────────────────────────────────────
   Heatmap.tsx — the contribution grids on /stats, drawn from real data.

   Both panels used to be third-party <img> cards. That worked, but an image
   cannot do three things this page needs: take the site's accent ramp, invert
   with the theme, or respond to a pointer. It also meant the two grids were
   drawn by two different services in two different visual languages, one of
   which had to be cropped with a magic percentage to hide a header.

   So the services are now data sources rather than renderers: fetch the day
   counts, draw the grid here. Colours come from the palette, which reverses
   wholesale in dark mode, so nothing here knows which theme is active.

   The contract from the old panels survives: if a request fails, is slow, or
   is blocked, the panel still renders its heading and its profile link. The
   numbers are never the only way to reach the real thing.
   ───────────────────────────────────────────────────────────────────────── */

import { useEffect, useState } from 'react';

export interface Day {
  /** YYYY-MM-DD */
  date: string;
  count: number;
  /** 0–4 */
  level: number;
}

type Load<T> = { state: 'loading' } | { state: 'error' } | { state: 'ready'; data: T };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKS = 53;

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* A calendar grid always ends on today and starts on the Sunday 52 weeks
   back, so the columns are weeks and the rows are weekdays. Days before the
   range start are rendered as empty cells rather than skipped, or the first
   column would be short and every row would be off by one. */
function buildGrid(counts: Map<string, number>, level: (count: number) => number): Day[][] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const end = new Date(today);
  const start = new Date(today);
  start.setDate(start.getDate() - (WEEKS * 7 - 1));
  start.setDate(start.getDate() - start.getDay());

  const columns: Day[][] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const week: Day[] = [];
    for (let i = 0; i < 7; i += 1) {
      const key = iso(cursor);
      const count = counts.get(key) ?? 0;
      week.push({ date: key, count, level: cursor > end ? -1 : level(count) });
      cursor.setDate(cursor.getDate() + 1);
    }
    columns.push(week);
  }
  return columns;
}

/** GitHub's API already buckets each day; trust its levels. */
export function useGitHubCalendar(user: string | undefined): Load<{ grid: Day[][]; total: number }> {
  const [result, setResult] = useState<Load<{ grid: Day[][]; total: number }>>({ state: 'loading' });

  useEffect(() => {
    if (!user) return;
    let live = true;

    fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(user)}?y=last`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json: { total?: Record<string, number>; contributions?: Array<{ date: string; count: number; level: number }> }) => {
        if (!live) return;
        const days = json.contributions ?? [];
        const counts = new Map(days.map((d) => [d.date, d.count]));
        const levels = new Map(days.map((d) => [d.date, d.level]));
        const grid = buildGrid(counts, () => 0).map((week) =>
          week.map((day) => ({ ...day, level: day.level === -1 ? -1 : levels.get(day.date) ?? 0 }))
        );
        setResult({ state: 'ready', data: { grid, total: json.total?.['lastYear'] ?? 0 } });
      })
      .catch(() => live && setResult({ state: 'error' }));

    return () => {
      live = false;
    };
  }, [user]);

  return result;
}

/* LeetCode returns raw submission counts keyed by UTC-midnight unix seconds,
   with no bucketing. These thresholds are chosen for what a practice day
   actually looks like rather than computed from the maximum: one outlier day
   of sixty submissions would otherwise push every ordinary day into level 1
   and flatten the whole year. */
function leetLevel(count: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

export function useLeetCodeCalendar(
  user: string | undefined
): Load<{ grid: Day[][]; total: number; streak: number; activeDays: number }> {
  const [result, setResult] = useState<Load<{ grid: Day[][]; total: number; streak: number; activeDays: number }>>({
    state: 'loading',
  });

  useEffect(() => {
    if (!user) return;
    let live = true;

    fetch(`https://alfa-leetcode-api.onrender.com/${encodeURIComponent(user)}/calendar`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json: { submissionCalendar?: string; streak?: number; totalActiveDays?: number }) => {
        if (!live) return;

        // submissionCalendar arrives as a JSON *string*, not an object.
        const raw: Record<string, number> = JSON.parse(json.submissionCalendar ?? '{}');
        const counts = new Map<string, number>();
        let total = 0;

        for (const [seconds, count] of Object.entries(raw)) {
          const date = new Date(Number(seconds) * 1000);
          counts.set(iso(new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())), count);
          total += count;
        }

        setResult({
          state: 'ready',
          data: {
            grid: buildGrid(counts, leetLevel),
            total,
            streak: json.streak ?? 0,
            activeDays: json.totalActiveDays ?? 0,
          },
        });
      })
      .catch(() => live && setResult({ state: 'error' }));

    return () => {
      live = false;
    };
  }, [user]);

  return result;
}

function label(day: Day, unit: string) {
  const date = new Date(`${day.date}T12:00:00`);
  const when = `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  if (day.count === 0) return `No ${unit} on ${when}`;
  return `${day.count} ${unit}${day.count === 1 ? '' : 's'} on ${when}`;
}

export function Heatmap({
  grid,
  unit,
  ramp = 'accent',
}: {
  grid: Day[][];
  /** Singular noun for the tooltip: "contribution", "submission". */
  unit: string;
  ramp?: 'accent' | 'accent-2';
}) {
  /* Month labels sit above the column where that month first appears, and
     only when there is room for the name — otherwise Jan and Feb collide on
     a narrow grid. */
  const months: Array<{ index: number; name: string }> = [];
  let lastMonth = -1;
  grid.forEach((week, index) => {
    const first = week[0];
    if (!first) return;
    const month = new Date(`${first.date}T12:00:00`).getMonth();
    if (month === lastMonth) return;
    lastMonth = month;

    /* Column 0 is a partial month — the range starts mid-week, mid-month. It
       used to be labelled, and then the *next* month sat one column away and
       was dropped by the spacing rule below, so August vanished from a grid
       that ran July to July. Skipping the partial leader is also what GitHub
       does, and it costs nothing: the first column is two or three days. */
    if (index === 0 || index >= grid.length - 2) return;

    const previous = months[months.length - 1];
    if (!previous || index - previous.index >= 3) months.push({ index, name: MONTHS[month] ?? '' });
  });

  return (
    <div className="hm-scroll">
      <div className="hm" data-ramp={ramp}>
        <div className="hm-months" style={{ gridTemplateColumns: `repeat(${grid.length}, 1fr)` }}>
          {months.map((m) => (
            <span key={`${m.name}-${m.index}`} style={{ gridColumnStart: m.index + 1 }}>
              {m.name}
            </span>
          ))}
        </div>
        <div className="hm-grid" style={{ gridTemplateColumns: `repeat(${grid.length}, 1fr)` }}>
          {grid.map((week, w) =>
            week.map((day, d) =>
              day.level === -1 ? (
                <span key={`${w}-${d}`} className="hm-cell is-empty" aria-hidden="true" />
              ) : (
                <span key={day.date} className="hm-cell" data-level={day.level} title={label(day, unit)} />
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}

export function HeatmapLegend() {
  return (
    <div className="hm-legend">
      <span>Less</span>
      <div className="hm" data-ramp="accent" style={{ display: 'flex', gap: 3 }}>
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className="hm-cell" data-level={level} />
        ))}
      </div>
      <span>More</span>
    </div>
  );
}

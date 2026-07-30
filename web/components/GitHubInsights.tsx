/* ─────────────────────────────────────────────────────────────────────────
   GitHubInsights — what the contribution grid says beyond its total.

   No new requests. Every number here is derived from the `Day[][]` the
   heatmap has already fetched and drawn, which is the whole reason this is
   worth having: the page's standing trade-off is that it makes third-party
   requests at all, so anything extra should come out of data already in
   hand rather than adding another dependency to be slow or unavailable.

   The grid is weeks-as-columns, weekdays-as-rows, and it is padded at both
   ends — days before the range start and after today are present with
   `count: 0`. Streaks therefore have to walk it in *date* order, not array
   order, and the trailing pad has to be dropped or the current streak is
   always zero.
   ───────────────────────────────────────────────────────────────────────── */

import { useMemo } from 'react';
import type { Day } from './Heatmap';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface Insights {
  longestStreak: number;
  currentStreak: number;
  best: { date: string; count: number } | null;
  busiestWeekday: { name: string; total: number } | null;
  weeklyAverage: number;
  activeDays: number;
  totalDays: number;
}

export function deriveInsights(grid: Day[][], today = new Date()): Insights {
  // Flatten to date order, then drop anything after today — the last column
  // is padded out to a full week and those future cells all read zero, which
  // would break every current streak the moment the week turned over.
  const cutoff = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const days = grid
    .flat()
    .filter((d) => d.date && d.date <= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date));

  let longest = 0;
  let running = 0;
  let best: { date: string; count: number } | null = null;
  let active = 0;
  let total = 0;

  for (const day of days) {
    if (day.count > 0) {
      running += 1;
      active += 1;
      total += day.count;
      if (running > longest) longest = running;
      if (!best || day.count > best.count) best = { date: day.date, count: day.count };
    } else {
      running = 0;
    }
  }

  /* Current streak walks backwards from the most recent day. Today counting
     zero does not break it — the day is not over, and a streak that resets
     every midnight and un-resets on the first push is noise, not a fact. */
  let current = 0;
  for (let i = days.length - 1; i >= 0; i -= 1) {
    const day = days[i];
    if (!day) break;
    if (day.count > 0) current += 1;
    else if (i === days.length - 1) continue;
    else break;
  }

  const byWeekday = new Array<number>(7).fill(0);
  for (const day of days) {
    // Parsed as UTC to avoid the local-midnight shift moving a Sunday to a
    // Saturday for anyone west of GMT.
    const index = new Date(`${day.date}T12:00:00Z`).getUTCDay();
    byWeekday[index] = (byWeekday[index] ?? 0) + day.count;
  }
  let busiest: { name: string; total: number } | null = null;
  byWeekday.forEach((sum, i) => {
    if (!busiest || sum > busiest.total) busiest = { name: WEEKDAYS[i] ?? '', total: sum };
  });

  return {
    longestStreak: longest,
    currentStreak: current,
    best,
    busiestWeekday: busiest,
    weeklyAverage: days.length ? Math.round((total / days.length) * 7) : 0,
    activeDays: active,
    totalDays: days.length,
  };
}

const fmt = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export function GitHubInsights({ grid }: { grid: Day[][] }) {
  const insight = useMemo(() => deriveInsights(grid), [grid]);
  if (!insight.totalDays) return null;

  const consistency = Math.round((insight.activeDays / insight.totalDays) * 100);

  const cells: Array<[string, string, string | undefined]> = [
    ['Longest streak', `${insight.longestStreak}`, insight.longestStreak === 1 ? 'day' : 'days'],
    ['Current streak', `${insight.currentStreak}`, insight.currentStreak === 1 ? 'day' : 'days'],
    ['Busiest day', insight.best ? `${insight.best.count}` : '0', insight.best ? fmt(insight.best.date) : undefined],
    ['Per week', `${insight.weeklyAverage}`, 'on average'],
    ['Days active', `${consistency}%`, `${insight.activeDays} of ${insight.totalDays}`],
    ['Most active on', insight.busiestWeekday?.name ?? '—', undefined],
  ];

  return (
    <div className="gh-insights">
      {cells.map(([label, value, note]) => (
        <div key={label} className="gh-insight">
          <div className="gh-insight-label">{label}</div>
          {/* No data-countup on the weekday cell — it is a word, and the
              count-up reads an element's text as a number. */}
          <div className="gh-insight-value">{value}</div>
          {note && <div className="gh-insight-note">{note}</div>}
        </div>
      ))}
    </div>
  );
}

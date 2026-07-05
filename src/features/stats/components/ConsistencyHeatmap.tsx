/* eslint-disable @typescript-eslint/restrict-template-expressions, @typescript-eslint/prefer-nullish-coalescing */
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';

// Generates an array of the last 30 dates (including today)
function getLast30Days() {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d);
  }
  return dates;
}

export function ConsistencyHeatmap() {
  const sessions = useLiveQuery(() => db.studySessions.toArray(), []);

  const heatmapData = useMemo(() => {
    const dates = getLast30Days();

    // Create a map of "YYYY-MM-DD" -> count of reviews
    const sessionMap = new Map<string, number>();
    sessions?.forEach(session => {
      const d = new Date(session.startedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const existing = sessionMap.get(key) || 0;
      sessionMap.set(key, existing + session.totalReviewed);
    });

    return dates.map(date => {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return {
        date,
        key,
        count: sessionMap.get(key) || 0,
      };
    });
  }, [sessions]);

  if (!sessions) return null;

  return (
    <div className="bg-card border border-border shadow-sm rounded-xl p-5 mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">30-Day Consistency</h3>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {heatmapData.map((day) => {
          let colorClass = 'bg-muted'; // 0
          if (day.count > 0 && day.count <= 10) colorClass = 'bg-emerald-200 dark:bg-emerald-900/60';
          else if (day.count > 10 && day.count <= 30) colorClass = 'bg-emerald-400 dark:bg-emerald-600/80';
          else if (day.count > 30) colorClass = 'bg-emerald-600 dark:bg-emerald-400';

          return (
            <div
              key={day.key}
              className={`w-5 h-5 md:w-6 md:h-6 shrink-0 rounded-sm ${colorClass}`}
              title={`${day.date.toDateString()}: ${day.count} cards reviewed`}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground justify-end pr-2">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/60" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-600/80" />
          <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-400" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

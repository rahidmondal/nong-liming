/* eslint-disable @typescript-eslint/restrict-template-expressions, @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/no-non-null-assertion */
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function LearningCurve() {
  const reviews = useLiveQuery(() => db.reviewLogs.toArray(), []);

  const data = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];

    // Group reviews by Date and calculate average daily success rate
    const dailyMap = new Map<string, { attempts: number; successes: number }>();

    reviews.forEach(log => {
      const d = new Date(log.reviewedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const existing = dailyMap.get(key) || { attempts: 0, successes: 0 };
      existing.attempts += 1;
      if (log.rating >= 3) existing.successes += 1;
      dailyMap.set(key, existing);
    });

    // Convert to sorted array
    const sortedDates = Array.from(dailyMap.keys()).sort();

    return sortedDates
      .map(dateStr => {
        const { attempts, successes } = dailyMap.get(dateStr)!;
        // Truncate month-day for UI
        const label = dateStr.slice(5);
        return {
          date: label,
          retention: Math.round((successes / attempts) * 100),
        };
      })
      .slice(-14); // Only show last 14 active days
  }, [reviews]);

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-card border border-border shadow-sm rounded-xl p-5 mb-6 flex items-center justify-center h-48">
        <p className="text-sm text-muted-foreground">Review some cards to see your retention curve.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border shadow-sm rounded-xl p-5 mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-1">Retention over Time</h3>
      <p className="text-xs text-muted-foreground mb-6">Daily average success rate (%)</p>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
              itemStyle={{ color: 'var(--foreground)' }}
              labelStyle={{ color: 'var(--muted-foreground)', fontSize: '12px', marginBottom: '4px' }}
              formatter={(value: number) => [`${value}%`, 'Retention']}
            />
            <Area
              type="monotone"
              dataKey="retention"
              stroke="var(--primary)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRetention)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

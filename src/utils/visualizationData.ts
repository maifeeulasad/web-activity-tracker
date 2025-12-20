import { Tab, TimeInterval } from '../types';
import { formatDate, getHostname } from './helpers';
import { calculateWebsiteProductivity } from './productivityData';

// Helper to iterate dates from start to end (inclusive) using local-date normalization
function iterateDaysLocal(start: Date, end: Date, cb: (d: Date) => void) {
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    cb(new Date(d));
  }
}

export const prepareTimeTrendData = (_tabs: Tab[], intervals: TimeInterval[], _start: Date, _end: Date) => {
  const days: Record<string, number> = {};
  iterateDaysLocal(_start, _end, (d) => {
    days[formatDate(d)] = 0;
  });

  intervals.forEach(i => {
    if (i && i.date && days[i.date] !== undefined) {
      days[i.date] += i.duration || 0;
    }
  });

  return Object.entries(days).map(([date, time]) => ({ date, time }));
};

export const prepareDailyActivityData = (tabs: Tab[], _start: Date, _end: Date) => {
  // aggregate activity data for each day in range
  const days: Array<{ date: string; total: number }> = [];
  iterateDaysLocal(_start, _end, (d) => {
    const dateStr = formatDate(d);
    const total = tabs.reduce((sum, t) => {
      const day = t.days.find(dd => dd.date === dateStr);
      return sum + (day?.summary || 0);
    }, 0);
    days.push({ date: dateStr, total });
  });
  return days;
};

export const prepareSiteBreakdownData = (tabs: Tab[], _start: Date, _end: Date) => {
  // return top sites over the period
  const map = new Map<string, number>();
  tabs.forEach(t => {
    const total = t.days.reduce((s, d) => s + d.summary, 0);
    map.set(t.url, (map.get(t.url) || 0) + total);
  });

  return Array.from(map.entries()).map(([url, time]) => ({ url, time }));
};

export const prepareProductivityTrendData = (tabs: Tab[], _start: Date, _end: Date) => {
  // placeholder: return daily average productivity (not implemented)
  return prepareTimeTrendData(tabs, [], _start, _end).map(d => ({ ...d, productivity: Math.round(Math.random() * 40) + 60 }));
};

export const prepareHourlyPatternData = (intervals: TimeInterval[], date: Date) => {
  // Only include intervals that fall on the requested date
  const targetDate = formatDate(date);

  const arr = new Array(24).fill(0);
  intervals.forEach(i => {
    if (!i || i.date !== targetDate) return;
    const hour = new Date(i.startTime).getHours();
    arr[hour] += i.duration || 0;
  });

  return arr.map((time, hour) => ({ hour, time }));
};

export const prepareSessionAnalysisData = (tabs: Tab[], _start: Date, _end: Date) => {
  // Sessions are approximated by day counters
  const sessions: Array<{ date: string; sessions: number }> = [];
  iterateDaysLocal(_start, _end, (d) => {
    const dateStr = formatDate(d);
    const totalSessions = tabs.reduce((sum, t) => {
      const day = t.days.find(dd => dd.date === dateStr);
      return sum + (day?.counter || 0);
    }, 0);
    sessions.push({ date: dateStr, sessions: totalSessions });
  });
  return sessions;
};

export const prepareWeeklyOverviewData = (tabs: Tab[], _start?: Date, _end?: Date) => {
  // return top 7 sites summary, optionally constrained to a date range
  if (!_start || !_end) {
    // Fallback to original behavior: use overall summaryTime
    return tabs.map(t => ({ url: t.url, time: t.summaryTime, favicon: t.favicon }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 7);
  }

  const startTime = _start.getTime();
  const endTime = _end.getTime();

  return tabs
    .map(t => {
      const timeInRange = (t.days || []).reduce((sum, d) => {
        const dayTime = new Date(d.date).getTime();
        if (dayTime < startTime || dayTime > endTime) {
          return sum;
        }
        return sum + (d.summary || 0);
      }, 0);

      return { url: t.url, time: timeInRange, favicon: t.favicon };
    })
    .sort((a, b) => b.time - a.time)
    .slice(0, 7);
};

export const calculateRangeStats = (tabs: Tab[], start: Date, end: Date) => {
  const startStr = formatDate(start);
  const endStr = formatDate(end);

  let totalTime = 0;
  const totalSessions = tabs.reduce((sum, t) => sum + t.counter, 0);

  // Weighted productivity: sum(time * siteScore) / totalTime
  let weightedScoreSum = 0;

  tabs.forEach(t => {
    const timeInRange = (t.days || []).reduce((sum, d) => {
      if (d.date >= startStr && d.date <= endStr) return sum + (d.summary || 0);
      return sum;
    }, 0);

    if (timeInRange > 0) {
      totalTime += timeInRange;
      const hostname = getHostname(t.url);
      const siteScore = calculateWebsiteProductivity(hostname).score;
      weightedScoreSum += timeInRange * siteScore;
    }
  });

  const uniqueSites = tabs.filter(t => (t.days || []).some(d => d.date >= startStr && d.date <= endStr)).length;

  const productivityScore = totalTime > 0 ? Math.round(Math.max(0, Math.min(100, weightedScoreSum / totalTime))) : 75;

  return { totalTime, totalSessions, uniqueSites, productivityScore };
};

import { Tab, TimeInterval } from '../types';
import { formatDate } from './helpers';

export const prepareTimeTrendData = (_tabs: Tab[], intervals: TimeInterval[], _start: Date, _end: Date) => {
  const days: Record<string, number> = {};
  for (let d = new Date(_start); d <= _end; d.setDate(d.getDate() + 1)) {
    days[formatDate(new Date(d))] = 0;
  }

  intervals.forEach(i => {
    if (i && i.date && days[i.date] !== undefined) {
      days[i.date] += i.duration || 0;
    }
  });

  return Object.entries(days).map(([date, time]) => ({ date, time }));
};

export const prepareDailyActivityData = (tabs: Tab[], _start: Date, _end: Date) => {
  // flatten days in range
  const days: Array<{ date: string; total: number }> = [];
  for (let d = new Date(_start); d <= _end; d.setDate(d.getDate() + 1)) {
    const dateStr = formatDate(new Date(d));
    const total = tabs.reduce((sum, t) => {
      const day = t.days.find(dd => dd.date === dateStr);
      return sum + (day?.summary || 0);
    }, 0);
    days.push({ date: dateStr, total });
  }
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
  for (let d = new Date(_start); d <= _end; d.setDate(d.getDate() + 1)) {
    const dateStr = formatDate(new Date(d));
    const totalSessions = tabs.reduce((sum, t) => {
      const day = t.days.find(dd => dd.date === dateStr);
      return sum + (day?.counter || 0);
    }, 0);
    sessions.push({ date: dateStr, sessions: totalSessions });
  }
  return sessions;
};

export const prepareWeeklyOverviewData = (tabs: Tab[]) => {
  // return top 7 days summary
  return tabs.map(t => ({ url: t.url, time: t.summaryTime, favicon: t.favicon }))
    .sort((a, b) => b.time - a.time)
    .slice(0, 7);
};

export const calculateRangeStats = (tabs: Tab[], _start: Date, _end: Date) => {
  const totalTime = tabs.reduce((sum, t) => sum + t.summaryTime, 0);
  const totalSessions = tabs.reduce((sum, t) => sum + t.counter, 0);
  const uniqueSites = tabs.length;
  const productivityScore = Math.round(Math.max(0, Math.min(100, 75)));

  return { totalTime, totalSessions, uniqueSites, productivityScore };
};

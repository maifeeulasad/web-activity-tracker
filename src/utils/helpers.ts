import { format, isSameDay, subDays } from 'date-fns';
import { Tab, TabDay, TimeInterval } from '../types';

// Date utilities
export const formatDate = (date: Date | string): string => {
  return format(typeof date === 'string' ? new Date(date) : date, 'yyyy-MM-dd');
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

export const isToday = (date: string): boolean => {
  return isSameDay(new Date(date), new Date());
};

export const isYesterday = (date: string): boolean => {
  return isSameDay(new Date(date), subDays(new Date(), 1));
};

export const getDateRange = (days: number): { start: string; end: string } => {
  const end = new Date();
  const start = subDays(end, days);
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
};

// URL utilities
export const getHostname = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

export const getFaviconUrl = (url: string): string => {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return '';
  }
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Time tracking utilities
export const createNewTab = (url: string): Tab => {
  const today = formatDate(new Date());
  return {
    url,
    favicon: getFaviconUrl(url),
    summaryTime: 0,
    counter: 0,
    days: [
      {
        counter: 0,
        date: today,
        summary: 0,
      },
    ],
  };
};

export const incrementTabTime = (tab: Tab): Tab => {
  const today = formatDate(new Date());
  const existingDay = tab.days.find(day => day.date === today);

  if (existingDay) {
    existingDay.summary += 1;
    existingDay.counter += 1;
  } else {
    tab.days.push({
      counter: 1,
      date: today,
      summary: 1,
    });
  }

  tab.summaryTime += 1;
  tab.counter += 1;

  return tab;
};

export const createTimeInterval = (
  tabId: string,
  url: string,
  title: string,
  startTime: number
): TimeInterval => {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tabId,
    url,
    title,
    startTime,
    duration: 0,
    date: formatDate(new Date()),
  };
};

// Statistics utilities
export const calculateDailySummary = (
  tabs: Tab[],
  date: string
): {
  totalTime: number;
  siteCount: number;
  mostVisitedSite: string;
  topSites: Array<{ url: string; time: number; favicon?: string }>;
} => {
  const dayTabs = tabs.filter(tab =>
    tab.days.some(day => day.date === date)
  );

  const totalTime = dayTabs.reduce((sum, tab) => {
    const dayData = tab.days.find(day => day.date === date);
    return sum + (dayData?.summary || 0);
  }, 0);

  const siteCount = dayTabs.length;

  const mostVisitedSite = dayTabs.reduce((max, tab) => {
    const dayData = tab.days.find(day => day.date === date);
    const currentTime = dayData?.summary || 0;
    const maxTime = max.day ? max.day.summary : 0;

    return currentTime > maxTime ? { tab, day: dayData! } : max;
  }, { tab: null as Tab | null, day: null as TabDay | null });

  const topSites = dayTabs
    .map(tab => {
      const dayData = tab.days.find(day => day.date === date);
      return {
        url: tab.url,
        time: dayData?.summary || 0,
        favicon: tab.favicon,
      };
    })
    .sort((a, b) => b.time - a.time)
    .slice(0, 10);

  return {
    totalTime,
    siteCount,
    mostVisitedSite: mostVisitedSite.tab?.url || 'N/A',
    topSites,
  };
};

export const calculateHourlyData = (
  intervals: TimeInterval[],
  date: string
): Array<{ hour: number; time: number }> => {
  const hourlyData = new Array(24).fill(0);

  const dayIntervals = intervals.filter(interval => interval.date === date);

  dayIntervals.forEach(interval => {
    const hour = new Date(interval.startTime).getHours();
    hourlyData[hour] += interval.duration;
  });

  return hourlyData.map((time, hour) => ({ hour, time }));
};

// Data validation
export const validateTimeInterval = (interval: Partial<TimeInterval>): boolean => {
  return !!(
    interval.id &&
    interval.tabId &&
    interval.url &&
    interval.startTime &&
    interval.date
  );
};

export const sanitizeUrl = (url: string): string => {
  try {
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const urlObj = new URL(url);
    return urlObj.toString();
  } catch {
    return '';
  }
};
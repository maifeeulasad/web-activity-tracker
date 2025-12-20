export interface TabDay {
  counter: number;
  date: string;
  summary: number;
}

export interface Tab {
  url: string;
  favicon?: string;
  summaryTime: number;
  counter: number;
  days: TabDay[];
}

export interface SiteLimit {
  url: string;
  dailyLimit: number; // in minutes
  enabled: boolean;
  blocked: boolean;
}

export interface DailySummary {
  date: string;
  totalTime: number;
  siteCount: number;
  mostVisitedSite: string;
  productivityScore: number;
}

export interface TimeInterval {
  id: string;
  tabId: string;
  url: string;
  title: string;
  startTime: number;
  endTime?: number;
  duration: number;
  date: string;
}

export interface Settings {
  notifications: boolean;
  dailyReminder: boolean;
  pomodoroEnabled: boolean;
  pomodoroTime: number; // in minutes
  breakTime: number; // in minutes
  darkMode: boolean;
  language: string;
}

export interface AppState {
  tabs: Tab[];
  timeIntervals: TimeInterval[];
  siteLimits: SiteLimit[];
  settings: Settings;
  isTracking: boolean;
  currentTab?: Tab;
}
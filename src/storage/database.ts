import { Database, DataClass, KeyPath, Index } from 'idb-ts';
import { Tab as ITab, TimeInterval as ITimeInterval, SiteLimit as ISiteLimit, TabDay } from '../types';

// Entity classes with decorators
@DataClass()
class TabEntity {
  @KeyPath()
  url!: string;

  favicon?: string;
  summaryTime!: number;
  counter!: number;
  days!: TabDay[];

  constructor(url: string, favicon: string | undefined, summaryTime: number, counter: number, days: TabDay[]) {
    this.url = url;
    this.favicon = favicon;
    this.summaryTime = summaryTime;
    this.counter = counter;
    this.days = days;
  }

  static fromInterface(tab: ITab): TabEntity {
    return new TabEntity(tab.url, tab.favicon, tab.summaryTime, tab.counter, tab.days);
  }

  toInterface(): ITab {
    return {
      url: this.url,
      favicon: this.favicon,
      summaryTime: this.summaryTime,
      counter: this.counter,
      days: this.days,
    };
  }
}

@DataClass()
class TimeIntervalEntity {
  @KeyPath()
  id!: string;

  @Index()
  date!: string;

  @Index()
  tabId!: string;

  url!: string;
  title!: string;
  startTime!: number;
  endTime?: number;
  duration!: number;

  constructor(id: string, tabId: string, url: string, title: string, startTime: number, duration: number, date: string, endTime?: number) {
    this.id = id;
    this.tabId = tabId;
    this.url = url;
    this.title = title;
    this.startTime = startTime;
    this.duration = duration;
    this.date = date;
    this.endTime = endTime;
  }

  static fromInterface(interval: ITimeInterval): TimeIntervalEntity {
    return new TimeIntervalEntity(
      interval.id,
      interval.tabId,
      interval.url,
      interval.title,
      interval.startTime,
      interval.duration,
      interval.date,
      interval.endTime
    );
  }

  toInterface(): ITimeInterval {
    return {
      id: this.id,
      tabId: this.tabId,
      url: this.url,
      title: this.title,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      date: this.date,
    };
  }
}

@DataClass()
class SiteLimitEntity {
  @KeyPath()
  url!: string;

  dailyLimit!: number;
  enabled!: boolean;
  blocked!: boolean;

  constructor(url: string, dailyLimit: number, enabled: boolean, blocked: boolean) {
    this.url = url;
    this.dailyLimit = dailyLimit;
    this.enabled = enabled;
    this.blocked = blocked;
  }

  static fromInterface(limit: ISiteLimit): SiteLimitEntity {
    return new SiteLimitEntity(limit.url, limit.dailyLimit, limit.enabled, limit.blocked);
  }

  toInterface(): ISiteLimit {
    return {
      url: this.url,
      dailyLimit: this.dailyLimit,
      enabled: this.enabled,
      blocked: this.blocked,
    };
  }
}

@DataClass()
class SettingEntity {
  @KeyPath()
  key!: string;

  value!: any;

  constructor(key: string, value: any) {
    this.key = key;
    this.value = value;
  }
}

type DatabaseType = {
  TabEntity: any;
  TimeIntervalEntity: any;
  SiteLimitEntity: any;
  SettingEntity: any;
};

class StorageManager {
  private db: (Database & DatabaseType) | null = null;

  async init() {
    if (!this.db) {
      this.db = await Database.build('web-activity-tracker', [
        TabEntity,
        TimeIntervalEntity,
        SiteLimitEntity,
        SettingEntity,
      ]) as Database & DatabaseType;
    }
  }

  // Tab operations
  async saveTab(tab: ITab): Promise<void> {
    await this.init();
    const entity = TabEntity.fromInterface(tab);
    await this.db!.TabEntity.update(entity);
  }

  async saveOrUpdateTab(tab: ITab): Promise<void> {
    await this.init();
    const entity = TabEntity.fromInterface(tab);
    
    // Check if tab exists
    const existing = await this.db!.TabEntity.read(entity.url);
    if (existing) {
      // Merge with existing data
      entity.summaryTime = (existing.summaryTime || 0) + (entity.summaryTime || 0);
      entity.counter = (existing.counter || 0) + (entity.counter || 0);
      
      // Merge days data
      const existingDays = new Map(existing.days?.map((d:any) => [d.date, d]) || []);
      entity.days = entity.days?.map(day => {
        const existingDay = existingDays.get(day.date);
        if (existingDay) {
          return {
            ...day,
            // @ts-ignore
            summary: (existingDay.summary || 0) + (day.summary || 0),
            // @ts-ignore
            counter: (existingDay.counter || 0) + (day.counter || 0),
          };
        }
        return day;
      }) || existing.days || [];
    }
    
    await this.db!.TabEntity.update(entity);
  }

  async getTab(url: string): Promise<ITab | undefined> {
    await this.init();
    const entity = await this.db!.TabEntity.read(url);
    if (!entity) return undefined;
    // idb-ts returns plain objects, so we need to convert them
    return {
      url: entity.url,
      favicon: entity.favicon,
      summaryTime: entity.summaryTime,
      counter: entity.counter,
      days: entity.days,
    };
  }

  async getAllTabs(): Promise<ITab[]> {
    await this.init();
    const entities = await this.db!.TabEntity.list();
    return entities.map((e: any) => ({
      url: e.url,
      favicon: e.favicon,
      summaryTime: e.summaryTime,
      counter: e.counter,
      days: e.days,
    }));
  }

  async deleteTab(url: string): Promise<void> {
    await this.init();
    await this.db!.TabEntity.delete(url);
  }

  // Time interval operations
  async saveTimeInterval(interval: ITimeInterval): Promise<void> {
    await this.init();
    const entity = TimeIntervalEntity.fromInterface(interval);
    await this.db!.TimeIntervalEntity.update(entity);
  }

  async getTimeIntervalsByDate(date: string): Promise<ITimeInterval[]> {
    await this.init();
    const entities = await this.db!.TimeIntervalEntity.findByIndex('date', date);
    return entities.map((e: any) => ({
      id: e.id,
      tabId: e.tabId,
      url: e.url,
      title: e.title,
      startTime: e.startTime,
      endTime: e.endTime,
      duration: e.duration,
      date: e.date,
    }));
  }

  async getTimeIntervalsByTab(tabId: string): Promise<ITimeInterval[]> {
    await this.init();
    const entities = await this.db!.TimeIntervalEntity.findByIndex('tabId', tabId);
    return entities.map((e: any) => ({
      id: e.id,
      tabId: e.tabId,
      url: e.url,
      title: e.title,
      startTime: e.startTime,
      endTime: e.endTime,
      duration: e.duration,
      date: e.date,
    }));
  }

  async getAllTimeIntervals(): Promise<ITimeInterval[]> {
    await this.init();
    const entities = await this.db!.TimeIntervalEntity.list();
    return entities.map((e: any) => ({
      id: e.id,
      tabId: e.tabId,
      url: e.url,
      title: e.title,
      startTime: e.startTime,
      endTime: e.endTime,
      duration: e.duration,
      date: e.date,
    }));
  }

  async deleteTimeInterval(id: string): Promise<void> {
    await this.init();
    await this.db!.TimeIntervalEntity.delete(id);
  }

  // Site limit operations
  async saveSiteLimit(limit: ISiteLimit): Promise<void> {
    await this.init();
    const entity = SiteLimitEntity.fromInterface(limit);
    await this.db!.SiteLimitEntity.update(entity);
  }

  async getSiteLimit(url: string): Promise<ISiteLimit | undefined> {
    await this.init();
    const entity = await this.db!.SiteLimitEntity.read(url);
    if (!entity) return undefined;
    return {
      url: entity.url,
      dailyLimit: entity.dailyLimit,
      enabled: entity.enabled,
      blocked: entity.blocked,
    };
  }

  async getAllSiteLimits(): Promise<ISiteLimit[]> {
    await this.init();
    const entities = await this.db!.SiteLimitEntity.list();
    return entities.map((e: any) => ({
      url: e.url,
      dailyLimit: e.dailyLimit,
      enabled: e.enabled,
      blocked: e.blocked,
    }));
  }

  async deleteSiteLimit(url: string): Promise<void> {
    await this.init();
    await this.db!.SiteLimitEntity.delete(url);
  }

  // Settings operations
  async saveSetting(key: string, value: any): Promise<void> {
    await this.init();
    const entity = new SettingEntity(key, value);
    await this.db!.SettingEntity.update(entity);
  }

  async getSetting(key: string): Promise<any> {
    await this.init();
    const entity = await this.db!.SettingEntity.read(key);
    return entity?.value;
  }

  async getAllSettings(): Promise<Record<string, any>> {
    await this.init();
    const entities = await this.db!.SettingEntity.list();
    return entities.reduce((acc: Record<string, any>, entity: any) => {
      acc[entity.key] = entity.value;
      return acc;
    }, {} as Record<string, any>);
  }

  // Utility operations
  async clearAllData(): Promise<void> {
    await this.init();
    
    // Clear all object stores
    await Promise.all([
      this.db!.TabEntity.clear(),
      this.db!.TimeIntervalEntity.clear(),
      this.db!.SiteLimitEntity.clear(),
      this.db!.SettingEntity.clear(),
    ]);
  }

  // Recalculate tab summary from time intervals
  async recalculateTabSummary(url: string): Promise<void> {
    await this.init();
    
    const intervals = await this.db!.TimeIntervalEntity.findByIndex('tabId', url);
    if (!intervals || intervals.length === 0) return;
    
    const tab = await this.db!.TabEntity.read(url);
    if (!tab) return;
    
    // Reset counters
    tab.summaryTime = 0;
    tab.counter = 0;
    tab.days = [];
    
    // Aggregate data from intervals
    const dayMap = new Map();
    
    intervals.forEach((interval: any) => {
      tab.summaryTime += interval.duration || 0;
      tab.counter += 1;
      
      const day = interval.date;
      if (!dayMap.has(day)) {
        dayMap.set(day, { date: day, counter: 0, summary: 0 });
      }
      
      const dayData = dayMap.get(day);
      dayData.counter += 1;
      dayData.summary += interval.duration || 0;
    });
    
    tab.days = Array.from(dayMap.values());
    
    await this.db!.TabEntity.update(tab);
  }

  async exportData(): Promise<{
    tabs: ITab[];
    timeIntervals: ITimeInterval[];
    siteLimits: ISiteLimit[];
    settings: Record<string, any>;
  }> {
    return {
      tabs: await this.getAllTabs(),
      timeIntervals: await this.getAllTimeIntervals(),
      siteLimits: await this.getAllSiteLimits(),
      settings: await this.getAllSettings(),
    };
  }

  async importData(data: {
    tabs?: ITab[];
    timeIntervals?: ITimeInterval[];
    siteLimits?: ISiteLimit[];
    settings?: Record<string, any>;
  }): Promise<void> {
    await this.init();

    if (data.tabs) {
      await Promise.all(data.tabs.map(tab => this.saveTab(tab)));
    }

    if (data.timeIntervals) {
      await Promise.all(data.timeIntervals.map(interval => this.saveTimeInterval(interval)));
    }

    if (data.siteLimits) {
      await Promise.all(data.siteLimits.map(limit => this.saveSiteLimit(limit)));
    }

    if (data.settings) {
      await Promise.all(
        Object.entries(data.settings).map(([key, value]) => this.saveSetting(key, value))
      );
    }
  }
}

export const storageManager = new StorageManager();
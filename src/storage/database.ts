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
    await this.db!.TabEntity.create(entity);
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
    await this.db!.TimeIntervalEntity.create(entity);
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
    await this.db!.SiteLimitEntity.create(entity);
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
    await this.db!.SettingEntity.create(entity);
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
    const tabs = await this.db!.TabEntity.list();
    const intervals = await this.db!.TimeIntervalEntity.list();
    const limits = await this.db!.SiteLimitEntity.list();

    await Promise.all([
      ...tabs.map((t: any) => this.db!.TabEntity.delete(t.url)),
      ...intervals.map((i: any) => this.db!.TimeIntervalEntity.delete(i.id)),
      ...limits.map((l: any) => this.db!.SiteLimitEntity.delete(l.url)),
    ]);
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
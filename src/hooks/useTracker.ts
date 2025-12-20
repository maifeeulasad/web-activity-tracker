import { useState, useEffect, useCallback } from 'react';
import { Tab, TimeInterval, SiteLimit, Settings } from '../types';
import { storageManager } from '../storage/database';
import { createNewTab, incrementTabTime, createTimeInterval } from '../utils/helpers';

interface UseTrackerResult {
  tabs: Tab[];
  currentTab: Tab | null;
  timeIntervals: TimeInterval[];
  isTracking: boolean;
  startTracking: (url: string, title: string) => void;
  stopTracking: () => void;
  refreshData: () => Promise<void>;
  saveTab: (tab: Tab) => Promise<void>;
  deleteTab: (url: string) => Promise<void>;
}

export const useTracker = (): UseTrackerResult => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [currentTab, setCurrentTab] = useState<Tab | null>(null);
  const [timeIntervals, setTimeIntervals] = useState<TimeInterval[]>([]);
  const [isTracking, setIsTracking] = useState(false);

  // Load initial data
  const refreshData = useCallback(async () => {
    try {
      const [allTabs, allIntervals] = await Promise.all([
        storageManager.getAllTabs(),
        storageManager.getAllTimeIntervals(),
      ]);

      setTabs(allTabs);
      setTimeIntervals(allIntervals);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Track active tab (simulated - in real extension this would come from chrome.tabs)
  const startTracking = useCallback(async (url: string, title: string) => {
    try {
      let tab = await storageManager.getTab(url);

      if (!tab) {
        tab = createNewTab(url);
        await storageManager.saveTab(tab);
      }

      const updatedTab = incrementTabTime(tab);
      await storageManager.saveTab(updatedTab);

      const interval = createTimeInterval(url, url, title, Date.now());
      await storageManager.saveTimeInterval(interval);

      setCurrentTab(updatedTab);
      setIsTracking(true);

      // Refresh data
      await refreshData();
    } catch (error) {
      console.error('Error starting tracking:', error);
    }
  }, [refreshData]);

  const stopTracking = useCallback(async () => {
    try {
      setIsTracking(false);
      setCurrentTab(null);
      await refreshData();
    } catch (error) {
      console.error('Error stopping tracking:', error);
    }
  }, [refreshData]);

  const saveTab = useCallback(async (tab: Tab) => {
    try {
      await storageManager.saveTab(tab);
      await refreshData();
    } catch (error) {
      console.error('Error saving tab:', error);
    }
  }, [refreshData]);

  const deleteTab = useCallback(async (url: string) => {
    try {
      await storageManager.deleteTab(url);
      await refreshData();
    } catch (error) {
      console.error('Error deleting tab:', error);
    }
  }, [refreshData]);

  return {
    tabs,
    currentTab,
    timeIntervals,
    isTracking,
    startTracking,
    stopTracking,
    refreshData,
    saveTab,
    deleteTab,
  };
};

interface UseSiteLimitsResult {
  siteLimits: SiteLimit[];
  addSiteLimit: (limit: SiteLimit) => Promise<void>;
  updateSiteLimit: (url: string, updates: Partial<SiteLimit>) => Promise<void>;
  deleteSiteLimit: (url: string) => Promise<void>;
  getSiteLimit: (url: string) => Promise<SiteLimit | undefined>;
  checkSiteLimit: (url: string) => Promise<boolean>; // Returns true if site should be blocked
}

export const useSiteLimits = (): UseSiteLimitsResult => {
  const [siteLimits, setSiteLimits] = useState<SiteLimit[]>([]);

  const refreshSiteLimits = useCallback(async () => {
    try {
      const limits = await storageManager.getAllSiteLimits();
      setSiteLimits(limits);
    } catch (error) {
      console.error('Error loading site limits:', error);
    }
  }, []);

  useEffect(() => {
    refreshSiteLimits();
  }, [refreshSiteLimits]);

  const addSiteLimit = useCallback(async (limit: SiteLimit) => {
    try {
      await storageManager.saveSiteLimit(limit);
      await refreshSiteLimits();
    } catch (error) {
      console.error('Error adding site limit:', error);
    }
  }, [refreshSiteLimits]);

  const updateSiteLimit = useCallback(async (url: string, updates: Partial<SiteLimit>) => {
    try {
      const existingLimit = await storageManager.getSiteLimit(url);
      if (existingLimit) {
        const updatedLimit = { ...existingLimit, ...updates };
        await storageManager.saveSiteLimit(updatedLimit);
        await refreshSiteLimits();
      }
    } catch (error) {
      console.error('Error updating site limit:', error);
    }
  }, [refreshSiteLimits]);

  const deleteSiteLimit = useCallback(async (url: string) => {
    try {
      await storageManager.deleteSiteLimit(url);
      await refreshSiteLimits();
    } catch (error) {
      console.error('Error deleting site limit:', error);
    }
  }, [refreshSiteLimits]);

  const getSiteLimit = useCallback(async (url: string) => {
    try {
      return await storageManager.getSiteLimit(url);
    } catch (error) {
      console.error('Error getting site limit:', error);
      return undefined;
    }
  }, []);

  const checkSiteLimit = useCallback(async (url: string): Promise<boolean> => {
    try {
      const limit = await storageManager.getSiteLimit(url);
      if (!limit || !limit.enabled) {
        return false; // Not blocked
      }

      // In a real implementation, you'd calculate the actual time spent today
      // For now, we'll use a placeholder calculation
      return limit.blocked;
    } catch (error) {
      console.error('Error checking site limit:', error);
      return false;
    }
  }, []);

  return {
    siteLimits,
    addSiteLimit,
    updateSiteLimit,
    deleteSiteLimit,
    getSiteLimit,
    checkSiteLimit,
  };
};

interface UseSettingsResult {
  settings: Settings;
  updateSetting: (key: keyof Settings, value: any) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
  notifications: true,
  dailyReminder: true,
  pomodoroEnabled: false,
  pomodoroTime: 25,
  breakTime: 5,
  darkMode: false,
  language: 'en',
};

export const useSettings = (): UseSettingsResult => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const loadSettings = useCallback(async () => {
    try {
      const savedSettings = await storageManager.getAllSettings();
      setSettings({ ...defaultSettings, ...savedSettings });
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(defaultSettings);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSetting = useCallback(async (key: keyof Settings, value: any) => {
    try {
      await storageManager.saveSetting(key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  }, []);

  const resetSettings = useCallback(async () => {
    try {
      // Clear all settings from the database
      const allSettings = await storageManager.getAllSettings();
      for (const key of Object.keys(allSettings)) {
        await storageManager.saveSetting(key, undefined);
      }
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  }, []);

  return {
    settings,
    updateSetting,
    resetSettings,
  };
};
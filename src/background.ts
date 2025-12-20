// Background service worker for Web Activity Tracker
import { storageManager } from './storage/database';

// Track current active tab and timing
let currentTab: chrome.tabs.Tab | null = null;
let currentStartTime: number | null = null;

// Initialize storage manager
async function initializeStorage() {
  try {
    await storageManager.init();
    console.log('Storage manager initialized');
  } catch (error) {
    console.error('Failed to initialize storage:', error);
  }
}

// Get current date string in YYYY-MM-DD format
function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Generate unique ID
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// Get hostname from URL (normalized)
function getHostname(url: string): string {
  try {
    const urlObj = new URL(url);
    // Only return hostname, ignore path, query, and hash
    return urlObj.hostname;
  } catch {
    return url;
  }
}

// Normalize URL to just hostname for storage
function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

// Save time interval to database
async function saveTimeInterval(tabInfo: chrome.tabs.Tab, startTime: number, endTime: number): Promise<void> {
  const duration = Math.floor((endTime - startTime) / 1000); // in seconds

  if (duration < 1) return; // Skip intervals less than 1 second
  if (!tabInfo.id || !tabInfo.url) return; // Skip if missing essential data

  const interval = {
    id: generateId(),
    tabId: normalizeUrl(tabInfo.url),
    url: normalizeUrl(tabInfo.url),
    title: tabInfo.title || getHostname(tabInfo.url),
    startTime,
    endTime,
    duration,
    date: getCurrentDate(),
  };

  try {
    await storageManager.saveTimeInterval(interval);
    await updateTabSummary(tabInfo, duration);
  } catch (error) {
    console.error('Failed to save time interval:', error);
  }
}

// Update tab summary
async function updateTabSummary(tabInfo: chrome.tabs.Tab, additionalTime: number): Promise<void> {
  try {
    if (!tabInfo.url) return; // Skip if URL is missing

    const normalizedUrl = normalizeUrl(tabInfo.url);
    let tab = await storageManager.getTab(normalizedUrl);
    const today = getCurrentDate();

    if (!tab) {
      tab = {
        url: normalizedUrl,
        favicon: tabInfo.favIconUrl,
        summaryTime: 0,
        counter: 0,
        days: [],
      };
    }

    // Update summary time and counter
    tab.summaryTime += additionalTime;
    tab.counter += 1;

    // Update today's data
    let todayData = tab.days.find(d => d.date === today);
    if (!todayData) {
      todayData = {
        date: today,
        counter: 0,
        summary: 0,
      };
      tab.days.push(todayData);
    }

    todayData.summary += additionalTime;
    todayData.counter += 1;

    // Use saveOrUpdateTab to handle existing records properly
    await storageManager.saveOrUpdateTab(tab);

    // Check site limits
    await checkSiteLimit(normalizedUrl, todayData.summary);
  } catch (error) {
    console.error('Failed to update tab summary:', error);
  }
}

// Check if site has exceeded daily limit
async function checkSiteLimit(url: string, todayTime: number): Promise<void> {
  try {
    const limit = await storageManager.getSiteLimit(url);
    if (limit && limit.enabled) {
      const timeInMinutes = Math.floor(todayTime / 60);
      if (timeInMinutes >= limit.dailyLimit) {
        // Show notification
        const settings = await storageManager.getAllSettings();
        if (settings.notifications !== false) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon-128.png',
            title: 'Site Limit Reached',
            message: `You've reached your daily limit for ${url}`,
            priority: 2,
          });
        }

        // Update limit to blocked
        await storageManager.saveSiteLimit({
          ...limit,
          blocked: true,
        });
      }
    }
  } catch (error) {
    console.error('Failed to check site limit:', error);
  }
}

// Start tracking a tab
function startTracking(tab: chrome.tabs.Tab): void {
  if (!tab || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('about:') || tab.url.startsWith('chrome-extension://')) {
    return;
  }

  // Stop previous tracking if any
  stopTracking();

  currentTab = tab;
  currentStartTime = Date.now();

  console.log('Started tracking:', tab.url);
}

// Stop tracking current tab
function stopTracking() {
  if (currentTab && currentStartTime) {
    const endTime = Date.now();
    saveTimeInterval(currentTab, currentStartTime, endTime);
    console.log('Stopped tracking:', currentTab.url);
  }

  currentTab = null;
  currentStartTime = null;
}

// Handle tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    stopTracking();
    startTracking(tab);
  } catch (error) {
    console.error('Error handling tab activation:', error);
  }
});

// Handle tab updates (URL changes)
chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    stopTracking();
    startTracking(tab);
  }
});

// Handle window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus
    stopTracking();
  } else {
    // Browser gained focus
    try {
      const [tab] = await chrome.tabs.query({ active: true, windowId });
      if (tab) {
        startTracking(tab);
      }
    } catch (error) {
      console.error('Error handling window focus:', error);
    }
  }
});

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  if (currentTab && currentTab.id === tabId) {
    stopTracking();
  }
});

// Periodic save (every minute) to ensure data isn't lost
chrome.alarms.create('periodicSave', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'periodicSave' && currentTab && currentStartTime) {
    const now = Date.now();
    // Save accumulated time
    saveTimeInterval(currentTab, currentStartTime, now);
    // Reset start time for next interval
    currentStartTime = now;
  }
});

// Handle extension installation/update
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed/updated');
  await initializeStorage();

  // Start tracking the current active tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      startTracking(tab);
    }
  } catch (error) {
    console.error('Error starting initial tracking:', error);
  }
});

// Handle browser startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('Browser started');
  await initializeStorage();

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      startTracking(tab);
    }
  } catch (error) {
    console.error('Error starting tracking on startup:', error);
  }
});

// Initialize on load
initializeStorage();

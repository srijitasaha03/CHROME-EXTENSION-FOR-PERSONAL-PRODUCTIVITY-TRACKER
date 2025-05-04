// Background script for SimpleTrack extension
let sessionStart = Date.now();
let currentDomain = null;
let trackingData = {};

console.log('SimpleTrack background service worker loaded');

// Initialize data from storage
chrome.storage.local.get(['simpletrack-data'], function(result) {
  if (result['simpletrack-data']) {
    trackingData = result['simpletrack-data'];
  }
  
  // Initialize today's data if not present
  const today = new Date().toISOString().split('T')[0];
  if (!trackingData[today]) {
    trackingData[today] = {
      domains: {},
      productiveMinutes: 0,
      distractingMinutes: 0,
      tasksCompleted: 0,
    };
    
    // Save the initialized data
    chrome.storage.local.set({'simpletrack-data': trackingData});
  }
});

// Helper to categorize domains
function categorizeDomain(domain) {
  const productiveDomains = ['github.com', 'stackoverflow.com', 'docs.google.com', 'linkedin.com'];
  const distractingDomains = ['youtube.com', 'facebook.com', 'twitter.com', 'instagram.com', 'reddit.com', 'tiktok.com'];
  
  if (productiveDomains.some(d => domain.includes(d))) {
    return 'productive';
  } else if (distractingDomains.some(d => domain.includes(d))) {
    return 'distracting';
  } else {
    return 'neutral';
  }
}

// Record time spent on a domain
function recordTimeSpent(domain, timeInMs) {
  if (!domain) return;
  
  const today = new Date().toISOString().split('T')[0];
  if (!trackingData[today]) {
    trackingData[today] = {
      domains: {},
      productiveMinutes: 0,
      distractingMinutes: 0,
      tasksCompleted: 0,
    };
  }
  
  // Create domain entry if it doesn't exist
  if (!trackingData[today].domains[domain]) {
    const category = categorizeDomain(domain);
    trackingData[today].domains[domain] = {
      timeSpent: 0,
      category
    };
  }
  
  // Add time spent
  const timeInMinutes = Math.round(timeInMs / 60000);
  trackingData[today].domains[domain].timeSpent += timeInMinutes;
  
  // Update total minutes by category
  const category = trackingData[today].domains[domain].category;
  if (category === 'productive') {
    trackingData[today].productiveMinutes += timeInMinutes;
  } else if (category === 'distracting') {
    trackingData[today].distractingMinutes += timeInMinutes;
  }
  
  // Save data
  chrome.storage.local.set({'simpletrack-data': trackingData});
}

// Get domain from URL
function getDomainFromUrl(url) {
  if (!url) return null;
  
  try {
    const hostname = new URL(url).hostname;
    return hostname;
  } catch (e) {
    console.error('Error parsing URL:', e);
    return null;
  }
}

// Handle tab changes
chrome.tabs.onActivated.addListener(async function(activeInfo) {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    const now = Date.now();
    
    // Record time spent on previous domain
    if (currentDomain) {
      const timeSpent = now - sessionStart;
      recordTimeSpent(currentDomain, timeSpent);
    }
    
    // Update current domain and session start
    currentDomain = getDomainFromUrl(tab.url);
    sessionStart = now;
  } catch (e) {
    console.error('Error in tab activation handler:', e);
  }
});

// Handle URL changes within the same tab
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.url) {
    const now = Date.now();
    
    // Record time spent on previous domain
    if (currentDomain) {
      const timeSpent = now - sessionStart;
      recordTimeSpent(currentDomain, timeSpent);
    }
    
    // Update current domain and session start
    currentDomain = getDomainFromUrl(changeInfo.url);
    sessionStart = now;
  }
});

// Handle when the user becomes idle or returns from idle
chrome.idle.onStateChanged.addListener(function(state) {
  const now = Date.now();
  
  if (state === 'active') {
    // User returned from being idle, reset the session
    sessionStart = now;
  } else if (state === 'idle' || state === 'locked') {
    // User became idle, record time spent on current domain
    if (currentDomain) {
      const timeSpent = now - sessionStart;
      recordTimeSpent(currentDomain, timeSpent);
      currentDomain = null;
    }
  }
});

// Set up idle detection (consider user idle after 2 minutes)
chrome.idle.setDetectionInterval(120);

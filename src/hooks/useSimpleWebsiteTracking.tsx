import { useState, useEffect } from 'react';
import { WebsiteUsage } from '@/utils/mockData';

// Add Chrome extension API type declarations
declare global {
  interface Window {
    chrome?: {
      storage?: {
        local?: {
          get: (keys: string[], callback: (result: any) => void) => void;
          set: (items: Record<string, any>, callback?: () => void) => void;
        };
        onChanged?: {
          addListener: (callback: (changes: any, namespace: string) => void) => void;
        };
      };
      runtime?: {
        id?: string;
      };
    };
  }
}

// Simple statistics structure
interface SimpleStats {
  productiveHours: number;
  distractingHours: number;
  tasksCompleted: number;
}

export const useWebsiteTracking = () => {
  const [websiteData, setWebsiteData] = useState<WebsiteUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<SimpleStats>({
    productiveHours: 0,
    distractingHours: 0,
    tasksCompleted: 0
  });
  
  // Load data from Chrome storage
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Check if in Chrome extension environment
        const isExtension = !!(window.chrome && window.chrome.runtime && window.chrome.runtime.id);
        
        if (isExtension && window.chrome?.storage?.local) {
          // We're in a Chrome extension, use chrome.storage
          window.chrome.storage.local.get(['simpletrack-data'], function(result) {
            if (result['simpletrack-data']) {
              // Get today's data
              const today = new Date().toISOString().split('T')[0];
              const todayData = result['simpletrack-data'][today];
              
              if (todayData) {
                // Extract website usage data
                const websiteUsage: WebsiteUsage[] = Object.entries(todayData.domains || {}).map(([domain, data]) => {
                  const domainData = data as any;
                  return {
                    domain,
                    timeSpent: domainData.timeSpent || 0,
                    category: domainData.category || 'neutral',
                    color: domainData.category === 'productive' ? '#4ade80' : 
                           domainData.category === 'distracting' ? '#f87171' : 
                           '#94a3b8'
                  };
                });
                
                // Sort by time spent (descending)
                websiteUsage.sort((a, b) => b.timeSpent - a.timeSpent);
                
                // Set the website data
                setWebsiteData(websiteUsage);
                
                // Set the simple stats
                setStats({
                  productiveHours: (todayData.productiveMinutes || 0) / 60,
                  distractingHours: (todayData.distractingMinutes || 0) / 60,
                  tasksCompleted: todayData.tasksCompleted || 0
                });
              }
            }
            setIsLoading(false);
          });
          
          // Listen for changes to the storage
          window.chrome.storage.onChanged?.addListener((changes, namespace) => {
            if (namespace === 'local' && changes['simpletrack-data']) {
              loadData();
            }
          });
        } else {
          // Use mock data for development outside the extension
          setWebsiteData([
            { domain: 'github.com', timeSpent: 45, category: 'productive', color: '#4ade80' },
            { domain: 'stackoverflow.com', timeSpent: 30, category: 'productive', color: '#4ade80' },
            { domain: 'youtube.com', timeSpent: 20, category: 'distracting', color: '#f87171' },
            { domain: 'google.com', timeSpent: 15, category: 'neutral', color: '#94a3b8' }
          ]);
          
          setStats({
            productiveHours: 1.25,
            distractingHours: 0.5,
            tasksCompleted: 3
          });
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading website data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  return {
    websiteData,
    stats,
    isLoading
  };
};

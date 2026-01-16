import { useState, useEffect } from 'react';

export interface TabInfo {
  title?: string;
  url?: string;
  favIconUrl?: string;
}

export function useCurrentTab() {
  const [tab, setTab] = useState<TabInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getCurrentTab = async () => {
      try {
        const [activeTab] = await browser.tabs.query({ 
          active: true, 
          currentWindow: true 
        });
        
        if (activeTab) {
          setTab({
            title: activeTab.title,
            url: activeTab.url,
            favIconUrl: activeTab.favIconUrl,
          });
        }
        setLoading(false);
      } catch (err) {
        console.error('Error getting tab info:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    };

    getCurrentTab();
  }, []);

  return { tab, loading, error };
}


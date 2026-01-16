import { useState, useEffect } from 'react';

export interface ExtensionSettings {
  instanceUrl: string;
  apiKey: string;
}

export function useExtensionSettings() {
  const [settings, setSettings] = useState<ExtensionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await browser.storage.sync.get(['instanceUrl', 'apiKey']);
        
        setSettings({
          instanceUrl: result.instanceUrl || '',
          apiKey: result.apiKey || '',
        } as ExtensionSettings);
        setLoading(false);
      } catch (err) {
        console.error('Error loading extension settings:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    };

    loadSettings();

    // Listen for changes to settings
    const handleStorageChange = (
      changes: Record<string, Browser.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName === 'sync') {
        setSettings((prev) => ({
          instanceUrl: changes.instanceUrl?.newValue ?? prev?.instanceUrl ?? '',
          apiKey: changes.apiKey?.newValue ?? prev?.apiKey ?? '',
        } as ExtensionSettings));
      }
    };

    browser.storage.onChanged.addListener(handleStorageChange);

    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const isConfigured = settings?.instanceUrl && settings?.apiKey;

  return { settings, loading, error, isConfigured };
}


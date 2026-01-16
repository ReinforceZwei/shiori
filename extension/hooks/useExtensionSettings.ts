import { useState, useEffect, useCallback } from 'react';

export interface ExtensionSettings {
  instanceUrl: string;
  apiKey: string;
}

const defaultSettings: ExtensionSettings = {
  instanceUrl: '',
  apiKey: '',
};

export interface UseExtensionSettingsReturn {
  settings: ExtensionSettings;
  updateSetting: <K extends keyof ExtensionSettings>(
    key: K,
    value: ExtensionSettings[K]
  ) => void;
  save: () => Promise<boolean>;
  clear: () => Promise<boolean>;
  loading: boolean;
  saving: boolean;
  saved: boolean;
  error: string | null;
  isConfigured: boolean;
}

/**
 * Hook for managing extension settings with full CRUD operations
 * 
 * @example
 * const { settings, updateSetting, save, clear, loading, saving, saved, error, isConfigured } = 
 *   useExtensionSettings();
 */
export function useExtensionSettings(): UseExtensionSettingsReturn {
  const [settings, setSettings] = useState<ExtensionSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
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
        const errorMsg = err instanceof Error ? err.message : 'Failed to load settings';
        setError(errorMsg);
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
          instanceUrl: (changes.instanceUrl?.newValue as string) ?? prev.instanceUrl,
          apiKey: (changes.apiKey?.newValue as string) ?? prev.apiKey,
        }));
      }
    };

    browser.storage.onChanged.addListener(handleStorageChange);

    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Update a single setting field
  const updateSetting = useCallback(<K extends keyof ExtensionSettings>(
    key: K,
    value: ExtensionSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Save settings
  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    
    try {
      const trimmedSettings: ExtensionSettings = {
        instanceUrl: settings.instanceUrl.trim(),
        apiKey: settings.apiKey.trim(),
      };

      await browser.storage.sync.set(trimmedSettings);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      return true;
    } catch (err) {
      console.error('Error saving settings:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to save settings';
      setError(errorMsg);
      return false;
    } finally {
      setSaving(false);
    }
  }, [settings]);

  // Clear settings
  const clear = useCallback(async () => {
    try {
      await browser.storage.sync.clear();
      setSettings(defaultSettings);
      setSaved(false);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error clearing settings:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to clear settings';
      setError(errorMsg);
      return false;
    }
  }, []);

  const isConfigured = !!(settings.instanceUrl && settings.apiKey);

  return {
    settings,
    updateSetting,
    save,
    clear,
    loading,
    saving,
    saved,
    error,
    isConfigured,
  };
}

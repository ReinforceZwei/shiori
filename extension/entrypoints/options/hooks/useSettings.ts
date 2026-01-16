import { useState, useEffect, useCallback } from 'react';

export interface ExtensionSettings {
  instanceUrl: string;
  apiKey: string;
}

const defaultSettings: ExtensionSettings = {
  instanceUrl: '',
  apiKey: '',
};

export function useSettings() {
  const [settings, setSettings] = useState<ExtensionSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await browser.storage.sync.get(['instanceUrl', 'apiKey']) as ExtensionSettings;
        setSettings({
          instanceUrl: result.instanceUrl || '',
          apiKey: result.apiKey || '',
        });
      } catch (err) {
        console.error('Error loading settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
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
      setError(err instanceof Error ? err.message : 'Failed to save settings');
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
      setError(err instanceof Error ? err.message : 'Failed to clear settings');
      return false;
    }
  }, []);

  return {
    // Settings object
    settings,
    
    // Setter
    updateSetting,
    
    // Actions
    save,
    clear,
    
    // States
    loading,
    saving,
    saved,
    error,
  };
}


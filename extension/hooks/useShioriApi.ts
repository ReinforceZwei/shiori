import { useExtensionSettings } from "./useExtensionSettings";
import { useCallback } from "react";

export interface TestConnectionResult {
  success: boolean;
  error?: string;
  data?: {
    id: string;
    [key: string]: unknown;
  };
}

export interface UseShioriApiReturn {
  testConnection: (instanceUrl?: string, apiKey?: string) => Promise<TestConnectionResult>;
}

export function useShioriApi(): UseShioriApiReturn {
  const { settings } = useExtensionSettings();

  const testConnection = useCallback(
    async (
      instanceUrl?: string,
      apiKey?: string
    ): Promise<TestConnectionResult> => {
      // Use provided params or fall back to settings
      const trimmedUrl = (instanceUrl ?? settings.instanceUrl).trim();
      const trimmedApiKey = (apiKey ?? settings.apiKey).trim();

      // Validate URL format
      try {
        const url = new URL(trimmedUrl);
        // Ensure URL has protocol
        if (!url.protocol.startsWith('http')) {
          return {
            success: false,
            error: 'URL must start with http:// or https://',
          };
        }
      } catch {
        return {
          success: false,
          error: 'Invalid URL format. Please enter a valid URL (e.g., https://example.com)',
        };
      }

      // Validate API key is not empty
      if (!trimmedApiKey) {
        return {
          success: false,
          error: 'API key is required',
        };
      }

      // Test connection to /api/me
      try {
        const testUrl = `${trimmedUrl}/api/me`;
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'X-API-KEY': trimmedApiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            return {
              success: false,
              error: 'Invalid API key. Please check your credentials.',
            };
          } else if (response.status === 404) {
            return {
              success: false,
              error: 'API endpoint not found. Please check your instance URL.',
            };
          } else {
            return {
              success: false,
              error: `Connection failed with status ${response.status}. Please check your instance URL and API key.`,
            };
          }
        }

        // Verify response is valid JSON
        const data = await response.json();
        if (!data || !data.id) {
          return {
            success: false,
            error: 'Invalid response from server. Please check your instance URL.',
          };
        }

        // Connection successful
        return {
          success: true,
          data,
        };
      } catch (err) {
        // Handle network errors or other issues
        console.error('Connection test failed:', err);
        if (err instanceof Error) {
          if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            return {
              success: false,
              error: 'Unable to connect to the server. Please check the URL and your internet connection.',
            };
          } else if (err.message.includes('JSON')) {
            return {
              success: false,
              error: 'Invalid response from server. Please check your instance URL.',
            };
          } else {
            return {
              success: false,
              error: err.message || 'Connection test failed. Please check your settings.',
            };
          }
        } else {
          return {
            success: false,
            error: 'An unexpected error occurred. Please try again.',
          };
        }
      }
    },
    [settings.instanceUrl, settings.apiKey]
  );

  return {
    testConnection,
  };
}
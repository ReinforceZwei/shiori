'use client';

import { createContext, useContext } from 'react';

/**
 * ✅ CLIENT-SAFE MODULE ✅
 * 
 * This module provides client-side configuration access.
 * It only exposes non-sensitive configuration values.
 * 
 * For server-side config with full access, use '@/lib/config' instead.
 * 
 * @module config/client
 */

/**
 * Client-safe configuration that can be shared with the browser
 */
export interface ClientConfig {
  auth: {
    disableSignup: boolean;
  };
}

const AppConfigContext = createContext<ClientConfig | null>(null);

/**
 * Hook to access client-safe application configuration
 * 
 * @example
 * const config = useAppConfig();
 * if (config.auth.disableSignup) {
 *   // Handle disabled signup
 * }
 */
export function useAppConfig(): ClientConfig {
  const config = useContext(AppConfigContext);
  if (!config) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }
  return config;
}

interface AppConfigProviderProps {
  config: ClientConfig;
  children: React.ReactNode;
}

/**
 * Provider component that makes client-safe config available to all child components
 * 
 * This should be used in the root layout (server component) to pass config to client components.
 */
export function AppConfigProvider({ config, children }: AppConfigProviderProps) {
  return (
    <AppConfigContext.Provider value={config}>
      {children}
    </AppConfigContext.Provider>
  );
}


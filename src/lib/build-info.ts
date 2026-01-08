export const BUILD_INFO = {
  version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
  buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || 'unknown',
} as const;


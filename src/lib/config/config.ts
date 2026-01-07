/**
 * ⚠️ SERVER-ONLY MODULE ⚠️
 * 
 * This file contains server-side configuration and MUST NOT be imported in client components.
 * For client-side config, use '@/lib/config/client' instead.
 * 
 * @module config (server-only)
 */
import 'server-only';

import { z } from 'zod';

/**
 * Application configuration schema
 */
const configSchema = z.object({
  // Database
  database: z.object({
    url: z.string().min(1, 'DATABASE_URL is required'),
  }),
  
  // Authentication (better-auth)
  auth: z.object({
    secret: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
    url: z.url('BETTER_AUTH_URL must be a valid URL'),
    disableSignup: z.coerce.boolean().default(false),
  }),
  
  // Job Worker Configuration
  worker: z.object({
    batchSize: z.coerce.number().int().positive().default(5),
    maxWorkers: z.coerce.number().int().positive().default(2),
  }),
});

// Infer TypeScript type from schema
export type Config = z.infer<typeof configSchema>;

/**
 * Load and validate configuration from environment variables
 */
function loadConfig(): Config {
  // Runtime check: Ensure we're running on the server
  if (typeof window !== 'undefined') {
    throw new Error(
      '❌ Server config cannot be imported in client components!\n' +
      '   Use "@/lib/config/client" instead for client-side configuration.\n' +
      '   Make sure your component has "use client" directive and uses useAppConfig() hook.'
    );
  }

  try {
    return configSchema.parse({
      database: {
        url: process.env.DATABASE_URL,
      },
      auth: {
        secret: process.env.BETTER_AUTH_SECRET,
        url: process.env.BETTER_AUTH_URL,
        disableSignup: process.env.DISABLE_SIGNUP,
      },
      worker: {
        batchSize: process.env.BATCH_SIZE,
        maxWorkers: process.env.MAX_WORKERS,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      });
    }
    throw new Error('Failed to load configuration. Please check your environment variables.');
  }
}

/**
 * Validated application configuration
 * 
 * This is loaded and validated once at startup.
 * Import this constant to access type-safe configuration values.
 */
export const config = loadConfig();

/**
 * Get client-safe configuration that can be safely shared with the browser
 * 
 * This filters out sensitive configuration (like database URLs, secrets) and only
 * includes values that are safe to expose to the client.
 */
export function getClientConfig() {
  return {
    auth: {
      disableSignup: config.auth.disableSignup,
    },
  };
}


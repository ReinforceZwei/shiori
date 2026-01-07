import { z } from 'zod';

/**
 * Application configuration schema
 * 
 * All environment variables are validated at startup.
 * Built-in Next.js/Node.js env vars (NEXT_RUNTIME, NODE_ENV) are not included here.
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
  try {
    return configSchema.parse({
      database: {
        url: process.env.DATABASE_URL,
      },
      auth: {
        secret: process.env.BETTER_AUTH_SECRET,
        url: process.env.BETTER_AUTH_URL,
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
 * 
 * @example
 * import { config } from '@/lib/config';
 * 
 * const batchSize = config.worker.batchSize;
 */
export const config = loadConfig();


import { JobService } from "./service";
import { Job } from "@/generated/prisma/client";

const BATCH_SIZE = process.env.BATCH_SIZE ? parseInt(process.env.BATCH_SIZE) : 5;
const MAX_WORKERS = process.env.MAX_WORKERS ? parseInt(process.env.MAX_WORKERS) : 2;

/**
 * Track number of active workers
 * Allows multiple workers to run in parallel up to MAX_WORKERS
 */
let activeWorkerCount = 0;
let shouldStop = false;

/**
 * Job handler type - processes a single job
 */
type JobHandler = (job: Job) => Promise<void>;

/**
 * Job handlers registry - map job type to handler function
 */
const jobHandlers = new Map<string, JobHandler>();

/**
 * Register a job handler for a specific job type
 * 
 * @example
 * registerJobHandler('send-email', async (job) => {
 *   await sendEmail(job.payload);
 * });
 */
export function registerJobHandler(type: string, handler: JobHandler) {
  jobHandlers.set(type, handler);
  console.log(`Registered ${type} job handler`);
}

/**
 * Process a single job
 */
async function processJob(job: Job, jobService: JobService): Promise<boolean> {
  const handler = jobHandlers.get(job.type);
  
  if (!handler) {
    console.error(`[Worker] No handler registered for job type: ${job.type}`);
    await jobService.nack({
      jobId: job.id,
      error: `No handler registered for job type: ${job.type}`,
    });
    return false;
  }

  try {
    await handler(job);
    await jobService.ack({ jobId: job.id, deleteOnComplete: true });
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Worker] Job ${job.id} failed:`, errorMessage);
    
    // Check if we've exhausted retries
    if (job.retryCount >= job.maxRetries) {
      await jobService.nack({ jobId: job.id, error: errorMessage });
    }
    // The visibility timeout will handle the retry automatically
    return false;
  }
}

/**
 * Worker loop - continuously processes jobs until queue is empty
 */
async function workerLoop(jobService: JobService, workerId: number) {
  console.log(`[Worker ${workerId}] Started`);
  
  while (!shouldStop) {
    try {
      // Dequeue jobs
      const jobs = await jobService.dequeue({
        batchSize: BATCH_SIZE,
        maxRetries: 3,
        fairScheduling: "random", // Prevents user starvation
      });

      if (jobs.length === 0) {
        console.log(`[Worker ${workerId}] Queue empty, exiting`);
        break;
      }

      // Process jobs in parallel (up to BATCH_SIZE)
      await Promise.all(
        jobs.map(job => processJob(job, jobService))
      );

      // Small delay to prevent tight loop
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`[Worker ${workerId}] Error in worker loop:`, error);
      // Wait before retrying to avoid tight error loop
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

/**
 * Start the job workers
 * 
 * Fire-and-forget: Starts up to MAX_WORKERS workers, each exits when queue is empty.
 * Multiple workers process jobs in parallel for better throughput.
 * 
 * @example
 * registerJobHandler('send-email', async (job) => { await sendEmail(job.payload); });
 * startWorker();
 */
export async function startWorker(): Promise<void> {
  // Register handlers once (idempotent)
  registerDefaultHandlers();

  // Start workers up to MAX_WORKERS
  const workersToStart = Math.max(0, MAX_WORKERS - activeWorkerCount);
  if (workersToStart === 0) {
    return;
  }

  shouldStop = false;

  // Start multiple workers
  for (let i = 0; i < workersToStart; i++) {
    const workerId = activeWorkerCount + 1;
    activeWorkerCount++;

    // Fire and forget - don't await
    (async () => {
      try {
        const jobService = new JobService();
        await workerLoop(jobService, workerId);
      } catch (error) {
        console.error(`[Worker ${workerId}] Fatal error:`, error);
      } finally {
        activeWorkerCount--;
      }
    })();
  }
}

/**
 * Stop the worker gracefully (finishes current batch)
 */
export function stopWorker(): void {
  shouldStop = true;
}

/**
 * Check if any workers are currently running
 */
export function isRunning(): boolean {
  return activeWorkerCount > 0;
}

/**
 * Get the number of active workers
 */
export function getActiveWorkerCount(): number {
  return activeWorkerCount;
}

/**
 * Register default handlers
 */
export function registerDefaultHandlers() {
  // Register bookmark metadata fetch handler
  registerJobHandler('fetch-bookmark-metadata', async (job) => {
    const { handleFetchBookmarkMetadata } = await import('@/features/bookmark/metadata-handler');
    await handleFetchBookmarkMetadata(job);
  });

  // Add more handlers as needed
}
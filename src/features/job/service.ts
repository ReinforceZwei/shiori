import { ServiceBase } from "@/lib/service-base.class";
import { Job } from "@/generated/prisma/client";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";

const enqueueSchema = z.object({
  userId: z.string(),
  type: z.string().min(1).max(255),
  payload: z.any().optional(),
  maxRetries: z.number().int().min(0).optional().default(3),
});

const enqueueBatchSchema = z.object({
  jobs: z.array(z.object({
    userId: z.string(),
    type: z.string().min(1).max(255),
    payload: z.any().optional(),
    maxRetries: z.number().int().min(0).optional().default(3),
  })).min(1),
});

const dequeueSchema = z.object({
  maxRetries: z.number().int().min(0).optional().default(3),
  batchSize: z.number().int().min(1).optional().default(10),
  userId: z.string().optional(),
  type: z.string().optional(),
  fairScheduling: z.enum(["fifo", "random"]).optional().default("fifo"),
});

const ackSchema = z.object({
  jobId: z.uuid(),
  deleteOnComplete: z.boolean().optional().default(false),
});

const ackBatchSchema = z.object({
  jobIds: z.array(z.uuid()).min(1),
  deleteOnComplete: z.boolean().optional().default(false),
});

const nackSchema = z.object({
  jobId: z.uuid(),
  error: z.string().optional(),
});

const cleanupSchema = z.object({
  olderThanDays: z.number().int().min(1).optional().default(7),
  statuses: z.array(z.enum(["done", "failed"])).optional().default(["done", "failed"]),
  limit: z.number().int().min(1).optional().default(1000),
});

/**
 * Job queue service with support for concurrent workers
 * 
 * Features:
 * - At-least-once delivery with retries
 * - Visibility timeout for crash recovery
 * - Lock-free concurrency (FOR UPDATE SKIP LOCKED)
 * - Per-user job isolation
 */
export class JobService extends ServiceBase {
  /**
   * Enqueue a new job
   * 
   * @example
   * ```ts
   * const job = await jobService.enqueue({
   *   userId: 'user-123',
   *   type: 'send-email',
   *   payload: { to: 'user@example.com', subject: 'Hello' }
   * });
   * 
   * // Different job types
   * await jobService.enqueue({
   *   userId: 'user-456',
   *   type: 'process-image',
   *   payload: { imageUrl: 'https://example.com/image.jpg' }
   * });
   * ```
   */
  async enqueue(data: z.infer<typeof enqueueSchema>) {
    const validatedData = enqueueSchema.parse(data);
    
    const job = await this.prisma.job.create({
      data: {
        userId: validatedData.userId,
        type: validatedData.type,
        payload: validatedData.payload ?? null,
        maxRetries: validatedData.maxRetries,
      },
    });
    
    return job;
  }

  /**
   * Enqueue multiple jobs in a single batch operation
   * 
   * @example
   * ```ts
   * const jobs = await jobService.enqueueBatch({
   *   jobs: [
   *     {
   *       userId: 'user-123',
   *       type: 'send-email',
   *       payload: { to: 'user@example.com', subject: 'Hello' }
   *     },
   *     {
   *       userId: 'user-123',
   *       type: 'process-image',
   *       payload: { imageUrl: 'https://example.com/image.jpg' }
   *     }
   *   ]
   * });
   * ```
   */
  async enqueueBatch(data: z.infer<typeof enqueueBatchSchema>) {
    const validatedData = enqueueBatchSchema.parse(data);
    
    await this.prisma.job.createMany({
      data: validatedData.jobs.map((jobData) => ({
        userId: jobData.userId,
        type: jobData.type,
        payload: jobData.payload ?? null,
        maxRetries: jobData.maxRetries,
      })),
    });
  }

  /**
   * Dequeue jobs for processing with concurrent worker support
   * 
   * Uses FOR UPDATE SKIP LOCKED for lock-free concurrency.
   * Jobs are marked as in_progress with a 60-second visibility timeout.
   * 
   * @example
   * ```ts
   * // Simple FIFO (default)
   * const jobs = await jobService.dequeue({
   *   maxRetries: 3,
   *   batchSize: 10
   * });
   * 
   * // Dequeue specific job type
   * const emailJobs = await jobService.dequeue({
   *   batchSize: 10,
   *   type: 'send-email'
   * });
   * 
   * // Random selection (prevents user starvation)
   * const jobs = await jobService.dequeue({
   *   batchSize: 10,
   *   fairScheduling: 'random'
   * });
   * 
   * // Process specific user's specific job type
   * const jobs = await jobService.dequeue({
   *   userId: 'user-123',
   *   type: 'process-image',
   *   batchSize: 5
   * });
   * ```
   */
  async dequeue(data: z.infer<typeof dequeueSchema>) {
    const validatedData = dequeueSchema.parse(data);
    
    const userCondition = validatedData.userId 
      ? Prisma.sql`AND "userId" = ${validatedData.userId}`
      : Prisma.empty;
    
    const typeCondition = validatedData.type
      ? Prisma.sql`AND type = ${validatedData.type}`
      : Prisma.empty;
    
    // Choose ordering strategy based on fairScheduling parameter
    let orderBy: Prisma.Sql;
    switch (validatedData.fairScheduling) {
      case "random":
        // Random selection prevents user starvation
        orderBy = Prisma.sql`ORDER BY RANDOM()`;
        break;
      case "fifo":
      default:
        // First-in-first-out (default)
        orderBy = Prisma.sql`ORDER BY "createdAt"`;
        break;
    }
    
    const jobs = await this.prisma.$queryRaw<Job[]>`
      WITH next_job AS (
        SELECT id
        FROM job
        WHERE
          "retryCount" <= "maxRetries"
          AND (
            status = 'pending'
            OR (status = 'in_progress' AND "visibleAt" <= now())
          )
          ${userCondition}
          ${typeCondition}
        ${orderBy}
        LIMIT ${validatedData.batchSize}
        FOR UPDATE SKIP LOCKED
      )
      UPDATE job
      SET status = 'in_progress',
          "updatedAt" = now(),
          "visibleAt" = now() + interval '60 seconds',
          "retryCount" = "retryCount" + 1
      FROM next_job
      WHERE job.id = next_job.id
      RETURNING job.*;
    `;
    
    return jobs;
  }

  /**
   * Acknowledge a job as successfully completed
   * 
   * @example
   * ```ts
   * // Mark as done (keeps the job record)
   * await jobService.ack({ jobId: 'job-uuid' });
   * 
   * // Delete immediately (no history kept)
   * await jobService.ack({ 
   *   jobId: 'job-uuid',
   *   deleteOnComplete: true 
   * });
   * ```
   */
  async ack(data: z.infer<typeof ackSchema>) {
    const validatedData = ackSchema.parse(data);
    
    if (validatedData.deleteOnComplete) {
      // Delete the job immediately
      await this.prisma.job.delete({
        where: { id: validatedData.jobId },
      });
    } else {
      // Mark as done
      await this.prisma.job.update({
        where: { id: validatedData.jobId },
        data: { status: 'done' },
      });
    }
  }

  /**
   * Acknowledge multiple jobs in batch
   * 
   * @example
   * ```ts
   * // Mark as done (keeps the job records)
   * await jobService.ackBatch({ 
   *   jobIds: ['job-1', 'job-2', 'job-3'] 
   * });
   * 
   * // Delete immediately (no history kept)
   * await jobService.ackBatch({ 
   *   jobIds: ['job-1', 'job-2', 'job-3'],
   *   deleteOnComplete: true
   * });
   * ```
   */
  async ackBatch(data: z.infer<typeof ackBatchSchema>) {
    const validatedData = ackBatchSchema.parse(data);
    
    if (validatedData.deleteOnComplete) {
      // Delete the jobs immediately
      await this.prisma.job.deleteMany({
        where: { id: { in: validatedData.jobIds } },
      });
    } else {
      // Mark as done
      await this.prisma.job.updateMany({
        where: { id: { in: validatedData.jobIds } },
        data: { status: 'done' },
      });
    }
  }

  /**
   * Mark a job as failed (negative acknowledgment)
   * 
   * @example
   * ```ts
   * await jobService.nack({ 
   *   jobId: 'job-uuid',
   *   error: 'Connection timeout' 
   * });
   * ```
   */
  async nack(data: z.infer<typeof nackSchema>) {
    const validatedData = nackSchema.parse(data);
    
    await this.prisma.job.update({
      where: { id: validatedData.jobId },
      data: {
        status: 'failed',
        error: validatedData.error ?? null,
      },
    });
  }

  /**
   * Clean up old completed/failed jobs (lazy cleanup)
   * 
   * Should be called periodically or during dequeue operations.
   * 
   * @example
   * ```ts
   * // Delete jobs completed more than 7 days ago
   * const deleted = await jobService.cleanup({
   *   olderThanDays: 7,
   *   statuses: ['done', 'failed'],
   *   limit: 1000
   * });
   * ```
   */
  async cleanup(data?: z.infer<typeof cleanupSchema>) {
    const validatedData = cleanupSchema.parse(data ?? {});
    
    const statusCondition = Prisma.sql`status = ANY(${validatedData.statuses}::text[])`;
    
    const result = await this.prisma.$executeRaw`
      DELETE FROM job
      WHERE ${statusCondition}
        AND "updatedAt" < now() - interval '${Prisma.raw(validatedData.olderThanDays.toString())} days'
      LIMIT ${validatedData.limit};
    `;
    
    return result;
  }

  /**
   * Get job statistics for a user
   * 
   * @example
   * ```ts
   * // Overall stats
   * const stats = await jobService.getStats({ userId: 'user-123' });
   * // { pending: 5, in_progress: 2, done: 100, failed: 3 }
   * 
   * // Stats by job type
   * const typeStats = await jobService.getStats({ 
   *   userId: 'user-123',
   *   groupByType: true 
   * });
   * // {
   * //   'send-email': { pending: 2, in_progress: 1, done: 50, failed: 1 },
   * //   'process-image': { pending: 3, in_progress: 1, done: 50, failed: 2 }
   * // }
   * ```
   */
  async getStats(data: { userId: string; groupByType?: boolean }) {
    if (data.groupByType) {
      const stats = await this.prisma.job.groupBy({
        by: ['type', 'status'],
        where: { userId: data.userId },
        _count: true,
      });
      
      const result: Record<string, Record<string, number>> = {};
      for (const { type, status, _count } of stats) {
        if (!result[type]) {
          result[type] = { pending: 0, in_progress: 0, done: 0, failed: 0 };
        }
        result[type][status] = _count;
      }
      return result;
    }
    
    const stats = await this.prisma.job.groupBy({
      by: ['status'],
      where: { userId: data.userId },
      _count: true,
    });
    
    return stats.reduce((acc, { status, _count }) => {
      acc[status as keyof typeof acc] = _count;
      return acc;
    }, {
      pending: 0,
      in_progress: 0,
      done: 0,
      failed: 0,
    });
  }
}


import { z } from 'zod';
import type { PrismaClient } from '@/generated/prisma';

export type LayoutType = 'launcher' | 'grid' | 'list';

export interface ValidationResult<T = unknown> {
  valid: boolean;
  errors: string[];
  normalized?: T;
}

export interface ValidationContext {
  userId: string;
  collectionId?: string;
}

export interface ValidationOptions {
  strict?: boolean; // If true, require all items to be present
}

// Type for Prisma client (supports both main client and transaction client)
export type PrismaClientLike = PrismaClient | Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>


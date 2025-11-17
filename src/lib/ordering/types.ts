import type { PrismaClient } from '@/generated/prisma';

// Matches Prisma OrderType enum
export type OrderType = 'collection' | 'bookmark';

export interface ValidationResult<T = unknown> {
  valid: boolean;
  errors: string[];
  normalized?: T;
}

export interface ValidationContext {
  userId: string;
  collectionId?: string; // Required when type='bookmark' and ordering bookmarks within a collection
}

export interface ValidationOptions {
  strict?: boolean; // If true, require all items to be present
}

// Type for Prisma client (supports both main client and transaction client)
export type PrismaClientLike = PrismaClient | Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>


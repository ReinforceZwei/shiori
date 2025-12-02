import { Prisma } from "@/lib/prisma";
import { z } from "zod";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { validateOrder } from "@/lib/ordering";
import type { OrderType } from "@/lib/ordering";
import { ServiceBase } from "@/lib/service-base.class";

const getOrderInputSchema = z.object({
  userId: z.string(),
  type: z.enum(['collection', 'bookmark']),
  collectionId: z.string().optional().nullable(),
});

const upsertOrderInputSchema = z.object({
  userId: z.string(),
  type: z.enum(['collection', 'bookmark']),
  collectionId: z.string().optional().nullable(),
  order: z.array(z.string()),
});

const deleteOrderInputSchema = z.object({
  userId: z.string(),
  type: z.enum(['collection', 'bookmark']),
  collectionId: z.string().optional().nullable(),
});

/**
 * Service class for managing order records
 * Extends ServiceBase to provide transaction support
 */
export class OrderService extends ServiceBase {
  /**
   * Get an order record
   * @param data - userId, type, and optional collectionId
   */
  async get(data: z.infer<typeof getOrderInputSchema>) {
    const validatedData = getOrderInputSchema.parse(data);
    
    // Note: Using findFirst instead of findUnique due to Prisma limitation with null in unique constraints
    // See: https://github.com/prisma/prisma/issues/3387
    const order = await this.prisma.order.findFirst({
      where: {
        userId: validatedData.userId,
        type: validatedData.type,
        collectionId: validatedData.collectionId ?? null,
      },
    });
    
    return order;
  }

  /**
   * Upsert (create or update) an order record
   * Validates the order data before saving
   * @param data - userId, type, collectionId, and order array
   */
  async upsert(data: z.infer<typeof upsertOrderInputSchema>) {
    const validatedData = upsertOrderInputSchema.parse(data);
    
    return await this.withTransaction(async (tx) => {
      // Validate the order
      const validationResult = await validateOrder(
        tx,
        validatedData.type as OrderType,
        validatedData.order,
        {
          userId: validatedData.userId,
          collectionId: validatedData.collectionId ?? undefined,
        },
        { strict: false }
      );

      if (!validationResult.valid) {
        throw new ValidationError(
          `Invalid order: ${validationResult.errors.join(', ')}`
        );
      }

      // Manual upsert to handle null collectionId properly
      // Prisma's upsert doesn't work well with null in unique constraints
      const existing = await tx.order.findFirst({
        where: {
          userId: validatedData.userId,
          type: validatedData.type,
          collectionId: validatedData.collectionId ?? null,
        },
      });

      if (existing) {
        // Update existing order
        return await tx.order.update({
          where: { id: existing.id },
          data: {
            order: validationResult.normalized as Prisma.InputJsonValue,
          },
        });
      } else {
        // Create new order
        return await tx.order.create({
          data: {
            userId: validatedData.userId,
            type: validatedData.type,
            collectionId: validatedData.collectionId ?? null,
            order: validationResult.normalized as Prisma.InputJsonValue,
          },
        });
      }
    });
  }

  /**
   * Helper to get or create an empty order
   * Used internally when we need to ensure an order exists
   */
  async getOrCreate(
    data: z.infer<typeof getOrderInputSchema>
  ): Promise<{ id: string; order: string[] }> {
    const validatedData = getOrderInputSchema.parse(data);
    
    const existing = await this.get(validatedData);
    if (existing) {
      return {
        id: existing.id,
        order: (existing.order as string[]) || [],
      };
    }

    // Create empty order
    const newOrder = await this.prisma.order.create({
      data: {
        userId: validatedData.userId,
        type: validatedData.type,
        collectionId: validatedData.collectionId ?? null,
        order: [],
      },
    });

    return {
      id: newOrder.id,
      order: [],
    };
  }

  /**
   * Delete an order record
   * Note: Usually not needed as orders are deleted via cascade when parent is deleted
   */
  async delete(data: z.infer<typeof deleteOrderInputSchema>) {
    const validatedData = deleteOrderInputSchema.parse(data);
    
    const order = await this.get(validatedData);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    await this.prisma.order.delete({
      where: { id: order.id },
    });
  }
}


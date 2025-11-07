import { prisma, Prisma } from "@/lib/prisma";
import { z } from "zod";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { validateOrder } from "@/lib/ordering";
import type { OrderType } from "@/lib/ordering";

const getOrderInputSchema = z.object({
  userId: z.string(),
  type: z.enum(['collection', 'bookmark']),
  collectionId: z.string().optional().nullable(),
});

/**
 * Get an order record
 * @param data - userId, type, and optional collectionId
 */
export async function getOrder(data: z.infer<typeof getOrderInputSchema>) {
  const validatedData = getOrderInputSchema.parse(data);
  
  // Note: Using findFirst instead of findUnique due to Prisma limitation with null in unique constraints
  // See: https://github.com/prisma/prisma/issues/3387
  const order = await prisma.order.findFirst({
    where: {
      userId: validatedData.userId,
      type: validatedData.type,
      collectionId: validatedData.collectionId ?? null,
    },
  });
  
  return order;
}

const upsertOrderInputSchema = z.object({
  userId: z.string(),
  type: z.enum(['collection', 'bookmark']),
  collectionId: z.string().optional().nullable(),
  order: z.array(z.string()),
});

/**
 * Upsert (create or update) an order record
 * Validates the order data before saving
 * @param data - userId, type, collectionId, and order array
 */
export async function upsertOrder(data: z.infer<typeof upsertOrderInputSchema>) {
  const validatedData = upsertOrderInputSchema.parse(data);
  
  return await prisma.$transaction(async (tx) => {
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
export async function getOrCreateOrder(
  data: z.infer<typeof getOrderInputSchema>
): Promise<{ id: string; order: string[] }> {
  const validatedData = getOrderInputSchema.parse(data);
  
  const existing = await getOrder(validatedData);
  if (existing) {
    return {
      id: existing.id,
      order: (existing.order as string[]) || [],
    };
  }

  // Create empty order
  const newOrder = await prisma.order.create({
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

const deleteOrderInputSchema = z.object({
  userId: z.string(),
  type: z.enum(['collection', 'bookmark']),
  collectionId: z.string().optional().nullable(),
});

/**
 * Delete an order record
 * Note: Usually not needed as orders are deleted via cascade when parent is deleted
 */
export async function deleteOrder(data: z.infer<typeof deleteOrderInputSchema>) {
  const validatedData = deleteOrderInputSchema.parse(data);
  
  const order = await getOrder(validatedData);
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  await prisma.order.delete({
    where: { id: order.id },
  });
}


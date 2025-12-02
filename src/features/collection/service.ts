import { Prisma } from "@/lib/prisma";
import { z } from "zod";
import { NotFoundError } from "@/lib/errors";
import { ServiceBase } from "@/lib/service-base.class";

const createCollectionInputSchema = z.object({
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
});

const updateCollectionInputSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  name: z.string().optional(),
  description: z.string().nullable().optional(), // Allow null to clear
  color: z.string().nullable().optional(), // Allow null to clear
});

const deleteCollectionInputSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
});

/**
 * Service class for managing collections
 * Extends ServiceBase to provide transaction support
 */
export class CollectionService extends ServiceBase {
  /**
   * Get all collections
   * @param params - Optional userId filter
   */
  async getAll({ userId }: { userId?: string } = {}) {
    const collections = await this.prisma.collection.findMany({
      where: userId ? { userId } : undefined,
    });
    return collections;
  }

  /**
   * Get all collections with their bookmarks
   * @param params - Optional userId filter
   */
  async getAllWithBookmarks({ userId }: { userId?: string } = {}) {
    const collections = await this.prisma.collection.findMany({
      where: userId ? { userId } : undefined,
      include: {
        bookmark: { include: { websiteIcon: { select: { id: true }}}},
      },
    });
    return collections;
  }

  /**
   * Get a single collection by ID
   * @param params - id and optional userId
   */
  async get({ id, userId }: { id: string; userId?: string }) {
    const collection = await this.prisma.collection.findUnique({
      where: userId ? { id, userId } : { id },
    });
    return collection;
  }

  /**
   * Create a new collection
   * @param data - Collection creation data
   */
  async create(data: z.infer<typeof createCollectionInputSchema>) {
    const validatedData = createCollectionInputSchema.parse(data);
    
    // Create collection with its associated order record in a transaction
    const collection = await this.withTransaction(async (tx) => {
      // 1. Create the order record first (for bookmarks within this collection)
      const order = await tx.order.create({
        data: {
          userId: validatedData.userId,
          type: 'bookmark',
          order: [], // Empty initially
        },
      });

      // 2. Create collection linked to order
      const newCollection = await tx.collection.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          color: validatedData.color,
          user: {
            connect: { id: validatedData.userId },
          },
          order: {
            connect: { id: order.id },
          },
        },
      });

      // 3. Update order with collectionId
      await tx.order.update({
        where: { id: order.id },
        data: { collectionId: newCollection.id },
      });

      // 4. Ensure the collection appears in the user's collection order
      const collectionOrder = await tx.order.findFirst({
        where: {
          userId: validatedData.userId,
          type: 'collection',
          collectionId: null,
        },
      });

      if (collectionOrder) {
        const currentOrder = (collectionOrder.order as string[]) || [];
        await tx.order.update({
          where: { id: collectionOrder.id },
          data: { order: [...currentOrder, newCollection.id] },
        });
      } else {
        await tx.order.create({
          data: {
            userId: validatedData.userId,
            type: 'collection',
            collectionId: null,
            order: [newCollection.id],
          },
        });
      }

      return newCollection;
    });

    return collection;
  }

  /**
   * Update an existing collection
   * @param data - Collection update data
   */
  async update(data: z.infer<typeof updateCollectionInputSchema>) {
    const validatedData = updateCollectionInputSchema.parse(data);
    
    // Check if collection exists and belongs to user (if userId provided)
    const collection = await this.prisma.collection.findUnique({
      where: validatedData.userId 
        ? { id: validatedData.id, userId: validatedData.userId }
        : { id: validatedData.id },
    });
    if (!collection) {
      throw new NotFoundError(`Collection(id: ${validatedData.id}) not found`);
    }

    // Build update data object with only fields to update
    const updateData: Prisma.CollectionUpdateInput = {};

    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
    }
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }
    if (validatedData.color !== undefined) {
      updateData.color = validatedData.color;
    }

    // Update collection if there are changes
    if (Object.keys(updateData).length > 0) {
      return await this.prisma.collection.update({
        where: { id: validatedData.id },
        data: updateData,
      });
    }
    
    // No changes
    return collection;
  }

  /**
   * Delete a collection
   * @param data - Delete operation data
   */
  async delete(data: z.infer<typeof deleteCollectionInputSchema>) {
    const validatedData = deleteCollectionInputSchema.parse(data);
    
    // Check if collection exists and belongs to user (if userId provided)
    const collection = await this.prisma.collection.findUnique({
      where: validatedData.userId 
        ? { id: validatedData.id, userId: validatedData.userId }
        : { id: validatedData.id },
      include: {
        bookmark: { select: { id: true } }, // Get bookmark IDs that will become uncollected
      },
    });
    if (!collection) {
      throw new NotFoundError(`Collection(id: ${validatedData.id}) not found`);
    }

    await this.withTransaction(async (tx) => {
      // Get the bookmark IDs that will become uncollected
      const bookmarkIds = collection.bookmark.map(b => b.id);

      // If there are bookmarks, add them to the uncollected bookmarks order
      if (bookmarkIds.length > 0) {
        const uncollectedOrder = await tx.order.findFirst({
          where: {
            userId: collection.userId,
            type: 'bookmark',
            collectionId: null,
          },
        });

        if (uncollectedOrder) {
          const currentOrder = (uncollectedOrder.order as string[]) || [];
          // Add the newly uncollected bookmarks to the end of the uncollected order
          await tx.order.update({
            where: { id: uncollectedOrder.id },
            data: { order: [...currentOrder, ...bookmarkIds] },
          });
        } else {
          // Create the uncollected order record if it doesn't exist
          await tx.order.create({
            data: {
              userId: collection.userId,
              type: 'bookmark',
              collectionId: null,
              order: bookmarkIds,
            },
          });
        }
      }

      // Remove collection from the collection ordering record
      const collectionOrder = await tx.order.findFirst({
        where: {
          userId: collection.userId,
          type: 'collection',
          collectionId: null,
        },
      });

      if (collectionOrder) {
        const currentOrder = (collectionOrder.order as string[]) || [];
        const updatedOrder = currentOrder.filter(id => id !== collection.id);

        await tx.order.update({
          where: { id: collectionOrder.id },
          data: { order: updatedOrder },
        });
      }

      // Delete the collection (bookmarks will have collectionId set to null)
      await tx.collection.delete({
        where: { id: validatedData.id },
      });
    });
  }
}


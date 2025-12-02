import { Prisma } from "@/lib/prisma";
import { z } from "zod";
import { validateAndDetectImageType } from "@/lib/utils/image";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { ServiceBase } from "@/lib/service-base.class";

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
] as const;

const createBookmarkInputSchema = z.object({
  userId: z.string(),
  title: z.string(),
  url: z.httpUrl(),
  description: z.string().optional(),
  collectionId: z.string().optional(),
  websiteIcon: z.object({
    data: z.base64(), // base64 encoded string
  }).optional(),
});

const updateBookmarkInputSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  title: z.string().optional(),
  url: z.httpUrl().optional(),
  description: z.string().optional(),
  collectionId: z.string().nullable().optional(), // Allow null to remove from collection
  websiteIcon: z.object({
    data: z.base64(), // base64 encoded string
  }).optional(),
});

const moveBookmarkInputSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  targetCollectionId: z.string().nullable(), // null for uncollected
  targetOrder: z.array(z.string()), // Complete order array for the target collection
});

const deleteBookmarkInputSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
});

/**
 * Service class for managing bookmarks
 * Extends ServiceBase to provide transaction support
 */
export class BookmarkService extends ServiceBase {
  /**
   * Get all bookmarks
   * @param params - Optional userId filter
   */
  async getAll({ userId }: { userId?: string } = {}) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: userId ? { userId } : undefined,
      include: { websiteIcon: { select: { id: true }}},
    });
    return bookmarks;
  }

  /**
   * Get all uncollected bookmarks (top-level)
   * @param params - Optional userId filter
   */
  async getAllUncollected({ userId }: { userId?: string } = {}) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: {
        ...(userId ? { userId } : {}),
        collectionId: null,
      },
      include: { websiteIcon: { select: { id: true }}},
    });
    return bookmarks;
  }

  /**
   * Get a single bookmark by ID
   * @param params - id and optional userId
   */
  async get({ id, userId }: { id: string; userId?: string }) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: userId ? { id, userId } : { id },
      include: { websiteIcon: { select: { id: true }}},
    });
    return bookmark;
  }

  /**
   * Get a bookmark with full website icon data
   * @param params - id and optional userId
   */
  async getWithIcon({ id, userId }: { id: string; userId?: string }) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: userId ? { id, userId } : { id },
      include: {
        websiteIcon: true,
      },
    });
    return bookmark;
  }

  /**
   * Create a new bookmark
   * @param data - Bookmark creation data
   */
  async create(data: z.infer<typeof createBookmarkInputSchema>) {
    const validatedData = createBookmarkInputSchema.parse(data);
    if (validatedData.collectionId) {
      const collection = await this.prisma.collection.findUnique({
        where: { id: validatedData.collectionId, userId: validatedData.userId },
      });
      if (!collection) {
        throw new NotFoundError(`Collection(id: ${validatedData.collectionId}) not found`);
      }
    }
    
    // Validate image and detect actual MIME type from binary data
    let websiteIconData: Prisma.WebsiteIconCreateNestedOneWithoutBookmarkInput | undefined;
    if (validatedData.websiteIcon) {
      const detectedMimeType = await validateAndDetectImageType(
        validatedData.websiteIcon.data,
        ALLOWED_IMAGE_TYPES
      );
      websiteIconData = {
        create: {
          data: Buffer.from(validatedData.websiteIcon.data, 'base64'),
          mimeType: detectedMimeType, // Use detected MIME type, not user input
        },
      };
    }
    const collectionData = validatedData.collectionId ? {
      connect: { id: validatedData.collectionId },
    } : undefined;
    const userData = {
      connect: { id: validatedData.userId },
    };

    // Wrap in transaction to ensure atomicity
    const bookmark = await this.withTransaction(async (tx) => {
      const newBookmark = await tx.bookmark.create({
        data: {
          title: validatedData.title,
          url: validatedData.url,
          description: validatedData.description,
          websiteIcon: websiteIconData,
          collection: collectionData,
          user: userData,
        },
      });

      // Update Order table if bookmark was added to a collection
      if (validatedData.collectionId) {
        const collection = await tx.collection.findUnique({
          where: { id: validatedData.collectionId },
          include: { order: true },
        });
        
        if (collection?.order) {
          const currentOrder = (collection.order.order as string[]) || [];
          const updatedOrder = [...currentOrder, newBookmark.id];
          
          await tx.order.update({
            where: { id: collection.order.id },
            data: { order: updatedOrder },
          });
        } else {
          // Order always exist because it will be created
          // together with collection
        }
      } else {
        // Bookmark is top-level, add to top-level bookmark order
        // Note: Using findFirst instead of findUnique due to Prisma limitation with null in unique constraints
        const existingOrder = await tx.order.findFirst({
          where: {
            userId: validatedData.userId,
            type: 'bookmark',
            collectionId: null,
          },
        });

        if (existingOrder) {
          const currentOrder = (existingOrder.order as string[]) || [];
          await tx.order.update({
            where: { id: existingOrder.id },
            data: { order: [...currentOrder, newBookmark.id] },
          });
        } else {
          // Create order if it doesn't exist
          await tx.order.create({
            data: {
              userId: validatedData.userId,
              type: 'bookmark',
              collectionId: null,
              order: [newBookmark.id],
            },
          });
        }
      }

      return newBookmark;
    });

    return bookmark;
  }

  /**
   * Update an existing bookmark
   * @param data - Bookmark update data
   */
  async update(data: z.infer<typeof updateBookmarkInputSchema>) {
    const validatedData = updateBookmarkInputSchema.parse(data);
    
    // Check if bookmark exists and belongs to user (if userId provided)
    const bookmark = await this.prisma.bookmark.findUnique({
      where: validatedData.userId 
        ? { id: validatedData.id, userId: validatedData.userId }
        : { id: validatedData.id },
    });
    if (!bookmark) {
      throw new NotFoundError(`Bookmark(id: ${validatedData.id}) not found`);
    }

    // Track old collection ID for bookmarkOrder updates
    const oldCollectionId = bookmark.collectionId;

    // Build update data object with only fields to update
    const updateData: Prisma.BookmarkUpdateInput = {};

    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title;
    }
    if (validatedData.url !== undefined) {
      updateData.url = validatedData.url;
    }
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }
    
    // Handle collection relationship properly
    if (validatedData.collectionId !== undefined) {
      if (validatedData.collectionId === null) {
        // Remove from collection (disconnect)
        updateData.collection = { disconnect: true };
      } else {
        // Validate collection exists and belongs to user
        const collection = await this.prisma.collection.findUnique({
          where: { id: validatedData.collectionId, userId: bookmark.userId },
        });
        if (!collection) {
          throw new NotFoundError(`Collection(id: ${validatedData.collectionId}) not found`);
        }
        // Change to different collection (connect)
        updateData.collection = { connect: { id: validatedData.collectionId } };
      }
    }

    // Handle website icon if provided
    if (validatedData.websiteIcon) {
      const detectedMimeType = await validateAndDetectImageType(
        validatedData.websiteIcon.data,
        ALLOWED_IMAGE_TYPES
      );
      updateData.websiteIcon = {
        upsert: {
          create: {
            data: Buffer.from(validatedData.websiteIcon.data, 'base64'),
            mimeType: detectedMimeType,
          },
          update: {
            data: Buffer.from(validatedData.websiteIcon.data, 'base64'),
            mimeType: detectedMimeType,
          },
        },
      };
    }

    // Wrap in transaction to ensure atomicity
    const updatedBookmark = await this.withTransaction(async (tx) => {
      const updated = await tx.bookmark.update({
        where: { id: validatedData.id },
        data: updateData,
      });

      // Update Order table if collection changed
      if (validatedData.collectionId !== undefined) {
        const newCollectionId = validatedData.collectionId;
        
        // Remove bookmark from old collection's order
        if (oldCollectionId) {
          const oldCollection = await tx.collection.findUnique({
            where: { id: oldCollectionId },
            include: { order: true },
          });
          
          if (oldCollection?.order) {
            const oldOrder = (oldCollection.order.order as string[]) || [];
            const updatedOldOrder = oldOrder.filter(id => id !== validatedData.id);
            
            await tx.order.update({
              where: { id: oldCollection.order.id },
              data: { order: updatedOldOrder },
            });
          }
        } else {
          // Remove from top-level bookmark order
          const topLevelOrder = await tx.order.findFirst({
            where: {
              userId: bookmark.userId,
              type: 'bookmark',
              collectionId: null,
            },
          });

          if (topLevelOrder) {
            const currentOrder = (topLevelOrder.order as string[]) || [];
            const updatedOrder = currentOrder.filter(id => id !== validatedData.id);
            
            await tx.order.update({
              where: { id: topLevelOrder.id },
              data: { order: updatedOrder },
            });
          }
        }
        
        // Add bookmark to new collection's order
        if (newCollectionId) {
          const newCollection = await tx.collection.findUnique({
            where: { id: newCollectionId },
            include: { order: true },
          });
          
          if (newCollection?.order) {
            const newOrder = (newCollection.order.order as string[]) || [];
            // Only add if not already present (safety check)
            if (!newOrder.includes(validatedData.id)) {
              const updatedNewOrder = [...newOrder, validatedData.id];
              
              await tx.order.update({
                where: { id: newCollection.order.id },
                data: { order: updatedNewOrder },
              });
            }
          }
        } else {
          // Add to top-level bookmark order
          const topLevelOrder = await tx.order.findFirst({
            where: {
              userId: bookmark.userId,
              type: 'bookmark',
              collectionId: null,
            },
          });

          if (topLevelOrder) {
            const currentOrder = (topLevelOrder.order as string[]) || [];
            // Only add if not already present
            if (!currentOrder.includes(validatedData.id)) {
              await tx.order.update({
                where: { id: topLevelOrder.id },
                data: { order: [...currentOrder, validatedData.id] },
              });
            }
          } else {
            // Create order if it doesn't exist
            await tx.order.create({
              data: {
                userId: bookmark.userId,
                type: 'bookmark',
                collectionId: null,
                order: [validatedData.id],
              },
            });
          }
        }
      }

      return updated;
    });
    
    return updatedBookmark;
  }

  /**
   * Move a bookmark to a different collection with a specific order
   * This combines updating the bookmark's collectionId and setting the order in a single transaction
   * @param data - Move operation data
   */
  async move(data: z.infer<typeof moveBookmarkInputSchema>) {
    const validatedData = moveBookmarkInputSchema.parse(data);
    
    // Check if bookmark exists and belongs to user (if userId provided)
    const bookmark = await this.prisma.bookmark.findUnique({
      where: validatedData.userId 
        ? { id: validatedData.id, userId: validatedData.userId }
        : { id: validatedData.id },
    });
    if (!bookmark) {
      throw new NotFoundError(`Bookmark(id: ${validatedData.id}) not found`);
    }

    // Track old collection ID for cleanup
    const oldCollectionId = bookmark.collectionId;
    const newCollectionId = validatedData.targetCollectionId;

    // Validate that the bookmark ID is in the target order array
    if (!validatedData.targetOrder.includes(validatedData.id)) {
      throw new ValidationError('Target order must include the bookmark being moved');
    }

    // Check if this is just a reorder within the same collection
    const isSameCollection = oldCollectionId === newCollectionId;

    // Wrap in transaction to ensure atomicity
    const movedBookmark = await this.withTransaction(async (tx) => {
      let updated = bookmark;

      // Step 1: Update the bookmark's collectionId (only if moving to different collection)
      if (!isSameCollection) {
        updated = await tx.bookmark.update({
          where: { id: validatedData.id },
          data: {
            collection: newCollectionId
              ? { connect: { id: newCollectionId } }
              : { disconnect: true },
          },
        });

        // Step 2: Remove bookmark from old collection's order (only if moving to different collection)
        if (oldCollectionId) {
          const oldCollectionOrder = await tx.order.findFirst({
            where: {
              userId: bookmark.userId,
              type: 'bookmark',
              collectionId: oldCollectionId,
            },
          });
          
          if (oldCollectionOrder) {
            const currentOrder = (oldCollectionOrder.order as string[]) || [];
            const updatedOldOrder = currentOrder.filter(id => id !== validatedData.id);
            
            await tx.order.update({
              where: { id: oldCollectionOrder.id },
              data: { order: updatedOldOrder },
            });
          }
        } else {
          // Remove from top-level bookmark order
          const topLevelOrder = await tx.order.findFirst({
            where: {
              userId: bookmark.userId,
              type: 'bookmark',
              collectionId: null,
            },
          });

          if (topLevelOrder) {
            const currentOrder = (topLevelOrder.order as string[]) || [];
            const updatedOrder = currentOrder.filter(id => id !== validatedData.id);
            
            await tx.order.update({
              where: { id: topLevelOrder.id },
              data: { order: updatedOrder },
            });
          }
        }
      }
      
      // Step 3: Set the complete order for the target collection
      const targetOrder = await tx.order.findFirst({
        where: {
          userId: bookmark.userId,
          type: 'bookmark',
          collectionId: newCollectionId,
        },
      });

      if (targetOrder) {
        // Update existing order
        await tx.order.update({
          where: { id: targetOrder.id },
          data: { order: validatedData.targetOrder },
        });
      } else {
        // Create new order if it doesn't exist
        await tx.order.create({
          data: {
            userId: bookmark.userId,
            type: 'bookmark',
            collectionId: newCollectionId,
            order: validatedData.targetOrder,
          },
        });
      }

      return updated;
    });
    
    return movedBookmark;
  }

  /**
   * Delete a bookmark
   * @param data - Delete operation data
   */
  async delete(data: z.infer<typeof deleteBookmarkInputSchema>) {
    const validatedData = deleteBookmarkInputSchema.parse(data);
    
    // Check if bookmark exists and belongs to user (if userId provided)
    const bookmark = await this.prisma.bookmark.findUnique({
      where: validatedData.userId 
        ? { id: validatedData.id, userId: validatedData.userId }
        : { id: validatedData.id },
    });
    if (!bookmark) {
      throw new NotFoundError(`Bookmark(id: ${validatedData.id}) not found`);
    }

    // Wrap in transaction to ensure atomicity
    await this.withTransaction(async (tx) => {
      // Remove bookmark from Order table
      if (bookmark.collectionId) {
        // Remove from collection's order
        const collection = await tx.collection.findUnique({
          where: { id: bookmark.collectionId },
          include: { order: true },
        });
        
        if (collection?.order) {
          const currentOrder = (collection.order.order as string[]) || [];
          const updatedOrder = currentOrder.filter(id => id !== validatedData.id);
          
          await tx.order.update({
            where: { id: collection.order.id },
            data: { order: updatedOrder },
          });
        }
      } else {
        // Remove from top-level bookmark order
        const topLevelOrder = await tx.order.findFirst({
          where: {
            userId: bookmark.userId,
            type: 'bookmark',
            collectionId: null,
          },
        });

        if (topLevelOrder) {
          const currentOrder = (topLevelOrder.order as string[]) || [];
          const updatedOrder = currentOrder.filter(id => id !== validatedData.id);
          
          await tx.order.update({
            where: { id: topLevelOrder.id },
            data: { order: updatedOrder },
          });
        }
      }

      // Delete the bookmark (websiteIcon will be cascade deleted automatically)
      await tx.bookmark.delete({
        where: { id: validatedData.id },
      });
    });
  }
}
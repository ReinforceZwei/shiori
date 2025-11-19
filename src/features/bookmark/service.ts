import { prisma, Prisma } from "@/lib/prisma";
import { z } from "zod";
import { validateAndDetectImageType } from "@/lib/utils/image";
import { NotFoundError } from "@/lib/errors";

export async function getBookmarks({ userId }: { userId?: string } = {}) {
  const bookmarks = await prisma.bookmark.findMany({
    where: userId ? { userId } : undefined,
  });
  return bookmarks;
}

export async function getBookmark({ id, userId }: { id: string; userId?: string }) {
  const bookmark = await prisma.bookmark.findUnique({
    where: userId ? { id, userId } : { id },
  });
  return bookmark;
}

export async function getBookmarkWithWebsiteIcon({ id, userId }: { id: string; userId?: string }) {
  const bookmark = await prisma.bookmark.findUnique({
    where: userId ? { id, userId } : { id },
    include: {
      websiteIcon: true,
    },
  });
  return bookmark;
}

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

export async function createBookmark(data: z.infer<typeof createBookmarkInputSchema>) {
  const validatedData = createBookmarkInputSchema.parse(data);
  if (validatedData.collectionId) {
    const collection = await prisma.collection.findUnique({
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
  const bookmark = await prisma.$transaction(async (tx) => {
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

export async function updateBookmark(data: z.infer<typeof updateBookmarkInputSchema>) {
  const validatedData = updateBookmarkInputSchema.parse(data);
  
  // Check if bookmark exists and belongs to user (if userId provided)
  const bookmark = await prisma.bookmark.findUnique({
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
      const collection = await prisma.collection.findUnique({
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
  const updatedBookmark = await prisma.$transaction(async (tx) => {
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

const deleteBookmarkInputSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
});

export async function deleteBookmark(data: z.infer<typeof deleteBookmarkInputSchema>) {
  const validatedData = deleteBookmarkInputSchema.parse(data);
  
  // Check if bookmark exists and belongs to user (if userId provided)
  const bookmark = await prisma.bookmark.findUnique({
    where: validatedData.userId 
      ? { id: validatedData.id, userId: validatedData.userId }
      : { id: validatedData.id },
  });
  if (!bookmark) {
    throw new NotFoundError(`Bookmark(id: ${validatedData.id}) not found`);
  }

  // Wrap in transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
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
import { z } from "zod";
import { ServiceBase } from "@/lib/service-base.class";
import { ValidationError } from "@/lib/errors";
import { extractBase64 } from "@/lib/utils/image";
import { CollectionService } from "../collection/service";
import { BookmarkService } from "../bookmark/service";
import { OrderService } from "../order/service";

const importBookmarksWithCollectionsInputSchema = z.object({
  userId: z.string(),
  collections: z.array(z.object({
    /** `create` - create a new collection, `existing` - use an existing collection, `uncollected` - import bookmarks without a collection */
    mode: z.enum(['create', 'existing', 'uncollected']),
    /** The name of the new collection to create */
    newName: z.string().optional(),
    /** The id of the existing collection to use */
    existingId: z.string().optional(),
    bookmarks: z.array(z.object({
      title: z.string(),
      url: z.string(),
      description: z.string().optional(),
      websiteIcon: z.object({
        data: z.base64(),
        mimeType: z.string(),
      }).optional(),
    }))
  }))
});

export class BulkService extends ServiceBase {
  async importBookmarksWithCollections(data: z.infer<typeof importBookmarksWithCollectionsInputSchema>) {
    const validatedData = importBookmarksWithCollectionsInputSchema.parse(data);

    if (validatedData.collections.length === 0) {
      throw new ValidationError('At least one collection is required');
    }

    // Validate new name is provided for create mode collections
    const createCollections = validatedData.collections.filter(c => c.mode === 'create');
    if (createCollections.length > 0) {
      for (const collection of createCollections) {
        if (!collection.newName) {
          throw new ValidationError('New name is required for create collections');
        }
      }
    }
    
    // Validate all existing collection
    const existingCollectionIds = validatedData.collections.filter(c => c.mode === 'existing').map(c => c.existingId).filter(id => id !== undefined);
    if (existingCollectionIds.length > 0) {
      // Deduplicate collection IDs since multiple bookmarks can reference the same collection
      const uniqueCollectionIds = [...new Set(existingCollectionIds)];
      const existingCollectionsCount = await this.prisma.collection.count({
        where: {
          id: { in: uniqueCollectionIds },
          userId: validatedData.userId,
        },
      });
      if (existingCollectionsCount !== uniqueCollectionIds.length) {
        throw new ValidationError('One or more existing collections not found');
      }
    }

    await this.withTransaction(async (tx) => {
      const collectionService = new CollectionService(tx);
      const bookmarkService = new BookmarkService(tx);
      const orderService = new OrderService(tx);

      for (const collection of validatedData.collections) {
        if (collection.mode === 'create') {
          const newCollection = await collectionService.create({
            userId: validatedData.userId,
            name: collection.newName!,
          });
          const newBookmarks = await tx.bookmark.createManyAndReturn({
            data: collection.bookmarks.map(bookmark => ({
              userId: validatedData.userId,
              title: bookmark.title,
              url: bookmark.url,
              description: bookmark.description,
              collectionId: newCollection.id,
            })),
            select: { id: true },
          });

          // Create website icons separately
          const iconsToCreate = collection.bookmarks
            .map((bookmark, index) => {
              if (bookmark.websiteIcon) {
                return {
                  bookmarkId: newBookmarks[index].id,
                  data: Buffer.from(extractBase64(bookmark.websiteIcon.data), 'base64'),
                  mimeType: bookmark.websiteIcon.mimeType,
                };
              }
              return null;
            })
            .filter((icon): icon is NonNullable<typeof icon> => icon !== null);

          if (iconsToCreate.length > 0) {
            await tx.websiteIcon.createMany({
              data: iconsToCreate,
            });
          }

          await orderService.upsert({
            userId: validatedData.userId,
            type: 'bookmark',
            collectionId: newCollection.id,
            order: newBookmarks.map(bookmark => bookmark.id),
          });
        }
        if (collection.mode === 'existing') {
          const existingCollection = await collectionService.get({
            id: collection.existingId!,
            userId: validatedData.userId,
          });
          if (!existingCollection) {
            // Should not happen, already validated in the beginning
            throw new ValidationError('Existing collection not found');
          }
          const newBookmarks = await tx.bookmark.createManyAndReturn({
            data: collection.bookmarks.map(bookmark => ({
              userId: validatedData.userId,
              title: bookmark.title,
              url: bookmark.url,
              description: bookmark.description,
              collectionId: existingCollection.id,
            })),
            select: { id: true },
          });

          // Create website icons separately
          const iconsToCreate = collection.bookmarks
            .map((bookmark, index) => {
              if (bookmark.websiteIcon) {
                return {
                  bookmarkId: newBookmarks[index].id,
                  data: Buffer.from(extractBase64(bookmark.websiteIcon.data), 'base64'),
                  mimeType: bookmark.websiteIcon.mimeType,
                };
              }
              return null;
            })
            .filter((icon): icon is NonNullable<typeof icon> => icon !== null);

          if (iconsToCreate.length > 0) {
            await tx.websiteIcon.createMany({
              data: iconsToCreate,
            });
          }

          const existingOrder = await orderService.get({
            userId: validatedData.userId,
            type: 'bookmark',
            collectionId: existingCollection.id,
          });
          const updatedOrder = [...(existingOrder?.order as string[] ?? []), ...newBookmarks.map(bookmark => bookmark.id)];
          await orderService.upsert({
            userId: validatedData.userId,
            type: 'bookmark',
            collectionId: existingCollection.id,
            order: updatedOrder,
          });
        }
        if (collection.mode === 'uncollected') {
          const newBookmarks = await tx.bookmark.createManyAndReturn({
            data: collection.bookmarks.map(bookmark => ({
              userId: validatedData.userId,
              title: bookmark.title,
              url: bookmark.url,
              description: bookmark.description,
            })),
            select: { id: true },
          });

          // Create website icons separately
          const iconsToCreate = collection.bookmarks
            .map((bookmark, index) => {
              if (bookmark.websiteIcon) {
                return {
                  bookmarkId: newBookmarks[index].id,
                  data: Buffer.from(extractBase64(bookmark.websiteIcon.data), 'base64'),
                  mimeType: bookmark.websiteIcon.mimeType,
                };
              }
              return null;
            })
            .filter((icon): icon is NonNullable<typeof icon> => icon !== null);

          if (iconsToCreate.length > 0) {
            await tx.websiteIcon.createMany({
              data: iconsToCreate,
            });
          }

          await orderService.upsert({
            userId: validatedData.userId,
            type: 'bookmark',
            collectionId: null,
            order: newBookmarks.map(bookmark => bookmark.id),
          });
        }
      }
    });
  }

}
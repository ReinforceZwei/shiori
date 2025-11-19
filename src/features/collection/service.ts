import { prisma, Prisma } from "@/lib/prisma";
import { z } from "zod";
import { NotFoundError } from "@/lib/errors";

export async function getCollections({ userId }: { userId?: string } = {}) {
  const collections = await prisma.collection.findMany({
    where: userId ? { userId } : undefined,
  });
  return collections;
}

export async function getCollectionsWithBookmarks({ userId }: { userId?: string } = {}) {
  const collections = await prisma.collection.findMany({
    where: userId ? { userId } : undefined,
    include: {
      bookmark: true,
    },
  });
  return collections;
}

export async function getCollection({ id, userId }: { id: string; userId?: string }) {
  const collection = await prisma.collection.findUnique({
    where: userId ? { id, userId } : { id },
  });
  return collection;
}

const createCollectionInputSchema = z.object({
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
});

export async function createCollection(data: z.infer<typeof createCollectionInputSchema>) {
  const validatedData = createCollectionInputSchema.parse(data);
  
  // Create collection with its associated order record in a transaction
  const collection = await prisma.$transaction(async (tx) => {
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

    return newCollection;
  });

  return collection;
}

const updateCollectionInputSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  name: z.string().optional(),
  description: z.string().nullable().optional(), // Allow null to clear
  color: z.string().nullable().optional(), // Allow null to clear
});

export async function updateCollection(data: z.infer<typeof updateCollectionInputSchema>) {
  const validatedData = updateCollectionInputSchema.parse(data);
  
  // Check if collection exists and belongs to user (if userId provided)
  const collection = await prisma.collection.findUnique({
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
    return await prisma.collection.update({
      where: { id: validatedData.id },
      data: updateData,
    });
  }
  
  // No changes
  return collection;
}

const deleteCollectionInputSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
});

export async function deleteCollection(data: z.infer<typeof deleteCollectionInputSchema>) {
  const validatedData = deleteCollectionInputSchema.parse(data);
  
  // Check if collection exists and belongs to user (if userId provided)
  const collection = await prisma.collection.findUnique({
    where: validatedData.userId 
      ? { id: validatedData.id, userId: validatedData.userId }
      : { id: validatedData.id },
  });
  if (!collection) {
    throw new NotFoundError(`Collection(id: ${validatedData.id}) not found`);
  }

  // Delete the collection (bookmarks will be cascade deleted or set to null based on schema)
  await prisma.collection.delete({
    where: { id: validatedData.id },
  });
}


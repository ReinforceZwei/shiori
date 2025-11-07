import { prisma, Prisma } from "@/lib/prisma";
import { z } from "zod";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { validateCollectionOrder } from "@/lib/ordering";

export async function getCollections({ userId }: { userId?: string } = {}) {
  const collections = await prisma.collection.findMany({
    where: userId ? { userId } : undefined,
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
  
  const collection = await prisma.collection.create({
    data: {
      name: validatedData.name,
      description: validatedData.description,
      color: validatedData.color,
      user: {
        connect: { id: validatedData.userId },
      },
    },
  });
  return collection;
}

const updateCollectionInputSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  name: z.string().optional(),
  description: z.string().nullable().optional(), // Allow null to clear
  color: z.string().nullable().optional(), // Allow null to clear
  bookmarkOrder: z.any().optional(), // Json type
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

  // Validate bookmarkOrder if provided
  if (validatedData.bookmarkOrder !== undefined) {
    // Wrap in transaction to ensure atomicity
    return await prisma.$transaction(async (tx) => {
      const validationResult = await validateCollectionOrder(
        tx,
        'list', // Use 'list' as all strategies have the same collection order validation
        validatedData.bookmarkOrder,
        { userId: collection.userId, collectionId: validatedData.id },
        { strict: false }
      );

      if (!validationResult.valid) {
        throw new ValidationError(`Invalid bookmarkOrder: ${validationResult.errors.join(', ')}`);
      }

      // Use validated and normalized bookmarkOrder
      updateData.bookmarkOrder = validationResult.normalized as Prisma.InputJsonValue;

      // Perform the update
      return await tx.collection.update({
        where: { id: validatedData.id },
        data: updateData,
      });
    });
  } else {
    // No bookmarkOrder update, just update other fields if any
    if (Object.keys(updateData).length > 0) {
      return await prisma.collection.update({
        where: { id: validatedData.id },
        data: updateData,
      });
    }
    // No update
    return collection;
  }
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


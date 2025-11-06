import { prisma, Prisma } from "@/lib/prisma";
import { z } from "zod";
import { NotFoundError } from "@/lib/errors";

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
  bookmarkOrder: z.any().optional(), // Json type
});

export async function createCollection(data: z.infer<typeof createCollectionInputSchema>) {
  const validatedData = createCollectionInputSchema.parse(data);
  
  const collection = await prisma.collection.create({
    data: {
      name: validatedData.name,
      description: validatedData.description,
      color: validatedData.color,
      bookmarkOrder: validatedData.bookmarkOrder,
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
  if (validatedData.bookmarkOrder !== undefined) {
    updateData.bookmarkOrder = validatedData.bookmarkOrder;
  }

  await prisma.collection.update({
    where: { id: validatedData.id },
    data: updateData,
  });
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


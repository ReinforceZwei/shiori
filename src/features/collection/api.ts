'use server';
import { unauthorized } from "next/navigation";
import { getUser } from "@/lib/auth";
import { prisma, Prisma } from "@/lib/prisma";
import * as collectionService from "./service";

export async function getCollections(include?: Prisma.CollectionInclude) {
  const user = await getUser();
  if (!user) {
    return unauthorized();
  }
  // If include is needed, use prisma directly for now
  if (include) {
    const collections = await prisma.collection.findMany({
      where: { userId: user.id },
      include,
    });
    return collections;
  }
  return collectionService.getCollections({ userId: user.id });
}

export async function getCollection(id: string, include?: Prisma.CollectionInclude) {
  const user = await getUser();
  if (!user) {
    return unauthorized();
  }
  // If include is needed, use prisma directly for now
  if (include) {
    const collection = await prisma.collection.findUnique({
      where: { id, userId: user.id },
      include,
    });
    return collection;
  }
  return collectionService.getCollection({ id, userId: user.id });
}

export type CreateCollectionInput = {
  name: string;
  description?: string;
  color?: string;
  bookmarkOrder?: any;
}

export async function createCollection(data: CreateCollectionInput) {
  const user = await getUser();
  if (!user) {
    return unauthorized();
  }
  return collectionService.createCollection({
    ...data,
    userId: user.id,
  });
}

export async function updateCollection(id: string, data: Omit<CreateCollectionInput, 'name'> & { name?: string }) {
  const user = await getUser();
  if (!user) {
    return unauthorized();
  }
  // Verify ownership before updating
  const collection = await collectionService.getCollection({ id, userId: user.id });
  if (!collection) {
    return unauthorized();
  }
  return collectionService.updateCollection({
    id,
    userId: user.id,
    ...data,
  });
}

export async function deleteCollection(id: string) {
  const user = await getUser();
  if (!user) {
    return unauthorized();
  }
  // Verify ownership before deleting
  const collection = await collectionService.getCollection({ id, userId: user.id });
  if (!collection) {
    return unauthorized();
  }
  await collectionService.deleteCollection({ id, userId: user.id });
}
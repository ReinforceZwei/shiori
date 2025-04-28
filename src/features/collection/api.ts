'use server';
import { unauthorized } from "next/navigation";
import { getUser } from "@/lib/auth";
import { prisma, Prisma } from "@/lib/prisma";

export async function getCollections(include?: Prisma.CollectionInclude) {
  const user = await getUser();
  if (!user) {
    return unauthorized();
  }
  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    include,
  });
  return collections;
}

export async function getCollection(id: string, include?: Prisma.CollectionInclude) {
  const user = await getUser();
  if (!user) {
    return unauthorized();
  }
  const collection = await prisma.collection.findUnique({
    where: { id, userId: user.id },
    include,
  });
  return collection;
}

export type CreateCollectionInput = Pick<Prisma.CollectionCreateInput, 'name' | 'description' | 'color' | 'parent'>
export async function createCollection(data: CreateCollectionInput) {
  const user = await getUser();
  if (!user) {
    return unauthorized();
  }
  if (data.parent && data.parent.connect) {
    if (data.parent.connect.id === data.parent.create?.id) {
      throw new Error("Cannot connect to the same collection as parent and create a new one with the same id.");
    }
  }
  const collection = await prisma.collection.create({
    data: {
      ...data,
      user: {
        connect: { id: user.id },
      },
    }
  });
  return collection;
}

export async function updateCollection(id: string, data: Prisma.CollectionUpdateInput) {
  const user = await getUser();
  if (!user) {
    return unauthorized();
  }
  if (data.parent && data.parent.connect) {
    if (data.parent.connect.id === data.parent.create?.id) {
      throw new Error("Cannot connect to the same collection as parent and create a new one with the same id.");
    }
    if (data.parent.connect.id === id) {
      throw new Error("Cannot set the collection as its own parent.");
    }
  }
  const collection = await prisma.collection.update({
    where: { id, userId: user.id },
    data,
  });
  return collection;
}

export async function deleteCollection(id: string) {
  const user = await getUser();
  if (!user) {
    return unauthorized();
  }
  await prisma.collection.delete({
    where: { id, userId: user.id },
  });
}
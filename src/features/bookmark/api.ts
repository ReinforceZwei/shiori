'use server';
import { unauthorized } from 'next/navigation';
import { getUser } from "@/lib/auth";
import { prisma, Prisma } from "@/lib/prisma";

export async function getBookmarks() {
  const user = await getUser();
  if (!user) {
    return unauthorized();
  }
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
  });
  return bookmarks;
}

export async function queryBookmarks(query: Prisma.BookmarkWhereInput, include?: Prisma.BookmarkInclude) {
  const user = await getUser();
  if (!user) {
    return unauthorized();
  }
  const bookmarks = await prisma.bookmark.findMany({
    where: {
      ...query,
      userId: user.id,
    },
    include,
  });
  return bookmarks;
}

export async function getBookmark(id: string) {
  const user = await getUser();
  if (!user) {
    return unauthorized();
  }
  const bookmark = await prisma.bookmark.findUnique({
    where: { id, userId: user.id },
  });
  return bookmark;
}

export async function createBookmark(data: Prisma.BookmarkCreateInput) {
  const user = await getUser();
  if (!user) {
    return unauthorized();
  }
  const bookmark = await prisma.bookmark.create({
    data: {
      ...data,
      user: {
        connect: { id: user.id },
      },
    }
  });
  return bookmark;
}

export async function updateBookmark(id: string, data: any) {
  const user = await getUser();
  if (!user) {
    return unauthorized();
  }
  const bookmark = await prisma.bookmark.update({
    where: { id, userId: user.id },
    data,
  });
  return bookmark;
}

export async function deleteBookmark(id: string) {
  const user = await getUser();
  if (!user) {
    return unauthorized();
  }
  await prisma.bookmark.delete({
    where: { id, userId: user.id },
  });
}
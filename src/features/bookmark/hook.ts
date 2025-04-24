import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBookmarks, getBookmark, queryBookmarks, createBookmark, updateBookmark, deleteBookmark } from "./api";
import { Prisma } from "@/generated/prisma";

export function useBookmarkQuery({
  id,
}: {
  id: string;
}) {
  return useQuery({
    queryKey: ["bookmarks", id],
    queryFn: () => getBookmark(id),
  });
}

export function useQueryBookmarksQuery(query: Prisma.BookmarkWhereInput) {
  return useQuery({
    queryKey: ["bookmarks", "*"], // since query very free, hard to invaildate, so invalidate all
    queryFn: () => queryBookmarks(query),
  });
}

export function useAllBookmarksQuery() {
  return useQuery({
    queryKey: ["bookmarks", "*"],
    queryFn: () => getBookmarks(),
  });
}

export function useCreateBookmarkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newBookmark: Prisma.BookmarkCreateInput) => {
      return createBookmark(newBookmark);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", "*"] });
    },
  });
}

export function useUpdateBookmarkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Prisma.BookmarkUpdateInput }) => {
      return updateBookmark(id, data);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", "*"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks", variables.id] });
    },
  });
}

export function useDeleteBookmarkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      return deleteBookmark(id);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", "*"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks", variables] });
    },
  });
}
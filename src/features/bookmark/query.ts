import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "@/generated/prisma";
import type { BookmarkMetadataResponse } from "@/app/api/bookmark/metadata/types";

// Extended bookmark type with website icon data
export interface BookmarkWithIcon extends Bookmark {
  websiteIcon: string | null;
  websiteIconMimeType: string | null;
}

// Type definitions that match the backend service schema
export interface CreateBookmarkInput {
  title: string;
  url: string;
  description?: string;
  collectionId?: string;
  websiteIcon?: {
    data: string;  // base64 encoded string
  };
}

export interface UpdateBookmarkInput {
  title?: string;
  url?: string;
  description?: string | null;
  collectionId?: string | null;
  websiteIcon?: {
    data: string;  // base64 encoded string
  };
}

// API fetch functions
async function getBookmarks(): Promise<Bookmark[]> {
  const response = await fetch("/api/bookmark");
  if (!response.ok) {
    throw new Error(`Failed to fetch bookmarks: ${response.statusText}`);
  }
  return response.json();
}

async function getBookmark(id: string): Promise<BookmarkWithIcon> {
  const response = await fetch(`/api/bookmark/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch bookmark: ${response.statusText}`);
  }
  return response.json();
}

async function createBookmark(data: CreateBookmarkInput): Promise<Bookmark> {
  const response = await fetch("/api/bookmark", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to create bookmark: ${response.statusText}`);
  }
  return response.json();
}

async function updateBookmark(id: string, data: UpdateBookmarkInput): Promise<Bookmark> {
  const response = await fetch("/api/bookmark", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, ...data }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update bookmark: ${response.statusText}`);
  }
  return response.json();
}

async function deleteBookmark(id: string): Promise<{ message: string }> {
  const response = await fetch("/api/bookmark", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    throw new Error(`Failed to delete bookmark: ${response.statusText}`);
  }
  return response.json();
}

async function getBookmarkMetadata(url: string): Promise<BookmarkMetadataResponse> {
  const response = await fetch(`/api/bookmark/metadata?url=${encodeURIComponent(url)}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to fetch metadata: ${response.statusText}`);
  }
  return response.json();
}

// React Query hooks
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

export function useAllBookmarksQuery() {
  return useQuery({
    queryKey: ["bookmarks", "*"],
    queryFn: () => getBookmarks(),
  });
}

export function useCreateBookmarkMutation() {
  const queryClient = useQueryClient();
  return useMutation<Bookmark, Error, CreateBookmarkInput>({
    mutationFn: (newBookmark: CreateBookmarkInput) => {
      return createBookmark(newBookmark);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", "*"] });
      queryClient.invalidateQueries({ queryKey: ["collections", data.collectionId] });
    },
  });
}

export function useUpdateBookmarkMutation() {
  const queryClient = useQueryClient();
  return useMutation<Bookmark, Error, { id: string; data: UpdateBookmarkInput }>({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookmarkInput }) => {
      return updateBookmark(id, data);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", "*"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["collections", data.collectionId] });
    },
  });
}

export function useDeleteBookmarkMutation() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (id: string) => {
      return deleteBookmark(id);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", "*"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks", variables] });
      // we don't have collection id here, so we need to invalidate all collections
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

/**
 * Hook to fetch bookmark metadata (title and icons) from a URL
 * 
 * Use this when you want to fetch metadata reactively based on URL changes
 * with automatic caching and deduplication.
 * 
 * @param url - The website URL to fetch metadata from
 * @param options - Query options
 * @returns Query result with metadata
 * 
 * @example
 * ```tsx
 * const { data, isLoading, refetch } = useBookmarkMetadataQuery(url, {
 *   enabled: false, // Don't auto-fetch, wait for manual trigger
 * });
 * 
 * // Manually trigger fetch
 * const handleFetch = () => refetch();
 * ```
 */
export function useBookmarkMetadataQuery(
  url: string,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: ["bookmark-metadata", url],
    queryFn: () => getBookmarkMetadata(url),
    enabled: options?.enabled ?? false, // Disabled by default for manual triggering
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1, // Only retry once on failure
  });
}

/**
 * Alternative mutation-based hook to fetch bookmark metadata
 * 
 * Use this when you want more explicit control over when to fetch,
 * with clear loading states per request. Good for form inputs where
 * you want to trigger fetch on user action (e.g., debounced input).
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```tsx
 * const { mutate, data, isPending } = useFetchBookmarkMetadataMutation();
 * 
 * // Trigger on user action
 * const handleUrlChange = (url: string) => {
 *   mutate(url);
 * };
 * ```
 */
export function useFetchBookmarkMetadataMutation() {
  return useMutation<BookmarkMetadataResponse, Error, string>({
    mutationFn: (url: string) => getBookmarkMetadata(url),
    // Note: Mutations don't cache by default, but we could add queryClient.setQueryData
    // to cache the result if needed
  });
}
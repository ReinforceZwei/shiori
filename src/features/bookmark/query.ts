import { useQuery, useMutation } from "@tanstack/react-query";
import { Bookmark } from "@/generated/prisma/browser";
import type { BookmarkMetadataResponse } from "@/app/api/bookmark/metadata/types";

// Extended bookmark type with website icon data
export interface BookmarkWithIcon extends Bookmark {
  websiteIcon: string | null;
  websiteIconMimeType: string | null;
}

async function getBookmark(id: string): Promise<BookmarkWithIcon> {
  const response = await fetch(`/api/bookmark/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch bookmark: ${response.statusText}`);
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
import { useQuery } from "@tanstack/react-query";
import { Bookmark } from "@/generated/prisma/browser";

// API fetch function
async function searchBookmarks(query: string): Promise<Bookmark[]> {
  if (!query) {
    return [];
  }
  
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to search bookmarks: ${response.statusText}`);
  }
  return response.json();
}

// React Query hook
/**
 * Hook to search bookmarks using full-text search
 * 
 * @param query - The search query string
 * @param options - Query options
 * @returns Query result with matching bookmarks (max 10 results)
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useSearchQuery('github', {
 *   enabled: true, // Auto-fetch when query changes
 * });
 * 
 * // Search results
 * if (data) {
 *   console.log(`Found ${data.length} bookmarks`);
 * }
 * ```
 */
export function useSearchQuery(
  query: string,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchBookmarks(query),
    enabled: options?.enabled ?? (query.length > 0), // Only search if query is not empty
    staleTime: 30 * 1000, // Cache for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Order } from "@/generated/prisma/browser";

// API fetch functions

interface GetOrderParams {
  type: 'collection' | 'bookmark';
  collectionId?: string | null;
}

async function getOrder(params: GetOrderParams): Promise<Order | null> {
  const searchParams = new URLSearchParams({
    type: params.type,
    collectionId: params.collectionId === null ? 'null' : (params.collectionId || ''),
  });

  const response = await fetch(`/api/order?${searchParams}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch order: ${response.statusText}`);
  }
  return response.json();
}

interface UpsertOrderData {
  type: 'collection' | 'bookmark';
  order: string[];
  collectionId?: string | null;
}

async function upsertOrder(data: UpsertOrderData): Promise<Order> {
  const response = await fetch("/api/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to save order: ${response.statusText}`);
  }
  return response.json();
}

// React Query hooks

/**
 * Hook to fetch an order record
 * 
 * @example
 * ```tsx
 * // Get collection order (top-level)
 * const { data: collectionOrder } = useOrderQuery({ type: 'collection' });
 * 
 * // Get top-level bookmark order
 * const { data: bookmarkOrder } = useOrderQuery({ type: 'bookmark' });
 * 
 * // Get bookmarks within a collection
 * const { data: collectionBookmarks } = useOrderQuery({ 
 *   type: 'bookmark', 
 *   collectionId: 'col-123' 
 * });
 * ```
 */
export function useOrderQuery(params: GetOrderParams) {
  return useQuery({
    queryKey: ["order", params.type, params.collectionId ?? null],
    queryFn: () => getOrder(params),
  });
}

/**
 * Hook to upsert (create or update) an order record
 * 
 * @example
 * ```tsx
 * const { mutate } = useUpsertOrderMutation();
 * 
 * // Update collection order
 * mutate({ 
 *   type: 'collection', 
 *   order: ['col-1', 'col-2', 'col-3'] 
 * });
 * 
 * // Update top-level bookmark order
 * mutate({ 
 *   type: 'bookmark', 
 *   order: ['bm-1', 'bm-2'], 
 *   collectionId: null 
 * });
 * 
 * // Update bookmarks within a collection
 * mutate({ 
 *   type: 'bookmark', 
 *   order: ['bm-3', 'bm-4'], 
 *   collectionId: 'col-123' 
 * });
 * ```
 */
export function useUpsertOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, UpsertOrderData>({
    mutationFn: (data) => upsertOrder(data),
    onSuccess: (data) => {
      // Invalidate the specific order query
      queryClient.invalidateQueries({ 
        queryKey: ["order", data.type, data.collectionId ?? null] 
      });
      // Also invalidate all orders to be safe
      queryClient.invalidateQueries({ queryKey: ["order"] });
      
      // If it's a collection bookmark order, invalidate the collection
      if (data.collectionId) {
        queryClient.invalidateQueries({ queryKey: ["collections", data.collectionId] });
      }
    },
  });
}


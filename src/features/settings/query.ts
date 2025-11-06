import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Settings, Prisma } from "@/generated/prisma";

// Type for settings with included relations
export type SettingsWithRelations = Settings & {
  pinnedCollection: Prisma.CollectionGetPayload<object> | null;
};

// API fetch functions
async function getSettings(): Promise<SettingsWithRelations | null> {
  const response = await fetch("/api/settings");
  if (!response.ok) {
    throw new Error(`Failed to fetch settings: ${response.statusText}`);
  }
  return response.json();
}

async function upsertSettings(data: {
  layoutMode?: "launcher" | "grid" | "list";
  topLevelOrdering?: any;
  launcherTopLevelOrdering?: any;
  pinnedCollectionId?: string | null;
}): Promise<SettingsWithRelations> {
  const response = await fetch("/api/settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to save settings: ${response.statusText}`);
  }
  return response.json();
}

// React Query hooks

/**
 * Hook to fetch user settings
 * 
 * @example
 * ```tsx
 * const { data: settings, isLoading } = useSettingsQuery();
 * 
 * if (settings) {
 *   console.log(settings.layoutMode);
 *   console.log(settings.pinnedCollection);
 * }
 * ```
 */
export function useSettingsQuery() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => getSettings(),
  });
}

/**
 * Hook to upsert (create or update) settings
 * Supports updating any combination of settings fields
 * 
 * @example
 * ```tsx
 * const { mutate } = useUpsertSettingsMutation();
 * 
 * // Update layout mode
 * mutate({ layoutMode: "launcher" });
 * 
 * // Update pinned collection
 * mutate({ pinnedCollectionId: "collection-id" });
 * 
 * // Update top-level ordering (for grid/list modes)
 * mutate({ topLevelOrdering: ["bookmark-1", "bookmark-2"] });
 * 
 * // Update launcher ordering
 * mutate({ 
 *   launcherTopLevelOrdering: [
 *     { type: "collection", id: "col-1" },
 *     { type: "bookmark", id: "bm-1" },
 *   ]
 * });
 * 
 * // Update multiple fields at once
 * mutate({
 *   layoutMode: "launcher",
 *   pinnedCollectionId: "collection-id",
 * });
 * ```
 */
export function useUpsertSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation<SettingsWithRelations, Error, Parameters<typeof upsertSettings>[0]>({
    mutationFn: (data) => upsertSettings(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["settings"], data);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      // Invalidate collections if pinned collection changed
      if (data.pinnedCollectionId) {
        queryClient.invalidateQueries({ queryKey: ["collections", data.pinnedCollectionId] });
      }
    },
  });
}


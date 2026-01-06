import { useMutation, useQueryClient } from "@tanstack/react-query";

// Type definitions that match the API route schema
export interface ImportBookmarkInput {
  title: string;
  url: string;
  description?: string;
  websiteIcon?: {
    data: string;
    mimeType: string;
  };
}

export interface ImportCollectionInput {
  mode: 'create' | 'existing' | 'uncollected';
  newName?: string;
  existingId?: string;
  bookmarks: ImportBookmarkInput[];
}

export interface BulkImportInput {
  collections: ImportCollectionInput[];
  fetchMetadata?: boolean;
}

export interface BulkImportResponse {
  success: boolean;
  message: string;
  count?: number;
  error?: string;
  details?: any;
}

// API fetch function
async function bulkImportBookmarks(data: BulkImportInput): Promise<BulkImportResponse> {
  const response = await fetch("/api/import", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || `Failed to import bookmarks: ${response.statusText}`);
  }
  
  return result;
}

// React Query hook
export function useBulkImportMutation() {
  const queryClient = useQueryClient();
  
  return useMutation<BulkImportResponse, Error, BulkImportInput>({
    mutationFn: (importData: BulkImportInput) => {
      return bulkImportBookmarks(importData);
    },
    onSuccess: (data, variables, context) => {
      // Invalidate bookmarks and collections to refresh the data
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}


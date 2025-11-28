import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Collection } from "@/generated/prisma/browser";

// Type definitions that match the backend service schema
export interface CreateCollectionInput {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string | null;
  color?: string | null;
}

// API fetch functions
async function getCollections(): Promise<Collection[]> {
  const response = await fetch("/api/collection");
  if (!response.ok) {
    throw new Error(`Failed to fetch collections: ${response.statusText}`);
  }
  return response.json();
}

async function getCollection(id: string): Promise<Collection> {
  const response = await fetch(`/api/collection/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch collection: ${response.statusText}`);
  }
  return response.json();
}

async function createCollection(data: CreateCollectionInput): Promise<Collection> {
  const response = await fetch("/api/collection", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to create collection: ${response.statusText}`);
  }
  return response.json();
}

async function updateCollection(id: string, data: UpdateCollectionInput): Promise<Collection> {
  const response = await fetch("/api/collection", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, ...data }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update collection: ${response.statusText}`);
  }
  return response.json();
}

async function deleteCollection(id: string): Promise<{ message: string }> {
  const response = await fetch("/api/collection", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    throw new Error(`Failed to delete collection: ${response.statusText}`);
  }
  return response.json();
}

// React Query hooks
export function useCollectionQuery({
  id,
}: {
  id: string;
}) {
  return useQuery({
    queryKey: ["collections", id],
    queryFn: () => getCollection(id),
  });
}

export function useAllCollectionsQuery() {
  return useQuery({
    queryKey: ["collections", "*"],
    queryFn: () => getCollections(),
  });
}

export function useCreateCollectionMutation() {
  const queryClient = useQueryClient();
  return useMutation<Collection, Error, CreateCollectionInput>({
    mutationFn: (newCollection: CreateCollectionInput) => {
      return createCollection(newCollection);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["collections", "*"] });
    },
  });
}

export function useUpdateCollectionMutation() {
  const queryClient = useQueryClient();
  return useMutation<Collection, Error, { id: string; data: UpdateCollectionInput }>({
    mutationFn: ({ id, data }: { id: string; data: UpdateCollectionInput }) => {
      return updateCollection(id, data);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["collections", "*"] });
      queryClient.invalidateQueries({ queryKey: ["collections", variables.id] });
    },
  });
}

export function useDeleteCollectionMutation() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (id: string) => {
      return deleteCollection(id);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["collections", "*"] });
      queryClient.invalidateQueries({ queryKey: ["collections", variables] });
      // Invalidate bookmarks as they may reference this collection
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}


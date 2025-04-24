import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCollections, getCollection, CreateCollectionInput, createCollection, updateCollection, deleteCollection } from "./api";
import { Prisma } from "@/generated/prisma";

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

export type CollectionIncludeQuery<Include extends Prisma.CollectionInclude> = {
  id: string;
  include?: Include;
};

export function useCollectionIncludeQuery<Include extends Prisma.CollectionInclude>({
  id,
  include,
}: CollectionIncludeQuery<Include>) {
  return useQuery({
    queryKey: ["collections", id, include],
    queryFn: async () => {
      const result = await getCollection(id, include);
      return result as Prisma.CollectionGetPayload<{ include: Include }>;
    },
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
  return useMutation({
    mutationFn: (newCollection: CreateCollectionInput) => {
      return createCollection(newCollection);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections", "*"] });
    }
  });
}

export function useUpdateCollectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Prisma.CollectionUpdateInput }) => {
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
  return useMutation({
    mutationFn: (id: string) => {
      return deleteCollection(id);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["collections", "*"] });
      queryClient.invalidateQueries({ queryKey: ["collections", variables] });
    },
  });
}


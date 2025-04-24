'use client';
import { useParams, useRouter } from "next/navigation";
import CollectionTree, {
  TreeNodeEventHandler,
  Loading as CollectionTreeLoading,
} from "@/features/collection/component/CollectionTree/CollectionTree";
import { Prisma } from "@/generated/prisma";
import { useEffect, useRef, useState } from "react";
import { Alert, UseTreeReturnType } from "@mantine/core";
import ItemButton from "../../common/ItemButton/ItemButton";
import { useAllCollectionsQuery } from "@/features/collection/hook";

function getAllParentIds(id: string, collections: Prisma.CollectionGetPayload<{}>[]): string[] {
  const collection = collections.find((collection) => collection.id === id);
  if (!collection || !collection.parentId) return [];
  return [collection.parentId, ...getAllParentIds(collection.parentId, collections)];
}

export default function CollectionSideNav() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const treeRef = useRef<UseTreeReturnType>(null);
  const { data: collections, refetch, isPending, isLoadingError, error } = useAllCollectionsQuery();
  const [uncategorizeActive, setUncategorizeActive] = useState(id === undefined);

  useEffect(() => {
    if (treeRef.current && id && collections) {
      treeRef.current.select(id);
      for (const parentId of getAllParentIds(id, collections)) {
        treeRef.current.expand(parentId);
      }
    }
  }, [id, treeRef.current, collections]);

  useEffect(() => {
    console.log(id === undefined)
    setUncategorizeActive(id === undefined);
  }, [id]);

  const onClick = () => {
    if (id !== undefined) {
      if (treeRef.current) {
        treeRef.current.clearSelected();
      }
      router.push('/collection');
    }
  }
  const onTreeSelect: TreeNodeEventHandler = (collectionId, tree) => {
    console.log(`Clicked on collection with ID: ${collectionId}`);
    router.push(`/collection/${collectionId}`);
  }
  if (isPending) {
    return <CollectionTreeLoading />;
  }
  if (isLoadingError && error && !collections) {
    console.error('Error loading collections:', error);
    return (
      <Alert title="Error loading collections" color="red">
        {error.message}
      </Alert>
    )
  }
  return (
    <>
    <ItemButton label="未分類" mb={8} style={{paddingInlineStart: '50px'}} active={uncategorizeActive} onClick={onClick} />
    <CollectionTree collections={collections} onSelect={onTreeSelect} allowDeselect={false} treeRef={treeRef} />
    </>
  )
}
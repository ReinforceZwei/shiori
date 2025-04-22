'use client';
import { ActionIcon, Tree, Group, TreeNodeData, RenderTreeNodePayload, useTree } from "@mantine/core";
import { IconChevronRight } from '@tabler/icons-react';
import { Prisma } from "@/generated/prisma";
import { useMemo } from "react";
import styles from "./CollectionTree.module.css";

function collectionToMantineTreeData(data: Prisma.CollectionGetPayload<{}>[]): TreeNodeData[] {
  // Build a mapping of parentId to children
  const childrenMap = new Map<string | null, Prisma.CollectionGetPayload<{}>[]>();
  data.forEach((collection) => {
    const parentId = collection.parentId || null;
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, []);
    }
    childrenMap.get(parentId)!.push(collection);
  });

  // Recursive function to build the tree
  const buildTree = (parentId: string | null): TreeNodeData[] => {
    return (childrenMap.get(parentId) || []).map((collection) => ({
      value: collection.id,
      label: collection.name,
      children: buildTree(collection.id),
    }));
  };

  // Start building the tree from the root nodes (parentId === null)
  return buildTree(null);
}

function renderTreeNode(payload: RenderTreeNodePayload) {
  const { node, elementProps, hasChildren, expanded, tree } = payload;
  return (
    <Group {...elementProps} className={`${styles.treeNode} ${elementProps.className}`}>
      <Group className={styles.treeNodeIcon}>
      {hasChildren && (
        <ActionIcon variant="transparent" onClick={() => tree.toggleExpanded(node.value)} className={styles.actionButtonNoTransform}>
          <IconChevronRight
            size={18}
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          />
        </ActionIcon>
      )}
      </Group>
      <div className={styles.treeNodeLabel}>{node.label}</div>
    </Group>
  );
}

interface CollectionTreeProps {
  collections: Prisma.CollectionGetPayload<{}>[];
}
export default function CollectionTree({ collections }: CollectionTreeProps) {
  const tree = useTree();
  const treeData = useMemo(() => collectionToMantineTreeData(collections), [collections]);

  return (
    <Tree
      tree={tree}
      data={treeData}
      renderNode={renderTreeNode}
      classNames={{
        root: styles.treeRoot,
        node: styles.treeNodeRoot
      }}
      expandOnClick={false}
    />
  );
}
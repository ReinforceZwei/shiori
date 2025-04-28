'use client';
import { ActionIcon, Tree, Group, TreeNodeData, RenderTreeNodePayload, useTree, UseTreeReturnType, Skeleton } from "@mantine/core";
import { IconChevronRight, IconCheck, IconEdit } from '@tabler/icons-react';
import { Prisma } from "@/generated/prisma";
import { MouseEventHandler, useEffect, useMemo } from "react";
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

export type TreeNodeEventHandler = (collectionId: string, treeControl: UseTreeReturnType) => void;
export type TreeNodeActionRederer = (collectionId: string, treeControl: UseTreeReturnType) => React.ReactNode;
export type TreeNodeDisableHandler = (collectionId: string, treeControl: UseTreeReturnType) => boolean;
interface TreeNodeConfig {
  onClick?: TreeNodeEventHandler;
  onSelect?: TreeNodeEventHandler;
  rightSection?: TreeNodeActionRederer;
  shouldDisable?: TreeNodeDisableHandler;
  selectOnClick?: boolean;
  selectCheckmark?: boolean;
  allowDeselect?: boolean;
}
function renderTreeNode(payload: RenderTreeNodePayload, config: TreeNodeConfig) {
  const {
    onClick,
    onSelect,
    rightSection,
    shouldDisable = () => false,
    selectOnClick = true,
    selectCheckmark = false,
    allowDeselect = true
  } = config;
  const { node, elementProps, hasChildren, expanded, tree, selected } = payload;
  const disabled = shouldDisable(node.value, tree);
  const toggleExpand: MouseEventHandler = (e) => {
    // prevent node selection when clicking on the expand icon
    e.stopPropagation();
    tree.toggleExpanded(node.value);
  }
  const toggleSelect: MouseEventHandler = (e) => {
    if (selectOnClick) {
      if (disabled) return;
      if (selected && allowDeselect) {
        tree.deselect(node.value);
      } else {
        if (!selected) {
          tree.select(node.value);
          onSelect?.(node.value, tree);
        }
      }
    }
    onClick?.(node.value, tree);
  }
  return (
    <Group
      {...elementProps}
      className={`${styles.treeNode} ${elementProps.className}`}
      onClick={toggleSelect}
      justify="space-between"
      data-disabled={disabled}
    >
      <Group>
        <Group className={styles.treeNodeIcon}>
        {hasChildren && (
          <ActionIcon variant="transparent" onClick={toggleExpand} className={styles.actionButtonNoTransform}>
            <IconChevronRight
              size={18}
              style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
            />
          </ActionIcon>
        )}
        </Group>
        <div className={styles.treeNodeLabel}>{node.label}</div>
      </Group>
      <Group pr={8}>
        <div onClick={(e) => e.stopPropagation()}>
          {rightSection && rightSection(node.value, tree)}
        </div>
        {selected && selectCheckmark && <IconCheck size={20} color="green" />}
      </Group>
    </Group>
  );
}

export interface CollectionTreeProps {
  collections: Prisma.CollectionGetPayload<{}>[];
  initialSelected?: string[];
  treeRef?: React.RefObject<UseTreeReturnType | undefined | null>;
  nodeConfig?: TreeNodeConfig;
}
export default function CollectionTree(props: CollectionTreeProps) {
  const { collections, treeRef, nodeConfig, initialSelected } = props;
  const tree = useTree({
    initialSelectedState: initialSelected || [],
  });
  const treeData = useMemo(() => collectionToMantineTreeData(collections), [collections]);

  useEffect(() => {
    if (treeRef) {
      treeRef.current = tree;
    }
  }, [tree, treeRef]);

  if (!collections || collections.length === 0) {
    return null;
  }
  return (
    <Tree
      tree={tree}
      data={treeData}
      renderNode={(payload) => renderTreeNode(payload, nodeConfig || {})}
      classNames={{
        root: styles.treeRoot,
        node: styles.treeNodeRoot
      }}
      expandOnClick={false}
    />
  );
}

export function Loading() {
  return (
    <div className={styles.treeRoot}>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className={styles.loading}>
          <Skeleton height={20} width="60%" className={styles.loadingLabel} />
        </div>
      ))}
    </div>
  );
}
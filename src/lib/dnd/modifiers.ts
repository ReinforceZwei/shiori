import { Modifier } from '@dnd-kit/core';

/**
 * Restricts dragging to vertical movement only
 */
export const restrictToVertical: Modifier = ({ transform }) => {
  return {
    ...transform,
    x: 0,
  };
};

/**
 * Restricts dragging to horizontal movement only
 */
export const restrictToHorizontal: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: 0,
  };
};


import {
  rectIntersection,
  closestCorners,
  CollisionDetection,
} from '@dnd-kit/core';

/**
 * Custom collision detection algorithm
 */
export const customCollisionDetection: CollisionDetection = (args) => {
  const rects = rectIntersection(args);
  if (rects.length > 0) {
    return rects;
  }
  return closestCorners(args);
};


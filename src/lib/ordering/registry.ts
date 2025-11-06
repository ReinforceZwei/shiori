import type { OrderingStrategy } from './base';
import type { LayoutType } from './types';
import { LauncherOrderingStrategy } from './strategies/launcher';
import { ListOrderingStrategy } from './strategies/list';

const strategies = new Map<LayoutType, OrderingStrategy>();

// Register all strategies
strategies.set('launcher', new LauncherOrderingStrategy());
strategies.set('list', new ListOrderingStrategy());
strategies.set('grid', new ListOrderingStrategy()); // Grid uses same validation as list

/**
 * Get ordering strategy for a specific layout type
 * @throws Error if layout type is not registered
 */
export function getOrderingStrategy(layoutType: LayoutType): OrderingStrategy {
  const strategy = strategies.get(layoutType);
  if (!strategy) {
    throw new Error(`Unknown layout type: ${layoutType}`);
  }
  return strategy;
}

/**
 * Register a custom ordering strategy
 * Useful for adding new layout types or overriding existing ones
 */
export function registerOrderingStrategy(
  layoutType: LayoutType,
  strategy: OrderingStrategy
): void {
  strategies.set(layoutType, strategy);
}

/**
 * Check if a layout type has a registered strategy
 */
export function hasOrderingStrategy(layoutType: LayoutType): boolean {
  return strategies.has(layoutType);
}

/**
 * Get all registered layout types
 */
export function getRegisteredLayoutTypes(): LayoutType[] {
  return Array.from(strategies.keys());
}


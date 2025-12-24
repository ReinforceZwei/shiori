import { z } from "zod";

export const launcherLayoutConfigSchema = z.object({
  density: z.enum(["compact", "comfortable"]).default("comfortable"),
  collectionOpacity: z.number().min(0).max(1).default(0.5),
  collectionBlur: z.number().min(0).max(30).default(10),
  /** Whether to show the empty uncollected section */
  showEmptyUncollected: z.boolean().default(true),
});

export const DEFAULT_LAUNCHER_LAYOUT_CONFIG = launcherLayoutConfigSchema.parse({
  density: "comfortable",
  collectionOpacity: 0.5,
  collectionBlur: 10,
  showEmptyUncollected: true,
});

export const gridLayoutConfigSchema = z.object({
  // Placeholder for future grid options
});

export const DEFAULT_GRID_LAYOUT_CONFIG = gridLayoutConfigSchema.parse({});

export const listLayoutConfigSchema = z.object({
  // Placeholder for future list options
});

export const DEFAULT_LIST_LAYOUT_CONFIG = listLayoutConfigSchema.parse({});

// Unified schema containing all layout configs
// DB structure: { launcher: {...}, grid: {...}, list: {...} }
export const layoutConfigSchema = z.object({
  launcher: launcherLayoutConfigSchema,
  grid: gridLayoutConfigSchema,
  list: listLayoutConfigSchema,
});

export const DEFAULT_LAYOUT_CONFIG = layoutConfigSchema.parse({
  launcher: DEFAULT_LAUNCHER_LAYOUT_CONFIG,
  grid: DEFAULT_GRID_LAYOUT_CONFIG,
  list: DEFAULT_LIST_LAYOUT_CONFIG,
});

export type LauncherLayoutConfig = z.infer<typeof launcherLayoutConfigSchema>;
export type GridLayoutConfig = z.infer<typeof gridLayoutConfigSchema>;
export type ListLayoutConfig = z.infer<typeof listLayoutConfigSchema>;
export type LayoutConfig = z.infer<typeof layoutConfigSchema>;
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { validateTopLevelOrder } from "@/lib/ordering";
import type { LayoutType } from "@/lib/ordering";

export async function getSettings({ userId }: { userId: string }) {
  const settings = await prisma.settings.findUnique({
    where: { userId },
    include: {
      pinnedCollection: true,
    },
  });
  return settings;
}

/**
 * Upsert settings - creates if not exists, updates if exists
 * This is the recommended way to interact with settings
 * Validates ordering data and performs all operations in a transaction
 */
const upsertSettingsInputSchema = z.object({
  userId: z.string(),
  layoutMode: z.enum(["launcher", "grid", "list"]).optional(),
  topLevelOrdering: z.any().optional(), // JSON - validated in transaction
  launcherTopLevelOrdering: z.any().optional(), // JSON - validated in transaction
  pinnedCollectionId: z.string().nullable().optional(),
});

export async function upsertSettings(data: z.infer<typeof upsertSettingsInputSchema>) {
  const validatedData = upsertSettingsInputSchema.parse(data);
  
  // Perform validation and upsert in a transaction for consistency
  const settings = await prisma.$transaction(async (tx) => {
    // Build the data object for create/update
    const settingsData: {
      layoutMode?: typeof validatedData.layoutMode;
      topLevelOrdering?: any;
      launcherTopLevelOrdering?: any;
      pinnedCollectionId?: string | null;
    } = {};

    if (validatedData.layoutMode !== undefined) {
      settingsData.layoutMode = validatedData.layoutMode;
    }

    // Validate topLevelOrdering if provided (for grid/list modes)
    if (validatedData.topLevelOrdering !== undefined) {
      const layoutType: LayoutType = validatedData.layoutMode === 'launcher' ? 'grid' : (validatedData.layoutMode || 'grid');
      const validation = await validateTopLevelOrder(
        tx,
        layoutType,
        validatedData.topLevelOrdering,
        { userId: validatedData.userId },
        { strict: false }
      );

      if (!validation.valid) {
        throw new ValidationError(`Invalid topLevelOrdering: ${validation.errors.join(', ')}`);
      }

      // Use normalized data
      settingsData.topLevelOrdering = validation.normalized;
    }

    // Validate launcherTopLevelOrdering if provided (for launcher mode)
    if (validatedData.launcherTopLevelOrdering !== undefined) {
      const validation = await validateTopLevelOrder(
        tx,
        'launcher',
        validatedData.launcherTopLevelOrdering,
        { userId: validatedData.userId },
        { strict: false }
      );

      if (!validation.valid) {
        throw new ValidationError(`Invalid launcherTopLevelOrdering: ${validation.errors.join(', ')}`);
      }

      // Use normalized data
      settingsData.launcherTopLevelOrdering = validation.normalized;
    }

    // Validate pinned collection if provided
    if (validatedData.pinnedCollectionId !== undefined) {
      if (validatedData.pinnedCollectionId !== null) {
        const collection = await tx.collection.findUnique({
          where: { id: validatedData.pinnedCollectionId, userId: validatedData.userId },
        });
        if (!collection) {
          throw new NotFoundError(`Collection(id: ${validatedData.pinnedCollectionId}) not found`);
        }
      }
      settingsData.pinnedCollectionId = validatedData.pinnedCollectionId;
    }

    // Upsert settings
    return await tx.settings.upsert({
      where: { userId: validatedData.userId },
      create: {
        userId: validatedData.userId,
        ...settingsData,
      },
      update: settingsData,
      include: {
        pinnedCollection: true,
      },
    });
  });
  
  return settings;
}


import { z } from "zod";
import { NotFoundError } from "@/lib/errors";
import { ServiceBase } from "@/lib/service-base.class";

const upsertSettingsInputSchema = z.object({
  userId: z.string(),
  layoutMode: z.enum(["launcher", "grid", "list"]).optional(),
  pinnedCollectionId: z.string().nullable().optional(),
});

/**
 * Service class for managing user settings
 * Extends ServiceBase to provide transaction support
 */
export class SettingsService extends ServiceBase {
  /**
   * Get user settings
   * @param params - userId
   */
  async get({ userId }: { userId: string }) {
    const settings = await this.prisma.settings.findUnique({
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
   * Note: Ordering is now managed through the Order table, not Settings
   * @param data - Settings data to upsert
   */
  async upsert(data: z.infer<typeof upsertSettingsInputSchema>) {
    const validatedData = upsertSettingsInputSchema.parse(data);
    
    // Perform validation and upsert in a transaction for consistency
    const settings = await this.withTransaction(async (tx) => {
      // Build the data object for create/update
      const settingsData: {
        layoutMode?: typeof validatedData.layoutMode;
        pinnedCollectionId?: string | null;
      } = {};

      if (validatedData.layoutMode !== undefined) {
        settingsData.layoutMode = validatedData.layoutMode;
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
}


import { z } from "zod";
import { locales } from "@/i18n/locale";
import { NotFoundError } from "@/lib/errors";
import { ServiceBase } from "@/lib/service-base.class";
import { CollectionService } from "@/features/collection/service";
import { layoutConfigSchema, DEFAULT_LAYOUT_CONFIG } from "./layout-config";

const upsertSettingsInputSchema = z.object({
  userId: z.string(),
  locale: z.enum(locales).optional(),
  layoutMode: z.enum(["launcher", "grid", "list"]).optional(),
  layoutConfig: layoutConfigSchema.optional(),
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
   * @returns Settings with validated layoutConfig
   */
  async get({ userId }: { userId: string }) {
    const settings = await this.prisma.settings.findUnique({
      where: { userId },
      include: {
        pinnedCollection: true,
      },
    });
    
    if (!settings) {
      return settings;
    }
    
    // Validate layoutConfig
    if (settings.layoutConfig) {
      try {
        const validatedConfig = layoutConfigSchema.parse(settings.layoutConfig);
        return {
          ...settings,
          layoutConfig: validatedConfig,
        };
      } catch (error) {
        console.error("Failed to validate layout config, resetting to defaults:", error);
        
        // Reset to default and save
        await this.prisma.settings.update({
          where: { userId },
          data: {
            layoutConfig: DEFAULT_LAYOUT_CONFIG,
          },
        });
        
        return {
          ...settings,
          layoutConfig: DEFAULT_LAYOUT_CONFIG,
        };
      }
    }
    
    return settings;
  }

  /**
   * Get only the user's locale setting
   * @param params - userId
   */
  async getLocale({ userId }: { userId: string }) {
    const settings = await this.prisma.settings.findUnique({
      where: { userId },
      select: { locale: true },
    });
    return settings?.locale || null;
  }

  /**
   * Upsert settings - creates if not exists, updates if exists
   * @param data - Settings data to upsert
   */
  async upsert(data: z.infer<typeof upsertSettingsInputSchema>) {
    const validatedData = upsertSettingsInputSchema.parse(data);
    
    // Perform validation and upsert in a transaction for consistency
    const settings = await this.withTransaction(async (tx) => {
      const collectionService = new CollectionService(tx);

      // Build the data object for create/update
      const settingsData: {
        layoutMode?: typeof validatedData.layoutMode;
        layoutConfig?: z.infer<typeof layoutConfigSchema>;
        pinnedCollectionId?: string | null;
        locale?: (typeof locales)[number];
      } = {};

      if (validatedData.layoutMode !== undefined) {
        settingsData.layoutMode = validatedData.layoutMode;
      }

      if (validatedData.layoutConfig !== undefined) {
        settingsData.layoutConfig = validatedData.layoutConfig;
      }

      // Validate pinned collection if provided
      if (validatedData.pinnedCollectionId !== undefined) {
        if (validatedData.pinnedCollectionId !== null) {
          const collection = await collectionService.get({
            id: validatedData.pinnedCollectionId,
            userId: validatedData.userId,
          });
          if (!collection) {
            throw new NotFoundError(`Collection(id: ${validatedData.pinnedCollectionId}) not found`);
          }
        }
        settingsData.pinnedCollectionId = validatedData.pinnedCollectionId;
      }

      if (validatedData.locale !== undefined) {
        settingsData.locale = validatedData.locale;
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


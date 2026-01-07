import { z } from "zod";

export const uiConfigSchema = z.object({
  colorScheme: z.enum(["light", "dark", "auto"]).default("auto"),
});

export const DEFAULT_UI_CONFIG = uiConfigSchema.parse({
  colorScheme: "auto",
});

export type UIConfig = z.infer<typeof uiConfigSchema>;
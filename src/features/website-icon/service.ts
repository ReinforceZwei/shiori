import { ServiceBase } from "@/lib/service-base.class";

/**
 * Service class for managing website icons
 * Extends ServiceBase to provide transaction support
 */
export class WebsiteIconService extends ServiceBase {
  /**
   * Get a website icon by its ID
   * @param params - icon id
   */
  async get({ id }: { id: string }) {
    const icon = await this.prisma.websiteIcon.findUnique({
      where: { id },
    });
    return icon;
  }
}


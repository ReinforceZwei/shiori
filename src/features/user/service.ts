import { ServiceBase } from "@/lib/service-base.class";

export class UserService extends ServiceBase {
  async getUser(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }
}
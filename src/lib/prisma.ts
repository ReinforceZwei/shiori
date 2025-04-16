import { PrismaClient, Prisma } from "@/generated/prisma";

export const prisma = new PrismaClient();
export { Prisma } // Export Prisma types if needed
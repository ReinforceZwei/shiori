import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/generated/prisma/client";
import { headers } from "next/headers";

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: { enabled: true },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    }
  }
});

export type ServerSession = Awaited<ReturnType<typeof auth.api.getSession>>; // type for session object

export async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    return session.user;
  }
  return null;
}
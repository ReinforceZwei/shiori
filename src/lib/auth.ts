import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { UnauthorizedError } from "./errors";
import { config } from "@/lib/config";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: { 
    enabled: true,
    disableSignUp: config.auth.disableSignup,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
    expiresIn: 60 * 60 * 24 * 14, // 14 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
  },
  user: {
    deleteUser: {
      enabled: true,
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

/**
 * Get the current user or throw an UnauthorizedError if not authenticated.
 * Use this in authenticated contexts where a user must exist.
 */
export async function requireUser() {
  const user = await getUser();
  if (!user) {
    throw new UnauthorizedError("Authentication required");
  }
  return user;
}
import { PrismaClient, Prisma } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { config } from "@/lib/config";

const { Pool } = pg;

// Create a connection pool
const pool = new Pool({
  connectionString: config.database.url,
});

// Create the adapter
const adapter = new PrismaPg(pool);

// Create Prisma client with adapter
export const prisma = new PrismaClient({ adapter });
export { Prisma }; // Export Prisma types if needed
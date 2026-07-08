import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// One Pool shared across the process — pg.Pool manages the connection
// lifecycle and ensures writes are properly committed.
// (Passing a plain { connectionString } object instead of a Pool instance
// was bug #1: Prisma 7's PrismaPg adapter requires an actual pg.Pool.)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set — copy .env.example to .env and fill it in."
    );
  }

  // Reuse the Pool across HMR reloads in dev so we don't exhaust connections.
  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

  if (!globalForPrisma.pgPool) {
    globalForPrisma.pgPool = pool;
  }

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Cache in dev to survive HMR; safe to assign in prod too since the
// module is loaded once per worker process.
globalForPrisma.prisma = prisma;

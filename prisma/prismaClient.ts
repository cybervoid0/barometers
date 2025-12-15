import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Higher-order function to automatically manage PrismaClient connections.
 *
 * @template T - The return type of the wrapped function.
 * @template Args - A tuple representing the arguments passed to the wrapped function (excluding `prisma`).
 *
 * This utility wraps a function that requires a PrismaClient instance and ensures that
 * the Prisma connection is properly closed (`prisma.$disconnect()`) after the function is executed,
 * regardless of whether it succeeds or throws an error.
 *
 * Usage:
 * ```
 * export const getCategories = withPrisma(async (prisma) => {
 *   return prisma.category.findMany();
 * });
 * ```
 */
export function withPrisma<T, Args extends unknown[]>(
  fn: (prisma: PrismaClient, ...args: Args) => Promise<T>,
) {
  return async (...args: Args): Promise<T> => {
    return fn(prisma, ...args)
  }
}

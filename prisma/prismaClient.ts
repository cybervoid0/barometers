import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : [],
  })
  globalForPrisma.prisma = prisma
  return prisma
}

/**
 * Type definition for an asynchronous function that uses a PrismaClient instance.
 *
 * @template T - The return type of the asynchronous function.
 * @template Args - A tuple representing the arguments passed to the function (excluding `prisma`).
 *
 * This type is used to define functions that need access to a PrismaClient instance and
 * additional arguments.
 */
type AsyncFunction<T, Args extends unknown[]> = (prisma: PrismaClient, ...args: Args) => Promise<T>

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
export function withPrisma<T, Args extends unknown[]>(fn: AsyncFunction<T, Args>) {
  return async function wrappedWithParams(...args: Args): Promise<T> {
    const prisma = getPrismaClient()
    try {
      return await fn(prisma, ...args)
    } finally {
      // Only disconnect in development to avoid connection issues during build
      if (process.env.NODE_ENV === 'development') {
        await prisma.$disconnect()
      }
    }
  }
}

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : [],
  })

// В development режиме сохраняем в глобальной переменной для hot reload
if (process.env.NODE_ENV === 'development') {
  globalForPrisma.prisma = prisma
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
type AsyncFunction<T, Args extends any[]> = {
  (prisma: PrismaClient, ...args: Args): Promise<T>
}

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
export function withPrisma<T, Args extends any[]>(fn: AsyncFunction<T, Args>) {
  return async function wrappedWithParams(...args: Args): Promise<T> {
    return fn(prisma, ...args)
  }
}

import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import { WebSocket } from 'undici'

neonConfig.webSocketConstructor = WebSocket

export function getPrismaClient(): PrismaClient {
  const connectionString = `${process.env.DATABASE_URL}`
  const pool = new Pool({ connectionString })
  const adapter = new PrismaNeon(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['info', 'warn', 'error'] : [],
  })
}

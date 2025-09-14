'use server'

import Redis from 'ioredis'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { FrontRoutes } from '@/constants'
import { withPrisma } from '@/prisma/prismaClient'
import { trimTrailingSlash } from '@/utils'

// inaccuracy report TTL, minutes
const REPORT_COOL_DOWN = 10
const REPORT_MAX_ATTEMPTS = 3

const redis = new Redis(process.env.REDIS_URL ?? '')

interface Props {
  reporterEmail: string
  reporterName: string
  description: string
  barometerId: string
}

export const createReport = withPrisma(
  async (prisma, { reporterEmail, reporterName, barometerId, description }: Props) => {
    const headersList = await headers()
    // getting sender IP address
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('remote-addr') || null
    if (!ip) throw new Error('Could not determine IP address')

    if (!reporterEmail || !reporterName || !description || !barometerId)
      throw new Error('Report params are not complete')
    const redisKey = `rate-limit:${ip}:${barometerId}`
    const attempts = await redis.incr(redisKey)
    if (attempts <= REPORT_MAX_ATTEMPTS) {
      await redis.expire(redisKey, REPORT_COOL_DOWN * 60)
    } else {
      const ttl = await redis.ttl(redisKey) // TTL in seconds
      const minutesLeft = Math.ceil(ttl / 60)
      throw new Error(`Too many requests. Please try again after ${minutesLeft} minute(s).`)
    }
    const { id } = await prisma.inaccuracyReport.create({
      data: {
        barometerId,
        reporterName,
        reporterEmail,
        description,
      },
    })
    revalidatePath(trimTrailingSlash(FrontRoutes.Reports))
    return { id }
  },
)

'use server'

import Redis from 'ioredis'
import { updateTag } from 'next/cache'
import { headers } from 'next/headers'
import { z } from 'zod'
import { Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'

// inaccuracy report TTL, minutes
const REPORT_COOL_DOWN = 10
const REPORT_MAX_ATTEMPTS = 3

const redis = new Redis(process.env.REDIS_URL ?? '')

const CreateReportSchema = z.object({
  reporterEmail: z.string().email().max(320),
  reporterName: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  barometerId: z.string().min(1),
})

export async function createReport(rawData: unknown) {
  const { reporterEmail, reporterName, barometerId, description } =
    CreateReportSchema.parse(rawData)
  const headersList = await headers()
  // getting sender IP address
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('remote-addr') || null
  if (!ip) throw new Error('Could not determine IP address')
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
  updateTag(Tag.reports)
  return { id }
}

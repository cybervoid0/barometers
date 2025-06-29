import Redis from 'ioredis'
import { NextRequest, NextResponse } from 'next/server'
import { InaccuracyReport } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { getInaccuracyReportList } from './getters'
import { DEFAULT_PAGE_SIZE } from '../parameters'
import { cleanObject, trimTrailingSlash } from '@/utils/misc'
import { createReport } from './setters'
import { FrontRoutes } from '@/utils/routes-front'

// inaccuracy report TTL, minutes
const REPORT_COOL_DOWN = 10
const REPORT_MAX_ATTEMPTS = 3

const redis = new Redis(process.env.REDIS_URL!)

/**
 * Fetches a paginated list of inaccuracy reports for barometers.
 * Returns 200 if reports are found, 404 if not, and 500 on error.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const size = Math.max(
      Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE,
      1,
    )
    const page = Math.max(Number(searchParams.get('page')) || 1, 1)
    const dbResponse = await getInaccuracyReportList(page, size)
    return NextResponse.json(dbResponse, {
      status: dbResponse.reports.length > 0 ? 200 : 404,
    })
  } catch (error) {
    console.error('Error fetching inaccuracy report list:', error)
    const message =
      error instanceof Error
        ? error.message
        : 'Could not get inaccuracy report list'
    return NextResponse.json({ message }, { status: 500 })
  }
}

/**
 * Route for creating a new inaccuracy report for a barometer
 * - Allows up to three reports to be submitted for a single key.
 * - The key is generated using a combination of the user's IP address and the barometer ID (barometerId).
 * - After exceeding the request limit, returns a 429 (Too Many Requests) error.
 */
export async function POST(req: NextRequest) {
  try {
    // getting sender IP address
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('remote-addr') ||
      null
    if (!ip) {
      return NextResponse.json(
        { message: 'Could not determine IP address' },
        { status: 400 },
      )
    }
    const body: Partial<InaccuracyReport> = await req.json()
    const { reporterEmail, reporterName, description, barometerId } =
      cleanObject(body)
    if (!reporterEmail || !reporterName || !description || !barometerId)
      throw new Error('Report params are not complete')
    const redisKey = `rate-limit:${ip}:${barometerId}`
    const attempts = await redis.incr(redisKey)
    if (attempts <= REPORT_MAX_ATTEMPTS) {
      await redis.expire(redisKey, REPORT_COOL_DOWN * 60)
    } else {
      const ttl = await redis.ttl(redisKey) // TTL in seconds
      const minutesLeft = Math.ceil(ttl / 60)
      return NextResponse.json(
        {
          message: `Too many requests. Please try again after ${minutesLeft} minute(s).`,
        },
        { status: 429 },
      )
    }
    const { id } = await createReport(
      barometerId,
      reporterEmail,
      reporterName,
      description,
    )
    revalidatePath(trimTrailingSlash(FrontRoutes.Reports))
    return NextResponse.json(
      { message: 'Inaccuracy report created', id },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error sending inaccuracy report:', error)
    const message =
      error instanceof Error
        ? error.message
        : 'Could not send inaccuracy report'
    return NextResponse.json({ message }, { status: 500 })
  }
}

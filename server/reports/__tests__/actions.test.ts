/**
 * @jest-environment node
 */
jest.mock('ioredis', () => {
  const instance = { incr: jest.fn(), expire: jest.fn(), ttl: jest.fn() }
  return jest.fn(() => instance)
})
jest.mock('@/prisma/prismaClient', () => require('../../testing/mocks').prismaMockModule)
jest.mock('next/cache', () => require('../../testing/mocks').cacheMockModule)
jest.mock('next/headers', () => require('../../testing/mocks').headersMockModule)

import Redis from 'ioredis'
import { createReport } from '@/server/reports/actions'
import { mockHeadersMap, mockPrisma, mockUpdateTag, resetAllMocks } from '../../testing/mocks'

// Get the shared mock instance created by the factory
const mockRedis = new (Redis as unknown as new () => Record<string, jest.Mock>)()

beforeEach(() => {
  resetAllMocks()
  mockHeadersMap.set('x-forwarded-for', '1.2.3.4')
  mockRedis.incr.mockResolvedValue(1)
  mockRedis.expire.mockResolvedValue(1)
  mockRedis.ttl.mockResolvedValue(600)
})

const validReport = {
  reporterEmail: 'user@example.com',
  reporterName: 'John',
  description: 'Incorrect date',
  barometerId: 'b-1',
}

describe('createReport', () => {
  it('rejects invalid input (bad email)', async () => {
    await expect(createReport({ ...validReport, reporterEmail: 'not-email' })).rejects.toThrow()
  })

  it('rejects when description too long', async () => {
    await expect(createReport({ ...validReport, description: 'x'.repeat(5001) })).rejects.toThrow()
  })

  it('throws when IP cannot be determined', async () => {
    mockHeadersMap.clear()
    await expect(createReport(validReport)).rejects.toThrow('Could not determine IP address')
  })

  it('creates report within rate limit', async () => {
    mockPrisma.inaccuracyReport.create.mockResolvedValue({ id: 'r-1' })
    const result = await createReport(validReport)
    expect(result).toEqual({ id: 'r-1' })
    expect(mockPrisma.inaccuracyReport.create).toHaveBeenCalledWith({
      data: {
        barometerId: 'b-1',
        reporterName: 'John',
        reporterEmail: 'user@example.com',
        description: 'Incorrect date',
      },
    })
  })

  it('sets redis TTL on first attempt', async () => {
    mockPrisma.inaccuracyReport.create.mockResolvedValue({ id: 'r-1' })
    await createReport(validReport)
    expect(mockRedis.expire).toHaveBeenCalledWith(expect.stringContaining('rate-limit:'), 600)
  })

  it('throws when rate limit exceeded', async () => {
    mockRedis.incr.mockResolvedValue(4)
    mockRedis.ttl.mockResolvedValue(300)
    await expect(createReport(validReport)).rejects.toThrow(/Too many requests/)
  })

  it('calls updateTag(Tag.reports)', async () => {
    mockPrisma.inaccuracyReport.create.mockResolvedValue({ id: 'r-1' })
    await createReport(validReport)
    expect(mockUpdateTag).toHaveBeenCalledWith('reports')
  })
})

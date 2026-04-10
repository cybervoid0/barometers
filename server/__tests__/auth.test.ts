/**
 * @jest-environment node
 */
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/services/auth', () => ({ authConfig: { providers: [] } }))

import { getServerSession } from 'next-auth'
import { getSession, requireAdmin, requireAuth } from '@/server/auth'

const mockGetServerSession = getServerSession as jest.Mock

beforeEach(() => jest.clearAllMocks())

describe('getSession', () => {
  it('returns session when authenticated', async () => {
    const session = { user: { name: 'Admin', role: 'ADMIN' } }
    mockGetServerSession.mockResolvedValue(session)
    await expect(getSession()).resolves.toEqual(session)
  })

  it('returns null when unauthenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)
    await expect(getSession()).resolves.toBeNull()
  })
})

describe('requireAdmin', () => {
  it('returns session for ADMIN role', async () => {
    const session = { user: { name: 'Admin', role: 'ADMIN' } }
    mockGetServerSession.mockResolvedValue(session)
    await expect(requireAdmin()).resolves.toEqual(session)
  })

  it('throws for USER role', async () => {
    mockGetServerSession.mockResolvedValue({ user: { name: 'User', role: 'USER' } })
    await expect(requireAdmin()).rejects.toThrow('Unauthorized: admin access required')
  })

  it('throws for no session', async () => {
    mockGetServerSession.mockResolvedValue(null)
    await expect(requireAdmin()).rejects.toThrow('Unauthorized: admin access required')
  })
})

describe('requireAuth', () => {
  it('returns session for authenticated user', async () => {
    const session = { user: { name: 'User', role: 'USER' } }
    mockGetServerSession.mockResolvedValue(session)
    await expect(requireAuth()).resolves.toEqual(session)
  })

  it('throws for no session', async () => {
    mockGetServerSession.mockResolvedValue(null)
    await expect(requireAuth()).rejects.toThrow('Unauthorized: authentication required')
  })
})

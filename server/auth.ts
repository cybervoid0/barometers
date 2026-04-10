'use server'

import { getServerSession } from 'next-auth'
import { authConfig } from '@/services/auth'

export async function getSession() {
  return getServerSession(authConfig)
}

export async function requireAdmin() {
  const session = await getServerSession(authConfig)
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: admin access required')
  }
  return session
}

export async function requireAuth() {
  const session = await getServerSession(authConfig)
  if (!session) {
    throw new Error('Unauthorized: authentication required')
  }
  return session
}

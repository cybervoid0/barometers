'use client'

import type { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import type { PropsWithChildren } from 'react'
import { isAdminRole } from '@/utils/roles'

export function isAdmin(session: Session | null): boolean {
  // Shared predicate so OWNER (not just ADMIN) sees admin nav, matching the
  // server-side guards. See utils/roles.ts.
  return isAdminRole(session?.user?.role)
}

export function IsAdmin({ children }: PropsWithChildren) {
  const { data, status } = useSession()
  if (status === 'loading') return null
  return isAdmin(data) ? children : null
}

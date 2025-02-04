'use client'

import { type PropsWithChildren } from 'react'
import { useSession } from 'next-auth/react'
import { AccessRole } from '@prisma/client'
import { Session } from 'next-auth'

export function isAdmin(session: Session | null): boolean {
  const user = session?.user
  return user?.role === AccessRole.ADMIN
}

export function IsAdmin({ children }: PropsWithChildren) {
  const { data, status } = useSession()
  if (status === 'loading') return null
  return isAdmin(data) ? <>{children}</> : null
}

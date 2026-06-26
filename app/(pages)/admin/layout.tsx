import { redirect } from 'next/navigation'
import type { FC, PropsWithChildren } from 'react'
import { getSession } from '@/server/auth'
import { isAdminRole } from '@/utils/roles'
import { LogoutButton } from './logout-button'

const Layout: FC<PropsWithChildren> = async ({ children }) => {
  const session = await getSession()

  if (!session || !isAdminRole(session.user.role)) {
    redirect('/signin')
  }

  return (
    <>
      <div className="mt-6">
        <div className="flex items-center justify-start gap-4">
          <h2 className="text-2xl font-semibold">Welcome, {session.user.name ?? 'Admin'}</h2>
          <LogoutButton />
        </div>
      </div>
      {children}
    </>
  )
}

export default Layout

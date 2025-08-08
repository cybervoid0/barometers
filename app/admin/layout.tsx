'use client'

import { FC, PropsWithChildren } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const { data } = useSession()

  const handleLogOut = () => {
    signOut({
      callbackUrl: '/signin',
    })
  }

  return (
    <>
      <div className="mt-6">
        <div className="flex items-center justify-start gap-4">
          <h2 className="text-2xl font-semibold">Welcome, {data?.user?.name ?? 'Admin'}</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleLogOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Log out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      {children}
    </>
  )
}

export default Layout

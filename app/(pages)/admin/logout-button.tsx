'use client'

import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui'

export function LogoutButton() {
  const handleLogOut = () => {
    signOut({ callbackUrl: '/signin' })
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button aria-label="Log out" variant="ghost" size="icon" onClick={handleLogOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Log out</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

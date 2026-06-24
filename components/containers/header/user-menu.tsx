'use client'

import { LogOut, Package, User } from 'lucide-react'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui'
import { Route } from '@/constants'
import { cn } from '@/utils'

/**
 * Account control for the header. Shows a sign-in link when logged out, and a
 * dropdown (email · My Orders · Sign out) when logged in.
 */
export function UserMenu({ className }: { className?: string }) {
  const { data: session, status } = useSession()

  if (status === 'loading') return null

  if (!session?.user) {
    return (
      <Link href={Route.Signin} aria-label="Sign in" className={className}>
        <User size={18} />
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Account" className={cn('outline-none', className)}>
        <User size={18} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
          {session.user.email ?? session.user.name}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={Route.Orders} className="cursor-pointer">
            <Package className="mr-2 h-4 w-4" />
            My Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onSelect={() => signOut({ callbackUrl: '/' })}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

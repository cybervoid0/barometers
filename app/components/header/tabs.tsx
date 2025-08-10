'use client'

import { HTMLAttributes, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { AccessRole } from '@prisma/client'
import { Search } from 'lucide-react'
import { isAdmin } from '../is-admin'
import { MenuItem } from '@/app/types'
import { cn } from '@/lib/utils'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'

interface Props extends HTMLAttributes<HTMLDivElement> {
  menu: MenuItem[]
}
const menuItemStyle =
  'px-3 py-2 transition duration-300 hover:rounded-t-sm hover:border-b hover:bg-muted'
const menuItemTextStyle = 'text-xs font-semibold tracking-[0.15rem] uppercase'
const menuStyle = cn(menuItemStyle, menuItemTextStyle)

export function WideScreenTabs({ menu: menuData = [], ...props }: Props) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const underline = useCallback(
    (url: string) => {
      const rootPath: string | undefined = `/${pathname.split('/')[1]}`
      const isActive = url === rootPath
      return { 'border-b-[0.5px] border-b-foreground': isActive }
    },
    [pathname],
  )

  return (
    <nav {...props}>
      <NavigationMenu>
        <NavigationMenuList>
          {menuData
            .filter(
              ({ visibleFor }) =>
                typeof visibleFor === 'undefined' ||
                (isAdmin(session) && visibleFor === AccessRole.ADMIN),
            )
            .map(menuItem =>
              'children' in menuItem ? (
                <NavigationMenu key={menuItem.id}>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={cn(menuStyle, underline(menuItem.link))}>
                      <p>{menuItem.label}</p>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="flex flex-col">
                        {menuItem.children?.map(nestedItem => (
                          /* Nested menu items */
                          <li
                            key={nestedItem.id}
                            className={cn(
                              'px-6 py-1 [&:last-child_p]:pb-1', // padding
                              'hover:cursor-pointer hover:bg-muted', // on hover
                            )}
                          >
                            <NavigationMenuLink asChild>
                              <Link href={nestedItem.link}>
                                <p className="capitalize">{nestedItem.label}</p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenu>
              ) : (
                <NavigationMenuItem key={menuItem.id}>
                  <NavigationMenuLink asChild>
                    <Link href={menuItem.link}>
                      <p className={cn(menuStyle, underline(menuItem.link))}>{menuItem.label}</p>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ),
            )}
          <NavigationMenuItem className={cn(menuItemStyle, underline('/search'))}>
            <NavigationMenuLink asChild className="">
              <Link href="/search">
                <Search size="18" />
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  )
}

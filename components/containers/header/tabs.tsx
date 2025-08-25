'use client'

import { AccessRole } from '@prisma/client'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { HTMLAttributes, useCallback } from 'react'
import { isAdmin } from '@/components/elements'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui'
import { MenuItem } from '@/types'
import { cn } from '@/utils'

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
                      <ul className="flex flex-col pt-1.5 pr-2 pb-2 pl-1.5">
                        {menuItem.children?.map(nestedItem => (
                          /* Nested menu items */
                          <li
                            key={nestedItem.id}
                            className={cn(
                              'rounded-sm',
                              'px-3 py-1 [&:last-child_p]:pb-1', // padding
                              'hover:bg-muted hover:cursor-pointer', // on hover
                            )}
                          >
                            <NavigationMenuLink asChild>
                              <Link href={nestedItem.link} className="no-underline">
                                <p className="w-max">{nestedItem.label}</p>
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
                    <Link href={menuItem.link} className="no-underline">
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

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { AccessRole } from '@prisma/client'
import { Spin as Hamburger } from 'hamburger-react'
import { isAdmin } from '../is-admin'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { MenuItem } from '@/app/types'
import { cn } from '@/lib/utils'
import { SocialButtons } from '../footer'

interface Props {
  menu: MenuItem[]
}

const menuItemTextStyle =
  'text-sm font-semibold tracking-[0.15rem] uppercase transition-colors hover:text-foreground/80'

export function MobileMenu({ menu = [] }: Props) {
  const { data: session } = useSession()
  const [isOpen, setOpen] = useState(false)
  const closeMenu = () => setOpen(false)
  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div className="md:hidden">
          <Hamburger toggled={isOpen} toggle={setOpen} size={24} />
        </div>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-full data-[state=open]:animate-[slide-in-from-left_500ms_ease-in-out_200ms_both] xs:w-80"
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">Barometers website navigation menu</SheetDescription>
        <div className="flex h-full flex-col justify-between">
          {/* Menu content */}
          <nav className="mt-20 space-y-6 pl-8 pr-4">
            {menu
              .filter(
                ({ visibleFor }) =>
                  typeof visibleFor === 'undefined' ||
                  (isAdmin(session) && visibleFor === AccessRole.ADMIN),
              )
              .map(item =>
                'children' in item ? (
                  <Accordion key={item.id} type="single" collapsible className="w-full">
                    <AccordionItem value={`${item.id}`}>
                      <AccordionTrigger className={cn('p-0 hover:no-underline', menuItemTextStyle)}>
                        {item.label}
                      </AccordionTrigger>
                      <AccordionContent className="p-0">
                        <ul className="ml-6 space-y-3">
                          {item.children?.map(nestedItem => (
                            <li key={nestedItem.id}>
                              <Link
                                href={nestedItem.link}
                                onClick={closeMenu}
                                className="w-full text-xs font-medium uppercase tracking-widest hover:text-foreground/80"
                              >
                                {nestedItem.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <Link
                    className={cn('block', menuItemTextStyle)}
                    key={item.id}
                    href={item.link}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                ),
              )}
          </nav>

          {/* Footer */}
          <div className="border-t px-6 py-4">
            <SocialButtons className="mx-auto" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

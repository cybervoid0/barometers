import 'server-only'

import NextLink from 'next/link'
import { Image } from '@/components/elements'
import { getMenuData } from '@/server/menu/queries'
import { AnimatedHeader } from './animated-header'
import { MobileMenu } from './mobile-menu'
import { WideScreenTabs } from './tabs'

export async function Header() {
  const menu = await getMenuData()
  return (
    <AnimatedHeader>
      <div className="container mx-auto flex h-full flex-nowrap items-center justify-between gap-1 pr-2">
        <WideScreenTabs menu={menu} className="hidden md:block" />
        <MobileMenu menu={menu} className="md:hidden" />
        <NextLink className="no-underline" href="/">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="leading-none">Barometers Realm</h1>
              <p className="xs:text-xs text-[10px] leading-none lg:text-[0.875rem]">
                Europe's richest online collection of barometers
              </p>
            </div>
            {/* Logo image */}
            <div className="relative aspect-square h-12">
              <Image
                width={48}
                height={48}
                quality={80}
                src="/shared/compass-logo-ny-2026.png"
                alt="logo"
                className="object-contain"
              />
            </div>
          </div>
        </NextLink>
      </div>
    </AnimatedHeader>
  )
}

import 'server-only'

import NextLink from 'next/link'
import { Suspense } from 'react'
import { Image } from '@/components/elements'
import { getMenuData } from '@/server/menu/queries'
import { AnimatedHeader } from './animated-header'
import { CartButton } from './cart-button'
import { MobileMenu } from './mobile-menu'
import { WideScreenTabs } from './tabs'

export async function Header() {
  const menu = await getMenuData()
  return (
    <AnimatedHeader>
      <div className="container mx-auto flex h-full flex-nowrap items-center justify-between gap-4 pr-2">
        <Suspense fallback={<div className="hidden md:block" />}>
          <WideScreenTabs menu={menu} className="hidden md:block" />
        </Suspense>
        <div className="flex items-center gap-4 md:hidden">
          <MobileMenu menu={menu} />
          <CartButton />
        </div>
        <NextLink className="no-underline" href="/">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="leading-none">Barometers Realm</h1>
              <p className="xs:text-xs text-[10px] leading-none lg:text-[0.875rem]">
                Preserving the beauty and function of barometers
              </p>
            </div>
            {/* Logo image */}
            <div className="relative aspect-square h-12">
              <Image
                width={48}
                height={48}
                src="/shared/compass-logo.svg"
                alt="logo"
                className="object-contain"
                // SVG — no point running it through the image optimizer, and
                // the default (local) optimizer rejects SVG with a 400.
                unoptimized
              />
            </div>
          </div>
        </NextLink>
      </div>
    </AnimatedHeader>
  )
}

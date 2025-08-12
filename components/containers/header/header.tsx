import 'server-only'

import NextLink from 'next/link'
import NextImage from 'next/image'
import { customImageLoader } from '@/utils'
import { cn } from '@/utils'
import { getMenuData } from '@/constants'
import { WideScreenTabs } from './tabs'
import { MobileMenu } from './mobile-menu'
import { Subheader } from './subheader'

export async function Header() {
  const menu = await getMenuData()
  return (
    <>
      <header className="h-[4.6rem] min-h-[4.6rem] sm:h-24 sm:min-h-24">
        <div
          className={cn(
            'fixed top-0 z-50 h-[4.6rem] min-h-[4.6rem] w-full sm:h-24 sm:min-h-24',
            'from-layout-gradient-from via-layout-gradient-to to-layout-gradient-to bg-linear-to-t',
          )}
        >
          <div className="container mx-auto flex h-full flex-nowrap items-center justify-between gap-1 pr-2">
            <div className="flex items-center">
              <WideScreenTabs menu={menu} className="hidden md:block" />
              <MobileMenu menu={menu} />
            </div>
            <NextLink className="no-underline" href="/">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-[0.32rem]">
                  <h1 className="font-cinzel leading-none">Barometers Realm</h1>
                  <p className="text-xs leading-none lg:text-[0.875rem]">
                    Europe's richest visual archive of barometers
                  </p>
                </div>
                {/* Logo image */}
                <div className="relative aspect-square h-10 sm:h-12">
                  <NextImage
                    unoptimized
                    fill
                    src={customImageLoader({
                      src: '/shared/compass-logo.svg',
                      quality: 60,
                      width: 48,
                    })}
                    alt="logo"
                    className="object-contain"
                  />
                </div>
              </div>
            </NextLink>
          </div>
        </div>
      </header>
      {/* Visible only on the landing page */}
      <Subheader />
    </>
  )
}

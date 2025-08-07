import 'server-only'

import NextLink from 'next/link'
import NextImage from 'next/image'
import customImageLoader from '@/utils/image-loader'
import { cn } from '@/lib/utils'
import { getMenuData } from '@/utils/menudata'
import { WideScreenTabs } from './tabs'
import { MobileMenu } from './mobile-menu'

export async function Header() {
  const menu = await getMenuData()
  return (
    <header className="h-[4.6rem] min-h-[4.6rem] sm:h-[6rem] sm:min-h-[6rem]">
      <div
        className={cn(
          'fixed top-0 z-50 h-[4.6rem] min-h-[4.6rem] w-full sm:h-[6rem] sm:min-h-[6rem]',
          'bg-gradient-to-t from-layout-gradient-from via-layout-gradient-to to-layout-gradient-to',
        )}
      >
        <div className="container mx-auto flex h-full flex-nowrap items-center justify-between gap-1">
          <div className="flex items-center">
            <WideScreenTabs menu={menu} className="hidden md:block" />
            <MobileMenu menu={menu} />
          </div>
          <NextLink className="no-underline" href="/">
            <div className="flex items-center gap-2">
              <h1>Barometers Realm</h1>
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
  )
}

import Link from 'next/link'
import { ManageCookies } from '@/components/elements'
import { Separator } from '@/components/ui'
import { FrontRoutes } from '@/constants'
import { cn } from '@/utils'
import { SocialButtons } from './social-buttons'

export function Footer() {
  return (
    <footer
      className={cn(
        'w-full py-4',
        'from-layout-gradient-from via-layout-gradient-to to-layout-gradient-to bg-linear-to-b',
      )}
    >
      <div className="relative container mx-auto py-4 sm:py-6">
        <div className="grow text-center">
          <p className="text-xs">
            &copy; {new Date().getFullYear()}{' '}
            <span className="xs:inline-block hidden">
              The Art of Weather Instruments Foundation
            </span>
            <span className="xs:hidden">AWIF</span>. All right reserved.
          </p>

          <div className="mt-3 text-xs [&_a,button]:no-underline [&_a,button]:hover:underline">
            {/* Mobile screens links */}
            <nav className="xs:hidden mt-3 space-y-2">
              <div className="flex justify-center gap-2 items-center">
                <Link className="" href={FrontRoutes.Terms}>
                  Terms & Conditions
                </Link>
                <Separator orientation="vertical" className="h-3" />
                <Link href={FrontRoutes.PrivacyPolicy}>Privacy policy</Link>
              </div>
              <div className="flex justify-center gap-2 items-center">
                <Link href={FrontRoutes.CookiePolicy}>Cookie Policy</Link>
                <Separator orientation="vertical" className="h-3" />
                <ManageCookies />
              </div>
            </nav>
            {/* Desktop screens links */}
            <nav className="hidden xs:flex justify-center items-center gap-2">
              <Link className="no-underline" href={FrontRoutes.Terms}>
                Terms & Conditions
              </Link>
              <Separator orientation="vertical" className="h-3" />
              <Link href={FrontRoutes.PrivacyPolicy}>Privacy policy</Link>
              <Separator orientation="vertical" className="h-3" />
              <Link href={FrontRoutes.CookiePolicy}>Cookie Policy</Link>
              <Separator orientation="vertical" className="h-3" />
              <ManageCookies />
            </nav>
          </div>
        </div>

        <SocialButtons className="absolute inset-y-0 right-8 hidden sm:flex" />
      </div>
    </footer>
  )
}

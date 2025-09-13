import Link from 'next/link'
import { ManageCookies } from '@/components/elements'
import { Separator } from '@/components/ui'
import { FrontRoutes } from '@/constants'
import { cn } from '@/utils'
import { SocialButtons } from './social-buttons'

const listStyle = 'flex items-center gap-2 text-xs'

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

          <ul className="w-fit mt-4 mx-auto flex items-center gap-2 flex-wrap justify-center">
            <li className={listStyle}>
              <Link href={FrontRoutes.Terms}>Terms & Conditions</Link>
              <Separator orientation="vertical" className="h-3" />
            </li>
            <li className={listStyle}>
              <Link href={FrontRoutes.PrivacyPolicy}>Privacy policy</Link>
              <Separator orientation="vertical" className="h-3" />
            </li>
            <li className={listStyle}>
              <Link href={FrontRoutes.CookiePolicy}>Cookie Policy</Link>
              <Separator orientation="vertical" className="h-3" />
            </li>
            <li className={listStyle}>
              <ManageCookies />
            </li>
          </ul>
        </div>
        {/* Buttons */}
        <SocialButtons className="absolute inset-y-0 right-8 hidden sm:flex" />
      </div>
    </footer>
  )
}

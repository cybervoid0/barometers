import Link from 'next/link'
import { ManageCookies } from '@/components/elements'
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
          <p className="mb-2 text-xs">
            By using this website, you agree to our{' '}
            <Link href="/terms-and-conditions">Terms & Conditions</Link>
          </p>

          <p className="text-xs">
            &copy; {new Date().getFullYear()}{' '}
            <span className="xs:inline-block hidden">
              The Art of Weather Instruments Foundation
            </span>
            <span className="xs:hidden">AWIF</span>. All right reserved.
          </p>

          <ManageCookies />
        </div>
        {/* Buttons */}
        <SocialButtons className="absolute inset-y-0 right-8 hidden sm:flex" />
      </div>
    </footer>
  )
}

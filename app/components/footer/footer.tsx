import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SocialButtons } from './social-buttons'

export function Footer() {
  return (
    <footer
      className={cn(
        'w-full py-4',
        'bg-gradient-to-b from-layout-gradient-from via-layout-gradient-to to-layout-gradient-to',
      )}
    >
      <div className="container relative mx-auto py-4 sm:py-6">
        <div className="grow text-center">
          <p className="mb-2 text-xs">
            By using this website, you agree to our{' '}
            <Link href="/terms-and-conditions" className="font-semibold hover:underline">
              Terms & Conditions
            </Link>
          </p>

          <p className="text-xs">
            &copy; {new Date().getFullYear()}
            {` `} Leo Shirokov. All right reserved.
          </p>
        </div>
        {/* Buttons */}
        <SocialButtons className="absolute inset-y-0 right-8 hidden sm:flex" />
      </div>
    </footer>
  )
}

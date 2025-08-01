import Link from 'next/link'
import { IconBrandInstagram, IconMail } from '@tabler/icons-react'
import { instagram, email } from '@/utils/constants'
import { ModeToggle } from '../mode-toggle'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const buttonStyle = 'transition-colors duration-300 ease-in-out dark:text-slate-600'

export function Footer() {
  return (
    <footer className="container mx-auto py-4">
      <div className="relative py-4 sm:py-6">
        <div className="grow text-center">
          <p className="mb-2 text-xs">
            By using this website, you agree to our{' '}
            <Link href="/terms-and-conditions" className="font-semibold hover:underline">
              Terms & Conditions
            </Link>
          </p>

          <p className="text-xs">
            &copy; {new Date().getFullYear()}
            {` `} Leo Shirokov. All right reserved. Made with{' '}
            <a
              href="https://nextjs.org/"
              className="font-semibold hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next.js
            </a>
          </p>
        </div>
        {/* Buttons */}
        <div className="absolute inset-y-0 right-8 hidden w-fit items-center gap-1 sm:flex">
          <a
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
            href={instagram}
            className="group"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className={cn(buttonStyle, 'group-hover:text-red-800')}
                >
                  <IconBrandInstagram />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Instagram</TooltipContent>
            </Tooltip>
          </a>

          <a
            aria-label="Email"
            target="_blank"
            rel="noopener noreferrer"
            href={`mailto:${email}`}
            className="group"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className={cn(buttonStyle, 'group-hover:text-blue-800')}
                >
                  <IconMail />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Email</TooltipContent>
            </Tooltip>
          </a>

          <ModeToggle />
        </div>
      </div>
    </footer>
  )
}

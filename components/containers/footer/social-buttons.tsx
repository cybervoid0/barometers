import { Instagram, Mail } from 'lucide-react'
import type { HTMLAttributes } from 'react'
import { ModeToggle } from '@/components/elements'
import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { email, instagram } from '@/constants'
import { cn } from '@/utils'

const buttonStyle = 'transition-colors duration-300 ease-in-out dark:text-slate-600'

export function SocialButtons({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex w-fit items-center gap-1', className)} {...props}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            aria-label="Visit our Instagram page"
            target="_blank"
            rel="noopener noreferrer"
            href={instagram}
            className="group"
          >
            <Button
              aria-label="Visit our Instagram page"
              size="icon"
              variant="outline"
              className={cn(buttonStyle, 'group-hover:text-red-800')}
            >
              <Instagram aria-hidden="true" />
            </Button>
          </a>
        </TooltipTrigger>
        <TooltipContent>Instagram</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <a
            aria-label="Send us an email"
            target="_blank"
            rel="noopener noreferrer"
            href={`mailto:${email}`}
            className="group"
          >
            <Button
              aria-label="Send us an email"
              size="icon"
              variant="outline"
              className={cn(buttonStyle, 'group-hover:text-blue-800')}
            >
              <Mail aria-hidden="true" />
            </Button>
          </a>
        </TooltipTrigger>
        <TooltipContent>Email</TooltipContent>
      </Tooltip>

      <ModeToggle />
    </div>
  )
}

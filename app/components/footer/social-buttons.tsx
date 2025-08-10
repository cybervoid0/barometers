import { type HTMLAttributes } from 'react'
import { Instagram, Mail } from 'lucide-react'
import { instagram, email } from '@/utils/constants'
import { ModeToggle } from '../mode-toggle'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const buttonStyle = 'transition-colors duration-300 ease-in-out dark:text-slate-600'

export function SocialButtons({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex w-fit items-center gap-1', className)} {...props}>
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
              <Instagram />
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
              <Mail />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Email</TooltipContent>
        </Tooltip>
      </a>

      <ModeToggle />
    </div>
  )
}

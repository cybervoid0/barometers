import { type HTMLAttributes } from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface CategoryLetterProps extends HTMLAttributes<HTMLDivElement> {
  category: string
}

/**
 * Periodic table style square category icons
 */
export function CategoryIcon({ category, className, ...props }: CategoryLetterProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'border-button-border h-[25px] w-[25px] rounded-sm border-[1.1px]',
            'text-button-border whitespace-nowrap text-sm font-semibold capitalize',
            'flex items-center justify-center',
            className,
          )}
          {...props}
        >
          {category.slice(0, 2)}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="capitalize">{category}</p>
      </TooltipContent>
    </Tooltip>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MD } from '@/app/components/md'

interface ShowMoreProps extends React.HTMLAttributes<HTMLDivElement> {
  md?: boolean // if true, renders content as markdown
  maxHeight?: number
  showLabel?: string
  hideLabel?: string
}

export function ShowMore({
  children,
  md = false,
  maxHeight = 120,
  showLabel = 'Show more',
  hideLabel = 'Show less',
  className,
  ...props
}: ShowMoreProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const renderContent = () => {
    if (md) {
      if (typeof children === 'string') return <MD>{children}</MD>
      throw new Error('MD content requires children of type string')
    }
    return children
  }
  if (!children) return null
  const height = `${maxHeight}px`
  return (
    <div className={cn('space-y-2', className)} {...props}>
      <motion.div
        initial={{ height }}
        animate={{ height: isExpanded ? '100%' : height }}
        className="relative overflow-hidden"
      >
        {renderContent()}

        {/* Gradient overlay when collapsed - only over content */}
        {!isExpanded && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background via-background/80 to-transparent" />
        )}
      </motion.div>
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-auto p-0 font-semibold text-foreground hover:bg-transparent"
      >
        {isExpanded ? hideLabel : showLabel}
        <ChevronDown
          className={cn(
            'ml-1 h-4 w-4 transition-transform duration-200',
            isExpanded && 'rotate-180',
          )}
        />
      </Button>
    </div>
  )
}

'use client'

import { Copy, CopyCheck, CopyX } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { cn } from '@/utils'

interface CopyButtonProps extends React.ComponentProps<typeof Button> {
  /**
   * Plain text content to copy to clipboard
   */
  text: string
  successMsg?: string
  tooltipMsg?: string
  /**
   * ms
   */
  confirmationTime?: number
}
const buttonSx = 'h-5 w-5'

export function CopyButton({
  text,
  className,
  children,
  successMsg,
  confirmationTime = 3000,
  tooltipMsg = 'Copy to clipboard',
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(false)

  const copyToClipboard = useCallback(async () => {
    try {
      if (!text) {
        toast.error('No text to copy')
        return
      }
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to copy text')
      setError(true)
    } finally {
      setTimeout(() => {
        setCopied(false)
        setError(false)
      }, confirmationTime)
    }
  }, [confirmationTime, text])

  useEffect(() => {
    if (!copied) return
    toast.success(successMsg ?? 'Copied to clipboard')
  }, [copied, successMsg])

  return (
    <div className="flex items-center gap-1 text-xs">
      {children}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-fit w-fit', className)}
            onClick={copyToClipboard}
            aria-label={tooltipMsg}
            {...props}
          >
            {copied ? (
              <CopyCheck className={cn(buttonSx, 'text-green-600')} />
            ) : error ? (
              <CopyX className={cn(buttonSx, 'text-destructive-foreground')} />
            ) : (
              <Copy className={buttonSx} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltipMsg}</TooltipContent>
      </Tooltip>
    </div>
  )
}

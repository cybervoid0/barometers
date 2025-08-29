import { Info } from 'lucide-react'
import { Button } from '@/components/ui'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { ConditionListDTO } from '@/types'

interface ConditionProps {
  condition: ConditionListDTO[number]
}

export function Condition({ condition }: ConditionProps) {
  return (
    <div className="relative w-fit">
      <span className="text-sm">{condition.name}</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 -right-4 h-4 w-4 p-0 hover:bg-transparent"
          >
            <Info className="text-muted-foreground h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <p className="text-xs font-medium">{condition.description}</p>
        </PopoverContent>
      </Popover>
    </div>
  )
}

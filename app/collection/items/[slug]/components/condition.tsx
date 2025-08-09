import { Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ConditionListDTO } from '@/app/types'

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
            className="absolute -right-4 top-0 h-4 w-4 p-0 hover:bg-transparent"
          >
            <Info className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <p className="text-xs font-medium">{condition.description}</p>
        </PopoverContent>
      </Popover>
    </div>
  )
}

import { useFormContext, useFieldArray } from 'react-hook-form'
import { Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function Dimensions() {
  const { control, register } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dimensions',
  })

  const addDimension = () => {
    if (fields.length > 6) return
    append({ dim: '', value: '' })
  }

  const removeDimension = (index: number) => {
    remove(index)
  }

  return (
    <div className="space-y-4">
      <Label>Dimensions</Label>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeDimension(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete parameter</p>
              </TooltipContent>
            </Tooltip>

            <Input placeholder="Unit" {...register(`dimensions.${index}.dim`)} className="flex-1" />
            <Input
              placeholder="Value"
              {...register(`dimensions.${index}.value`)}
              className="flex-1"
            />
          </div>
        ))}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addDimension}
              disabled={fields.length > 6}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add parameter</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

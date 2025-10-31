'use client'

import { Minus, Plus } from 'lucide-react'
import type { ComponentProps } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui'
import { cn } from '@/utils'
import { useCartStore } from '../providers/CartStoreProvider'

interface Props extends ComponentProps<'div'> {
  productId: string
  stock: number
  min?: number
}

function QuantityChange({ productId, stock, className, min = 0, ...props }: Props) {
  const minQuantity = Math.max(min, 0) // guarantee that min is positive
  const { addItem, subtractItem } = useCartStore(state => state)
  const quantity = useCartStore(state => state.getProductAmount(productId))

  const handleAddItem = () => {
    const res = addItem(productId, stock)
    if (!res.success) {
      toast.error(res.error, { id: 'add-item-error' })
    }
  }
  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => subtractItem(productId)}
        disabled={quantity <= minQuantity}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-8 text-center font-medium select-none">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={handleAddItem}
        disabled={quantity >= stock}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

export { QuantityChange }

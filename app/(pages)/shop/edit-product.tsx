'use client'

import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui'
import type { ProductWithImages } from '@/types'

interface Props {
  product: ProductWithImages
}

/**
 * Edit product button - TODO: implement full editing with variants
 */
function EditProduct({ product }: Props) {
  const handleClick = () => {
    // TODO: Implement product editing with variants
    console.log('Edit product:', product.id)
  }

  return (
    <div className="absolute top-2 right-2 z-10">
      <Button variant="secondary" size="icon" onClick={handleClick} title={`Edit ${product.name}`}>
        <Pencil className="w-4 h-4" />
      </Button>
    </div>
  )
}

export { EditProduct }

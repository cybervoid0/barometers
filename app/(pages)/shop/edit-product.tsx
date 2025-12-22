'use client'

import { Pencil } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { Route } from '@/constants'
import type { ProductWithImages } from '@/types'

interface Props {
  product: ProductWithImages
}

/**
 * Edit product button - navigates to product edit page
 */
function EditProduct({ product }: Props) {
  return (
    <div className="absolute top-2 right-2 z-10">
      <Link href={`${Route.EditProduct}${product.id}`}>
        <Button variant="secondary" size="icon" title={`Edit ${product.name}`}>
          <Pencil className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  )
}

export { EditProduct }

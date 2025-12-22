import { notFound } from 'next/navigation'
import { getProductById } from '@/app/(pages)/shop/server/queries'
import { ProductEditForm } from './product-edit-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>
      <ProductEditForm product={product} />
    </div>
  )
}

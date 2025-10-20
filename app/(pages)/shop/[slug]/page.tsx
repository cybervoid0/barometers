import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/app/(pages)/shop/server/queries'
import { ProductDetails } from './product-details'

interface Props {
  params: Promise<{
    slug: string
  }>
}

export default async function page({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()
  return (
    <article className="mt-6">
      <h2 className="text-secondary mb-4">{product?.name}</h2>
      <ProductDetails product={product} />
    </article>
  )
}

import { ProductAddForm } from './product-add-form'

export default function AddProductPage() {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Add New Product</h1>
      <ProductAddForm />
    </div>
  )
}

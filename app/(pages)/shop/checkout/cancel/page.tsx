import { XCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { Route } from '@/constants'

export default function CheckoutCancelPage() {
  return (
    <div className="container mx-auto py-16 max-w-2xl text-center">
      <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h1 className="text-3xl font-bold mb-2">Checkout Cancelled</h1>
      <p className="text-muted-foreground mb-8">Your order was cancelled. No charges were made.</p>

      <div className="space-x-4">
        <Link href={Route.Shop}>
          <Button>Back to Shop</Button>
        </Link>
        <Link href={Route.Cart}>
          <Button variant="outline">Return to Cart</Button>
        </Link>
      </div>
    </div>
  )
}

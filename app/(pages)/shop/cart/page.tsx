'use client'

import type { AccessRole } from '@prisma/client'
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Image, Table } from '@/components/elements'
import { Button, Separator } from '@/components/ui'
import { Route } from '@/constants'
import type { ProductWithImages } from '@/types'
import { formatPrice } from '@/utils'
import { useCartStore } from '../providers/CartStoreProvider'
import { fetchProductsByIds } from '../server/query-actions'

const { accessor, display } = createColumnHelper<ProductWithImages>()

export default function Cart() {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user.name
  const role = session?.user.role
  const { items, addItem, subtractItem, removeItem, clearCart, getProductAmount, getTotalItems } =
    useCartStore(state => state)

  const [products, setProducts] = useState<ProductWithImages[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const cartProdIds = useMemo(() => Object.keys(items).sort().join(','), [items])

  useEffect(() => {
    if (!cartProdIds) {
      setProducts([])
      return
    }

    setIsLoading(true)
    ;(async () => {
      try {
        const result = await fetchProductsByIds(cartProdIds.split(','))
        if (result.success) {
          setProducts(result.data)
        } else {
          toast.error(result.error, { id: 'cart-error' })
        }
      } finally {
        setIsLoading(false)
      }
    })()
  }, [cartProdIds])

  // biome-ignore lint/correctness/useExhaustiveDependencies: add `items` dependency to update sum on q-ty change
  const totals = useMemo(() => {
    const eur = products.reduce((sum, { id, priceEUR }) => {
      const quantity = getProductAmount(id)
      return sum + (priceEUR ?? 0) * quantity
    }, 0)

    const usd = products.reduce((sum, { id, priceUSD }) => {
      const quantity = getProductAmount(id)
      return sum + (priceUSD ?? 0) * quantity
    }, 0)

    return { eur, usd }
  }, [products, getProductAmount, items])

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear the cart?')) {
      clearCart()
      toast.success('Cart cleared')
    }
  }

  const handleCheckout = () => {
    if (!session) {
      toast.error('Please sign in to checkout')
      router.push(Route.Signin)
      return
    }

    // TODO: Redirect to checkout page
    toast.info('Checkout coming soon...')
  }

  const columns = [
    accessor(({ images }) => images.at(0), {
      id: 'image',
      header: '',
      enableSorting: false,
      cell: info => {
        const image = info.getValue()
        const product = info.row.original
        return (
          <Link href={`${Route.Shop}/${product.slug}`}>
            {image ? (
              <Image
                width={80}
                height={80}
                className="rounded object-cover hover:opacity-80 transition-opacity"
                src={image.url}
                alt={image.alt ?? product.name}
              />
            ) : (
              <div className="w-20 h-20 bg-muted rounded flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </Link>
        )
      },
      meta: {
        headerAlign: 'center',
        cellAlign: 'center',
      },
    }),
    accessor('name', {
      id: 'name',
      header: 'Product',
      enableSorting: true,
      cell: info => (
        <div>
          <Link href={`${Route.Shop}/${info.row.original.slug}`}>
            <p className="font-medium hover:underline">{info.getValue()}</p>
          </Link>
          <p className="text-sm text-muted-foreground">
            Stock: {info.row.original.stock}
            {info.row.original.stock < 5 && info.row.original.stock > 0 && (
              <span className="text-orange-500 ml-2">Low stock!</span>
            )}
            {info.row.original.stock === 0 && (
              <span className="text-destructive ml-2">Out of stock</span>
            )}
          </p>
        </div>
      ),
    }),
    accessor('priceEUR', {
      id: 'price-eur',
      header: 'Price EUR',
      enableSorting: true,
      cell: info => <p>{info.getValue() ? formatPrice(info.getValue() ?? 0, 'EUR') : '—'}</p>,
      meta: {
        headerAlign: 'right',
        cellAlign: 'right',
      },
    }),
    accessor('priceUSD', {
      id: 'price-usd',
      header: 'Price USD',
      enableSorting: true,
      cell: info => <p>{info.getValue() ? formatPrice(info.getValue() ?? 0, 'USD') : '—'}</p>,
      meta: {
        headerAlign: 'right',
        cellAlign: 'right',
      },
    }),
    accessor('id', {
      id: 'quantity',
      header: 'Quantity',
      enableSorting: true,
      sortingFn: (a, b) => getProductAmount(a.original.id) - getProductAmount(b.original.id),
      cell: ({ getValue, row }) => {
        const { id, stock } = row.original
        const quantity = getProductAmount(getValue())

        const handleAddItem = () => {
          const res = addItem(id, stock)
          if (!res.success) {
            toast.error(res.error, { id: 'add-item-error' })
          }
        }

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => subtractItem(id)}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
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
      },
      meta: {
        headerAlign: 'center',
        cellAlign: 'center',
      },
    }),
    display({
      id: 'subtotal-eur',
      header: 'Subtotal EUR',
      enableSorting: true,
      sortingFn: (a, b) => {
        const subA = (a.original.priceEUR ?? 0) * getProductAmount(a.original.id)
        const subB = (b.original.priceEUR ?? 0) * getProductAmount(b.original.id)
        return subA - subB
      },
      cell: info => {
        const { priceEUR, id } = info.row.original
        const quantity = getProductAmount(id)
        const subtotal = (priceEUR ?? 0) * quantity
        return <p className="font-medium">{formatPrice(subtotal, 'EUR')}</p>
      },
      meta: {
        headerAlign: 'right',
        cellAlign: 'right',
      },
    }),
    display({
      id: 'subtotal-usd',
      header: 'Subtotal USD',
      enableSorting: true,
      sortingFn: (a, b) => {
        const subA = (a.original.priceUSD ?? 0) * getProductAmount(a.original.id)
        const subB = (b.original.priceUSD ?? 0) * getProductAmount(b.original.id)
        return subA - subB
      },
      cell: info => {
        const { priceUSD, id } = info.row.original
        const quantity = getProductAmount(id)
        const subtotal = (priceUSD ?? 0) * quantity
        return <p className="font-medium">{formatPrice(subtotal, 'USD')}</p>
      },
      meta: {
        headerAlign: 'right',
        cellAlign: 'right',
      },
    }),
    display({
      id: 'remove',
      header: '',
      enableSorting: false,
      cell: info => {
        const { id, name } = info.row.original
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              removeItem(id)
              toast.success(`${name} removed from cart`)
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )
      },
      meta: {
        headerAlign: 'center',
        cellAlign: 'center',
      },
    }),
  ]

  const table = useReactTable({
    columns,
    data: products,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true,
  })

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <ShoppingBag className="w-16 h-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="text-muted-foreground">Add some products to get started</p>
          <Link href={Route.Shop}>
            <Button>Browse Shop</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          {user && role && (
            <p className="text-sm text-muted-foreground mt-1">
              Welcome {user}. You are {roleDescriptions[role]}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={handleClearCart}
          className="text-destructive hover:text-destructive"
        >
          <X className="mr-2 h-4 w-4" />
          Clear Cart
        </Button>
      </div>

      <div className="space-y-6">
        <Table table={table} />

        <Separator />

        <div className="flex justify-between items-start">
          <Link href={Route.Shop}>
            <Button variant="outline">Continue Shopping</Button>
          </Link>

          <div className="space-y-3 min-w-[300px]">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total items:</span>
              <span className="font-medium">{getTotalItems()}</span>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">Total (EUR):</span>
                <span className="text-xl font-bold">{formatPrice(totals.eur, 'EUR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Total (USD):</span>
                <span className="text-xl font-bold">{formatPrice(totals.usd, 'USD')}</span>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const roleDescriptions: Record<AccessRole, string> = {
  USER: 'a registered user',
  ADMIN: 'a site administrator',
  OWNER: 'the Creator',
}

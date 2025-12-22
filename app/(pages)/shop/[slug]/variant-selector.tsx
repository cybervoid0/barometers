'use client'

import type { Product, ProductOption, ProductVariant } from '@prisma/client'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Button, Label } from '@/components/ui'
import { formatPrice } from '@/utils'
import { useShopCartStore } from '../stores/shop-cart-store'

interface Props {
  product: Product
  variants: ProductVariant[]
  options: ProductOption[]
  defaultVariantId?: string
}

function VariantSelector({ product, variants, options, defaultVariantId }: Props) {
  const { addItem, items } = useShopCartStore()

  // Selected option values
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    // Initialize with default variant's options
    if (defaultVariantId) {
      const defaultVariant = variants.find(v => v.id === defaultVariantId)
      if (defaultVariant?.options && typeof defaultVariant.options === 'object') {
        return defaultVariant.options as Record<string, string>
      }
    }
    // Or with first available values
    const initial: Record<string, string> = {}
    for (const opt of options) {
      const values = opt.values as string[]
      if (values.length > 0) {
        initial[opt.name] = values[0]
      }
    }
    return initial
  })

  const [quantity, setQuantity] = useState(1)

  // Find matching variant based on selected options
  const selectedVariant = useMemo(() => {
    return variants.find(variant => {
      const variantOptions = variant.options as Record<string, string>
      return options.every(opt => variantOptions[opt.name] === selectedOptions[opt.name])
    })
  }, [variants, options, selectedOptions])

  // Calculate how many of this variant are already in cart
  const cartQuantity = useMemo(() => {
    if (!selectedVariant) return 0
    const item = items.find(i => i.variantId === selectedVariant.id)
    return item?.quantity ?? 0
  }, [selectedVariant, items])

  const availableStock = (selectedVariant?.stock ?? 0) - cartQuantity

  const handleOptionChange = useCallback((optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }))
    setQuantity(1)
  }, [])

  const handleAddToCart = useCallback(() => {
    if (!selectedVariant || quantity <= 0) return
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      quantity,
    })
    setQuantity(1)
  }, [selectedVariant, quantity, addItem, product.id])

  return (
    <div className="space-y-6">
      {/* Option selectors */}
      {options.map(option => {
        const values = option.values as string[]
        return (
          <div key={option.id} className="space-y-2">
            <Label className="font-medium">{option.name}</Label>
            <div className="flex flex-wrap gap-2">
              {values.map(value => (
                <Button
                  key={value}
                  type="button"
                  variant={selectedOptions[option.name] === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleOptionChange(option.name, value)}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
        )
      })}

      {/* Selected variant info */}
      {selectedVariant && (
        <div className="p-4 border rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">SKU: {selectedVariant.sku}</span>
            <span className="text-sm">
              Stock: {availableStock > 0 ? availableStock : 'Out of stock'}
              {cartQuantity > 0 && (
                <span className="text-muted-foreground"> ({cartQuantity} in cart)</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {selectedVariant.priceEUR && (
              <span className="text-xl font-bold">
                {formatPrice(selectedVariant.priceEUR, 'EUR')}
              </span>
            )}
            {selectedVariant.priceUSD && (
              <span className="text-lg text-muted-foreground">
                {formatPrice(selectedVariant.priceUSD, 'USD')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quantity and Add to Cart */}
      <div className="flex items-center gap-4">
        <div className="flex items-center border rounded-lg">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={quantity <= 1}
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={quantity >= availableStock}
            onClick={() => setQuantity(q => Math.min(availableStock, q + 1))}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={!selectedVariant || availableStock <= 0 || quantity > availableStock}
          className="flex-1"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {availableStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  )
}

export { VariantSelector }

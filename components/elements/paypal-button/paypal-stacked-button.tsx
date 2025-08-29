'use client'

import Script from 'next/script'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/utils'

interface PayPalHostedButton {
  hostedButtonId: string
}

type PayPalHostedButtons = (config: PayPalHostedButton) => {
  render: (container: HTMLElement) => void
}

declare global {
  interface Window {
    paypal?: {
      HostedButtons: PayPalHostedButtons
    }
  }
}

export function PayPalStackedButton({
  className,
  ...divProps
}: React.HTMLAttributes<HTMLDivElement>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRendered, setIsRendered] = useState(false)

  const renderButton = useCallback(() => {
    if (window.paypal && containerRef.current && !isRendered) {
      // Clear container before rendering to avoid duplicates
      containerRef.current.innerHTML = ''

      window.paypal
        .HostedButtons({
          hostedButtonId: 'LEG7JKHVDZ6WA',
        })
        .render(containerRef.current)

      setIsRendered(true)
    }
  }, [isRendered])

  useEffect(() => {
    // If PayPal is already loaded, render immediately
    if (window.paypal) {
      renderButton()
    }
  }, [renderButton])

  return (
    <>
      <Script
        src="https://www.paypal.com/sdk/js?client-id=BAANjIpihRtt79UZv8fQq0xgx7TR1_2dcb9FXUwT9PHDOTZv-ICbL03-Nl89A-5vRezPPjhMzqcd9EIbYM&components=hosted-buttons&disable-funding=venmo&currency=EUR"
        strategy="lazyOnload"
        crossOrigin="anonymous"
        onLoad={renderButton}
        onError={e => {
          console.error('Failed to load PayPal SDK:', e)
        }}
      />
      {/** biome-ignore lint/correctness/useUniqueElementIds: PayPal ID */}
      <div
        ref={containerRef}
        id="paypal-container-LEG7JKHVDZ6WA"
        className={cn('mx-auto w-fit min-w-[min(95vw,400px)]', className)}
        {...divProps}
      />
    </>
  )
}

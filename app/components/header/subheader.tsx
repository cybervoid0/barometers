'use client'

import { usePathname } from 'next/navigation'
import { HeadingImage } from '../heading-image'

export function Subheader() {
  const pathname = usePathname()
  const path = pathname.split('/')[1] || 'home'
  if (path === 'home')
    return (
      <div className="xs:px-2 container mx-auto sm:px-4">
        <HeadingImage />
      </div>
    )
  return null
}

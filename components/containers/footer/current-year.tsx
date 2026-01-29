'use client'

import { Suspense } from 'react'

function Year() {
  return <>{new Date().getFullYear()}</>
}

export function CurrentYear() {
  return (
    <Suspense fallback={null}>
      <Year />
    </Suspense>
  )
}

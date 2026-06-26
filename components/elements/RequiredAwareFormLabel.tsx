'use client'

import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  useContext,
  useMemo,
} from 'react'
import type { z } from 'zod'
import { FormLabel, useFormField } from '@/components/ui'
import { RequiredFieldMark } from './RequiredFieldMark'

const RequiredFieldsContext = createContext<ReadonlySet<string>>(new Set())

/**
 * Derives the set of required keys from a Zod object schema (a key is required
 * unless its schema is optional) and exposes it to descendant
 * {@link RequiredAwareFormLabel}s so they can mark required fields automatically.
 */
export function RequiredFieldsProvider({
  schema,
  children,
}: {
  schema: z.ZodObject<z.ZodRawShape>
  children: ReactNode
}) {
  const required = useMemo(() => {
    const keys = new Set<string>()
    for (const [key, value] of Object.entries(schema.shape)) {
      // A field is required unless its schema accepts `undefined`. (Zod 4's
      // isOptional() is deprecated in favour of this safe-parse probe.)
      if (!(value as z.ZodType).safeParse(undefined).success) keys.add(key)
    }
    return keys
  }, [schema])

  return (
    <RequiredFieldsContext.Provider value={required}>{children}</RequiredFieldsContext.Provider>
  )
}

/**
 * Drop-in replacement for {@link FormLabel} that appends a {@link RequiredFieldMark}
 * when the field (matched by its react-hook-form name) is required according to the
 * schema provided via {@link RequiredFieldsProvider}. Outside a provider it renders a
 * plain label, so it is always safe to use.
 */
export function RequiredAwareFormLabel({
  children,
  ...props
}: ComponentPropsWithoutRef<typeof FormLabel>) {
  const { name } = useFormField()
  const required = useContext(RequiredFieldsContext)

  return (
    <FormLabel {...props}>
      {children}
      {required.has(name) && (
        <>
          {' '}
          <RequiredFieldMark />
        </>
      )}
    </FormLabel>
  )
}

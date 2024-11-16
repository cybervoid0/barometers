import { useMemo } from 'react'
import useSWR from 'swr'
import { listTypes } from '@/actions/barometer-types'
import { listManufacturers } from '@/actions/manufacturers'
import { listConditions } from '@/actions/conditions'

export function useBarometers() {
  const { data: types } = useSWR('types', listTypes)
  const { data: manufacturers } = useSWR('manufacturers', listManufacturers)
  const { data: conditions } = useSWR('conditions', listConditions)

  return useMemo(
    () => ({
      conditions,
      types,
      manufacturers,
    }),
    [manufacturers, types, conditions],
  )
}

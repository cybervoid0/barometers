import { useMemo, useEffect } from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { IBarometerCondition } from '@/models/condition'
import { IBarometerType } from '@/models/type'
import { IManufacturer } from '@/models/manufacturer'
import { showError } from '@/utils/notification'
import { conditionsApiRoute, barometerTypesApiRoute, manufacturersApiRoute } from '../constants'

export const useBarometers = () => {
  const {
    data: condition,
    error: conditionError,
    isLoading: conditionIsLoading,
  } = useQuery<IBarometerCondition[]>({
    queryKey: ['conditions'],
    queryFn: () => axios.get(conditionsApiRoute).then(({ data }) => data),
  })
  const {
    data: types,
    error: typesError,
    isLoading: typesIsLoading,
  } = useQuery<IBarometerType[]>({
    queryKey: ['types'],
    queryFn: () => axios.get(barometerTypesApiRoute).then(({ data }) => data),
  })
  const {
    data: manufacturers,
    error: manufacturersError,
    isLoading: manufacturersIsLoading,
  } = useQuery<IManufacturer[]>({
    queryKey: ['manufacturers'],
    queryFn: () => axios.get(manufacturersApiRoute).then(({ data }) => data),
  })

  useEffect(() => {
    ;[typesError, conditionError, manufacturersError].forEach(err => {
      if (err instanceof Error) showError(err.message)
    })
  }, [typesError, conditionError, manufacturersError])

  type ReturnType<T> = Record<string, { data: T[]; isLoading: boolean }>
  return useMemo(
    () =>
      ({
        condition: {
          data: condition ?? [],
          isLoading: conditionIsLoading,
        },
        types: {
          data: types ?? [],
          isLoading: typesIsLoading,
        },
        manufacturers: {
          data: manufacturers ?? [],
          isLoading: manufacturersIsLoading,
        },
      }) satisfies ReturnType<unknown>,
    [condition, types, conditionIsLoading, typesIsLoading, manufacturers, manufacturersIsLoading],
  )
}

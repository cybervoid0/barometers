import { useMemo, useEffect } from 'react'
import axios, { AxiosError } from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { IBarometerCondition } from '@/models/condition'
import { IBarometerType } from '@/models/type'
import { IManufacturer } from '@/models/manufacturer'
import { showError, showInfo } from '@/utils/notification'
import { conditionsApiRoute, barometerTypesApiRoute, manufacturersApiRoute } from '@/app/constants'

export const useBarometers = () => {
  const queryClient = useQueryClient()
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

  const { mutate: deleteManufacturer } = useMutation({
    mutationFn: (id: string) =>
      axios.delete(`${manufacturersApiRoute}/${id}`).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['manufacturers'],
      })
      showInfo('Manufacturer deleted', 'Success')
    },
    onError: (error: AxiosError) => {
      showError(
        (error.response?.data as { message: string })?.message ||
          error.message ||
          'Error deleting manufacturer',
      )
    },
  })

  useEffect(() => {
    ;[typesError, conditionError, manufacturersError].forEach(err => {
      if (err instanceof Error) showError(err.message)
    })
  }, [typesError, conditionError, manufacturersError])

  return useMemo(
    () => ({
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
        delete: deleteManufacturer,
      },
    }),
    [
      condition,
      conditionIsLoading,
      types,
      typesIsLoading,
      manufacturers,
      manufacturersIsLoading,
      deleteManufacturer,
    ],
  )
}

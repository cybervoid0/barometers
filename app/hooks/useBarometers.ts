import { useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { showError, showInfo } from '@/utils/notification'
import {
  fetchCategoryList,
  fetchConditions,
  fetchManufacturerList,
  deleteManufacturer,
} from '@/utils/fetch'

export const useBarometers = () => {
  const queryClient = useQueryClient()
  const {
    data: condition,
    error: conditionError,
    isLoading: conditionIsLoading,
  } = useQuery({
    queryKey: ['conditions'],
    queryFn: fetchConditions,
  })
  const {
    data: types,
    error: typesError,
    isLoading: typesIsLoading,
  } = useQuery({
    queryKey: ['types'],
    queryFn: fetchCategoryList,
  })
  const {
    data: manufacturers,
    error: manufacturersError,
    isLoading: manufacturersIsLoading,
  } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: fetchManufacturerList,
  })

  const { mutate: deleteMnf } = useMutation({
    mutationFn: deleteManufacturer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['manufacturers'],
      })
      showInfo('Manufacturer deleted', 'Success')
    },
    onError: error => {
      showError(error.message || 'Error deleting manufacturer')
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
        delete: deleteMnf,
      },
    }),
    [
      condition,
      conditionIsLoading,
      types,
      typesIsLoading,
      manufacturers,
      manufacturersIsLoading,
      deleteMnf,
    ],
  )
}

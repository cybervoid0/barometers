import { useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { showError, showInfo } from '@/utils/notification'
import {
  fetchCategoryList,
  fetchConditions,
  fetchManufacturerList,
  deleteManufacturer,
  fetchSubcategoryList,
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
    data: categories,
    error: typesError,
    isLoading: typesIsLoading,
  } = useQuery({
    queryKey: ['types'],
    queryFn: fetchCategoryList,
  })
  const {
    data: subcategories,
    error: subcategoriesError,
    isLoading: subcategoriesIsLoading,
  } = useQuery({
    queryKey: ['subcategories'],
    queryFn: fetchSubcategoryList,
  })
  const {
    data: manufacturers,
    error: manufacturersError,
    isLoading: manufacturersIsLoading,
  } = useQuery({
    queryKey: ['manufacturers'],
    // size 0 returns all manufacturers without pagination
    queryFn: () => fetchManufacturerList({ size: '0' }),
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
    ;[typesError, conditionError, manufacturersError, subcategoriesError].forEach(err => {
      if (err instanceof Error) showError(err.message)
    })
  }, [typesError, conditionError, manufacturersError, subcategoriesError])

  return useMemo(
    () => ({
      condition: {
        data: condition ?? [],
        isLoading: conditionIsLoading,
      },
      categories: {
        data: categories ?? [],
        isLoading: typesIsLoading,
      },
      manufacturers: {
        data: manufacturers?.manufacturers ?? [],
        isLoading: manufacturersIsLoading,
        delete: deleteMnf,
      },
      subcategories: {
        data: subcategories ?? [],
        isLoading: subcategoriesIsLoading,
      },
    }),
    [
      condition,
      conditionIsLoading,
      categories,
      typesIsLoading,
      manufacturers,
      manufacturersIsLoading,
      deleteMnf,
      subcategories,
      subcategoriesIsLoading,
    ],
  )
}

import { useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  fetchCategoryList,
  fetchConditions,
  fetchManufacturerList,
  deleteManufacturer,
  fetchSubcategoryList,
  fetchMaterialList,
  fetchCountryList,
} from '@/services/fetch'

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
    data: materials,
    error: materialsError,
    isLoading: materialsIsLoading,
  } = useQuery({
    queryKey: ['materials'],
    queryFn: fetchMaterialList,
  })
  const {
    data: countries,
    error: countriesError,
    isLoading: countriesIsLoading,
  } = useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountryList,
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
      toast.success('Manufacturer deleted')
    },
    onError: error => {
      toast.error(error.message || 'Error deleting manufacturer')
    },
  })

  useEffect(() => {
    ;[
      typesError,
      conditionError,
      manufacturersError,
      subcategoriesError,
      materialsError,
      countriesError,
    ].forEach(err => {
      if (err instanceof Error) toast.error(err.message)
    })
  }, [
    typesError,
    conditionError,
    manufacturersError,
    subcategoriesError,
    materialsError,
    countriesError,
  ])

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
      materials: {
        data: materials,
        isLoading: materialsIsLoading,
      },
      countries: {
        data: countries,
        isLoading: countriesIsLoading,
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
      materials,
      materialsIsLoading,
      countries,
      countriesIsLoading,
    ],
  )
}

/* eslint-disable react-hooks/exhaustive-deps */
import { isEqual } from 'lodash'
import { useCallback, useEffect, useMemo } from 'react'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { BarometerDTO } from '@/app/types'
import { barometerRoute } from '@/utils/routes-front'
import { showError, showInfo } from '@/utils/notification'
import { updateBarometer } from '@/utils/fetch'

interface Props {
  barometer: BarometerDTO
  property: keyof BarometerDTO
  validate?: (value: BarometerDTO[keyof BarometerDTO]) => string | null
}

export function useEditField({ property, barometer, validate }: Props) {
  const form = useForm<Partial<BarometerDTO>>({
    initialValues: { [property]: '' },
    validate: {
      [property]: validate,
    },
  })

  const [opened, { open, close }] = useDisclosure(false)

  const update = useCallback(async () => {
    try {
      const newValue = form.values[property]
      if (isEqual(newValue, barometer[property])) {
        close()
        return
      }

      const { slug } = await updateBarometer({
        id: barometer.id,
        [property]: newValue,
      })

      showInfo(`${barometer.name} updated`, 'Success')
      close()
      window.location.href = barometerRoute + (slug ?? '')
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error updating barometer')
    }
  }, [barometer, close, form.values, property])

  // set initial form values on modal open
  useEffect(() => {
    const value = barometer[property]
    if (barometer && property) {
      form.setValues({ [property]: value })
      form.resetDirty({ [property]: value })
    }
  }, [barometer, property])

  // Reset form when modal is reopened
  useEffect(() => {
    if (opened) form.reset()
  }, [opened])

  return useMemo(() => ({ form, opened, open, close, update }), [form, opened, open, close, update])
}

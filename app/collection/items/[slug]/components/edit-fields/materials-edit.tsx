/* eslint-disable react-hooks/exhaustive-deps */

'use client'

import { isEqual } from 'lodash'
import { useCallback, useEffect, useMemo } from 'react'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import {
  Box,
  Button,
  Modal,
  Tooltip,
  UnstyledButton,
  MultiSelect,
  ComboboxData,
} from '@mantine/core'
import { IconEdit } from '@tabler/icons-react'
import { BarometerDTO } from '@/app/types'
import { FrontRoutes } from '@/utils/routes-front'
import { showError, showInfo } from '@/utils/notification'
import { updateBarometer } from '@/utils/fetch'
import { useBarometers } from '@/app/hooks/useBarometers'

interface Form {
  materials: number[]
}

interface Props {
  barometer: BarometerDTO
}

export function MaterialsEdit({ barometer }: Props) {
  const { materials: materialList } = useBarometers()
  const [opened, { open, close }] = useDisclosure(false)
  const form = useForm<Form>({
    initialValues: {
      materials: [],
    },
  })

  const handleUpdateBarometer = useCallback(
    async ({ materials }: Form) => {
      try {
        if (
          isEqual(
            materials,
            barometer.materials.map(({ id }) => id),
          )
        ) {
          close()
          return
        }
        const updatedBarometer = {
          id: barometer.id,
          materials,
        }
        const { slug } = await updateBarometer(updatedBarometer)
        showInfo(`${barometer.name} updated`, 'Success')
        close()
        window.location.href = FrontRoutes.Barometer + (slug ?? '')
      } catch (error) {
        showError(
          error instanceof Error ? error.message : 'Error updating barometer',
        )
      }
    },
    [barometer.id, barometer.materials, barometer.name, close],
  )

  // set initial form values on modal open
  useEffect(() => {
    const materials = barometer.materials.map(({ id }) => id)
    form.setValues({ materials })
    form.resetDirty({ materials })
  }, [barometer])

  // Reset form when modal is reopened
  useEffect(() => {
    if (opened) form.reset()
  }, [opened])

  const materialsData: ComboboxData = useMemo(
    () =>
      materialList.data?.map(({ id, name }) => ({
        value: String(id),
        label: name,
      })) ?? [],
    [materialList],
  )

  return (
    <>
      <Tooltip label="Edit Materials">
        <UnstyledButton onClick={open}>
          <IconEdit color="brown" size={18} />
        </UnstyledButton>
      </Tooltip>
      <Modal
        centered
        opened={opened}
        onClose={close}
        title="Edit Materials"
        size="md"
        tt="capitalize"
        styles={{ title: { fontSize: '1.5rem', fontWeight: 500 } }}
      >
        <Box component="form" onSubmit={form.onSubmit(handleUpdateBarometer)}>
          <MultiSelect
            label="Materials"
            placeholder={
              form.values.materials.length === 0
                ? 'Select materials'
                : undefined
            }
            data={materialsData}
            value={form.values.materials.map(String)}
            onChange={materials =>
              form.setValues({ materials: materials.map(Number) })
            }
          />
          <Button
            fullWidth
            mt="lg"
            type="submit"
            color="dark"
            variant="outline"
          >
            Update
          </Button>
        </Box>
      </Modal>
    </>
  )
}

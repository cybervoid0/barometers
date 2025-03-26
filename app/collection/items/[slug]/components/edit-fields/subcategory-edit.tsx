/* eslint-disable react-hooks/exhaustive-deps */

'use client'

import { useForm } from '@mantine/form'
import {
  Modal,
  UnstyledButton,
  UnstyledButtonProps,
  Button,
  Stack,
  Select,
  Tooltip,
  Box,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconEdit } from '@tabler/icons-react'
import { useCallback, useEffect } from 'react'
import { BarometerDTO } from '@/app/types'
import { useBarometers } from '@/app/hooks/useBarometers'
import { showError, showInfo } from '@/utils/notification'
import { updateBarometer } from '@/utils/fetch'
import { FrontRoutes } from '@/utils/routes-front'

interface Props extends UnstyledButtonProps {
  size?: string | number | undefined
  barometer: BarometerDTO
}

interface Form {
  subCategoryId: number | null
}

export function SubcategoryEdit({ size = 18, barometer, ...props }: Props) {
  const { subcategories } = useBarometers()
  const [opened, { open, close }] = useDisclosure(false)
  const form = useForm<Form>({
    initialValues: { subCategoryId: null },
  })

  const update = useCallback(
    async ({ subCategoryId }: typeof form.values) => {
      try {
        // don't update DB if selected value doesn't differ from the recorded
        if (subCategoryId === barometer.subCategoryId) {
          close()
          return
        }

        const { slug } = await updateBarometer({
          id: barometer.id,
          subCategoryId,
        })

        showInfo(`${barometer.name} updated`, 'Success')
        close()
        window.location.href = FrontRoutes.Barometer + (slug ?? '')
      } catch (error) {
        showError(error instanceof Error ? error.message : 'Error updating barometer')
      }
    },
    [barometer.id, barometer.name, barometer.subCategoryId, close],
  )

  // set initial form values on modal open
  useEffect(() => {
    const { subCategoryId } = barometer
    form.setValues({ subCategoryId })
    form.resetDirty({ subCategoryId })
  }, [barometer])

  // Reset form when modal is reopened
  useEffect(() => {
    if (opened) form.reset()
  }, [opened])
  return (
    <>
      <Tooltip label="Edit Movement Type">
        <UnstyledButton {...props} onClick={open}>
          <IconEdit color="brown" size={size} />
        </UnstyledButton>
      </Tooltip>
      <Modal
        centered
        opened={opened}
        onClose={close}
        title="Edit Movement Type"
        size="md"
        tt="capitalize"
        styles={{ title: { fontSize: '1.5rem', fontWeight: 500 } }}
      >
        <Box component="form" onSubmit={form.onSubmit(update)}>
          <Stack>
            <Select
              placeholder="Pick value"
              clearable
              data={subcategories.data.map(({ name, id }) => ({
                label: name,
                value: String(id),
              }))}
              value={form.values.subCategoryId !== null ? String(form.values.subCategoryId) : null}
              onChange={value =>
                form.setValues({ subCategoryId: value !== null ? Number(value) : null })
              }
              allowDeselect
            />
            <Button fullWidth color="dark" variant="outline" type="submit">
              Save
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  )
}

'use client'

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
import { IconEdit } from '@tabler/icons-react'
import { BarometerDTO } from '@/app/types'
import { useEditField } from './useEditField'
import { useBarometers } from '@/app/hooks/useBarometers'

interface Props extends UnstyledButtonProps {
  size?: string | number | undefined
  barometer: BarometerDTO
}

const property: keyof BarometerDTO = 'subCategoryId'

export function SubcategoryEdit({ size = 18, barometer, ...props }: Props) {
  const { subcategories } = useBarometers()
  const { open, close, opened, form, update } = useEditField({ property, barometer })
  return (
    <>
      <Tooltip label="Edit Subcategory">
        <UnstyledButton {...props} onClick={open}>
          <IconEdit color="brown" size={size} />
        </UnstyledButton>
      </Tooltip>
      <Modal
        centered
        opened={opened}
        onClose={close}
        title="Edit Subcategory"
        size="md"
        tt="capitalize"
        styles={{ title: { fontSize: '1.5rem', fontWeight: 500 } }}
      >
        <Box component="form" onSubmit={form.onSubmit(update)}>
          <Stack>
            <Select
              data={subcategories.data.map(({ name, id }) => ({
                label: name,
                value: String(id),
              }))}
              value={String(form.values.subCategoryId ?? '1')}
              onChange={id => {
                const newSC = subcategories.data.find(sc => String(sc.id) === id)
                form.setValues({ subCategoryId: newSC?.id })
              }}
              allowDeselect={false}
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

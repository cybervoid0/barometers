'use client'

import {
  Modal,
  UnstyledButton,
  UnstyledButtonProps,
  TextInput,
  Button,
  Stack,
  Tooltip,
  Box,
  Center,
} from '@mantine/core'
import { isDecimal } from 'validator'
import { IconEdit } from '@tabler/icons-react'
import { BarometerDTO } from '@/app/types'
import { useEditField } from './useEditField'

interface Props extends UnstyledButtonProps {
  size?: string | number | undefined
  barometer: BarometerDTO
}

const property: keyof BarometerDTO = 'estimatedPrice'

export function EstimatedPriceEdit({ size = 18, barometer, ...props }: Props) {
  const { open, close, opened, form, update } = useEditField({
    property,
    barometer,
    validate: val => (isDecimal(val as string) ? null : 'Wrong decimal number'),
  })
  return (
    <>
      <Tooltip label="Edit Estimated Price">
        <UnstyledButton {...props} onClick={open}>
          <Center>
            <IconEdit color="brown" size={size} />
          </Center>
        </UnstyledButton>
      </Tooltip>
      <Modal
        centered
        opened={opened}
        onClose={close}
        title="Edit Estimated Price"
        size="md"
        tt="capitalize"
        styles={{ title: { fontSize: '1.5rem', fontWeight: 500 } }}
      >
        <Box component="form" onSubmit={form.onSubmit(update)}>
          <Stack>
            <TextInput leftSection="€" required {...form.getInputProps(property)} />
            <Button fullWidth color="dark" variant="outline" type="submit">
              Save
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  )
}

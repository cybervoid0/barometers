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
} from '@mantine/core'
import { isLength } from 'validator'
import { IconEdit } from '@tabler/icons-react'
import { BarometerDTO } from '@/app/types'
import { useEditField } from './useEditField'

interface TextFieldEditProps extends UnstyledButtonProps {
  size?: string | number | undefined
  barometer: BarometerDTO
  property: keyof BarometerDTO
}

export function TextFieldEdit({ size = 18, barometer, property, ...props }: TextFieldEditProps) {
  const { open, close, opened, form, update } = useEditField({
    property,
    barometer,
    validate: val =>
      isLength(String(val), { min: 2, max: 200 }) ? null : 'Incorrect length (>2 <200)',
  })
  return (
    <>
      <Tooltip label={`Edit ${property}`}>
        <UnstyledButton {...props} onClick={open}>
          <IconEdit color="brown" size={size} />
        </UnstyledButton>
      </Tooltip>
      <Modal
        centered
        opened={opened}
        onClose={close}
        title={`Edit ${property}`}
        size="md"
        tt="capitalize"
        styles={{ title: { fontSize: '1.5rem', fontWeight: 500 } }}
      >
        <Box component="form" onSubmit={form.onSubmit(update)}>
          <Stack>
            <TextInput required {...form.getInputProps(property)} />
            <Button fullWidth color="dark" variant="outline" type="submit">
              Save
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  )
}

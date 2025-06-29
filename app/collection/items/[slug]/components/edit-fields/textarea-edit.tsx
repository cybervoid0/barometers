'use client'

import {
  Modal,
  UnstyledButton,
  UnstyledButtonProps,
  Textarea,
  Button,
  Stack,
  Tooltip,
  Box,
  Center,
} from '@mantine/core'
import { IconEdit } from '@tabler/icons-react'
import { useEditField } from './useEditField'
import { BarometerDTO } from '@/app/types'

interface Props extends UnstyledButtonProps {
  size?: string | number | undefined
  barometer: BarometerDTO
  property: keyof BarometerDTO
}

export function TextAreaEdit({
  size = 18,
  barometer,
  property,
  ...props
}: Props) {
  const { open, opened, close, form, update } = useEditField({
    property,
    barometer,
  })
  return (
    <>
      <Tooltip label={`Edit ${property}`}>
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
        title={`Edit ${property}`}
        size="xl"
        tt="capitalize"
        styles={{ title: { fontSize: '1.5rem', fontWeight: 500 } }}
      >
        <Box component="form" onSubmit={form.onSubmit(update)}>
          <Stack>
            <Textarea autosize {...form.getInputProps(property)} />
            <Button fullWidth color="dark" variant="outline" type="submit">
              Save
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  )
}

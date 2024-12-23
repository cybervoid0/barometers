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
} from '@mantine/core'
import { IconEdit } from '@tabler/icons-react'
import { useEditField } from './useEditField'
import { BarometerDTO } from '@/app/types'

interface DescriptionEditProps extends UnstyledButtonProps {
  size?: string | number | undefined
  barometer: BarometerDTO
}

const property = 'description'

export function DescriptionEdit({ size = 18, barometer, ...props }: DescriptionEditProps) {
  const { open, opened, close, form, update } = useEditField({ property, barometer })
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

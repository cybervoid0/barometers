'use client'

import { Modal, UnstyledButton, UnstyledButtonProps, TextInput, Button, Stack } from '@mantine/core'
import { IconEdit } from '@tabler/icons-react'
import { IBarometer } from '@/models/barometer'
import { useEditField } from './useEditField'

interface TextFieldEditProps extends UnstyledButtonProps {
  size?: string | number | undefined
  barometer: IBarometer
  property: keyof IBarometer
}

export function TextFieldEdit({ size = 18, barometer, property, ...props }: TextFieldEditProps) {
  const { open, close, opened, form, update } = useEditField({ property, barometer })
  return (
    <>
      <UnstyledButton {...props} onClick={open}>
        <IconEdit color="brown" size={size} />
      </UnstyledButton>
      <Modal
        centered
        opened={opened}
        onClose={close}
        title={`Edit ${property}`}
        size="md"
        tt="capitalize"
        styles={{ title: { fontSize: '1.5rem', fontWeight: 500 } }}
      >
        <Stack>
          <TextInput required {...form.getInputProps(property)} />
          <Button fullWidth color="dark" variant="outline" onClick={update}>
            Save
          </Button>
        </Stack>
      </Modal>
    </>
  )
}

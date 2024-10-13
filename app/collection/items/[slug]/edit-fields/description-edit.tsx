'use client'

import { Modal, UnstyledButton, UnstyledButtonProps, Textarea, Button, Stack } from '@mantine/core'
import { IconEdit } from '@tabler/icons-react'
import { IBarometer } from '@/models/barometer'
import { useEditField } from './useEditField'

interface DescriptionEditProps extends UnstyledButtonProps {
  size?: string | number | undefined
  barometer: IBarometer
}

const property = 'description'

export function DescriptionEdit({ size = 18, barometer, ...props }: DescriptionEditProps) {
  const { open, opened, close, form, update } = useEditField({ property, barometer })
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
        size="xl"
        tt="capitalize"
        styles={{ title: { fontSize: '1.5rem', fontWeight: 500 } }}
      >
        <Stack>
          <Textarea autosize {...form.getInputProps(property)} />
          <Button fullWidth color="dark" variant="outline" onClick={update}>
            Save
          </Button>
        </Stack>
      </Modal>
    </>
  )
}

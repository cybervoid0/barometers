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
import { IBarometer } from '@/models/barometer'
import { useEditField } from './useEditField'
import { useBarometers } from '@/app/hooks/useBarometers'

interface TextFieldEditProps extends UnstyledButtonProps {
  size?: string | number | undefined
  barometer: IBarometer
}

export function ConditionEdit({ size = 18, barometer, ...props }: TextFieldEditProps) {
  const { conditions } = useBarometers()
  const { open, close, opened, form, update } = useEditField({ property: 'condition', barometer })
  return (
    <>
      <Tooltip label="Edit condition">
        <UnstyledButton {...props} onClick={open}>
          <IconEdit color="brown" size={size} />
        </UnstyledButton>
      </Tooltip>
      <Modal
        centered
        opened={opened}
        onClose={close}
        title="Edit condition"
        size="md"
        tt="capitalize"
        styles={{ title: { fontSize: '1.5rem', fontWeight: 500 } }}
      >
        <Box component="form" onSubmit={update}>
          <Stack>
            <Select
              data={conditions?.map(({ name, _id }) => ({
                label: name,
                value: String(_id),
              }))}
              value={String(form.values.condition?._id)}
              onChange={id => {
                const newCondition = conditions?.find(({ _id }) => _id === id)
                form.setValues({ condition: newCondition })
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

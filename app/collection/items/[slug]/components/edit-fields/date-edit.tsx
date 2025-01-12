/* eslint-disable react-hooks/exhaustive-deps */

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
import { IconEdit } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { useEffect } from 'react'
import dayjs from 'dayjs'
import { BarometerDTO } from '@/app/types'
import { updateBarometer } from '@/utils/fetch'
import { barometerRoute } from '@/utils/routes-front'
import { showInfo, showError } from '@/utils/notification'

interface DateEditProps extends UnstyledButtonProps {
  size?: string | number | undefined
  barometer: BarometerDTO
}

export function DateEdit({ size = 18, barometer, ...props }: DateEditProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const form = useForm({
    initialValues: {
      date: '',
    },
  })
  // set initial form values on modal open
  useEffect(() => {
    const value = dayjs(barometer.date).format('YYYY')
    if (barometer) {
      form.setValues({ date: value })
      form.resetDirty({ date: value })
    }
  }, [barometer])

  // Reset form when modal is reopened
  useEffect(() => {
    if (opened) form.reset()
  }, [opened])

  const update = async ({ date }: typeof form.values) => {
    try {
      const { slug } = await updateBarometer({
        id: barometer.id,
        date: dayjs(`${date}-01-01`).toISOString(),
      })
      showInfo(`${barometer.name} updated`, 'Success')
      close()
      window.location.href = barometerRoute + (slug ?? '')
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error updating barometer')
    }
  }

  return (
    <>
      <Tooltip label="Edit year">
        <UnstyledButton {...props} onClick={open}>
          <IconEdit color="brown" size={size} />
        </UnstyledButton>
      </Tooltip>
      <Modal
        centered
        opened={opened}
        onClose={close}
        title="Edit year"
        size="md"
        tt="capitalize"
        styles={{ title: { fontSize: '1.5rem', fontWeight: 500 } }}
      >
        <Box component="form" onSubmit={form.onSubmit(update)}>
          <Stack>
            <TextInput
              required
              placeholder="YYYY"
              maxLength={4}
              value={form.values.date}
              onChange={e => {
                const year = e.target.value.replace(/\D/g, '').slice(0, 4)
                form.setFieldValue('date', year)
              }}
              error={form.errors.date}
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

'use client'

import React from 'react'
import { Box, Button, ButtonProps, Group, Modal, Textarea, TextInput } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { useMutation } from '@tanstack/react-query'
import { isEmail, isLength } from 'validator'
import { showError, showInfo } from '@/utils/notification'
import { createReport } from '@/utils/fetch'
import { BarometerDTO } from '@/app/types'

interface Props extends ButtonProps {
  barometer: BarometerDTO
}

export default function InaccuracyReport({ barometer, ...props }: Props) {
  const [isOpened, { open, close }] = useDisclosure(false)
  const form = useForm({
    initialValues: {
      issueType: '',
      reporterEmail: '',
      description: '',
    },
    validate: {
      reporterEmail: value => (!isEmail(value) ? 'Invalid email' : null),
      issueType: value =>
        !isLength(value, { min: 5, max: 100 })
          ? 'Value must be between 5 and 100 characters'
          : null,
      description: value =>
        !isLength(value, { min: 10, max: 1000 })
          ? 'Value must be between 10 and 1000 characters'
          : null,
    },
    transformValues: values => ({
      ...values,
      barometerId: barometer.id,
    }),
  })

  const { mutate } = useMutation({
    mutationFn: createReport,
    onSuccess: ({ id }) => {
      close()
      form.reset()
      showInfo(
        `Thank you! Your report was registered with ID ${id}. We will contact you at the provided email`,
      )
    },
    onError: err => showError(err.message),
  })
  return (
    <>
      <Button {...props} onClick={open}>
        Report inaccuracy
      </Button>
      <Modal
        size="auto"
        opened={isOpened}
        onClose={close}
        title={`Report Inaccuracy in ${barometer.name}`}
        centered
        styles={{ title: { fontWeight: 500, fontSize: '1.2rem', textTransform: 'capitalize' } }}
      >
        <Box component="form" onSubmit={form.onSubmit(values => mutate(values))}>
          <TextInput label="Your email" required {...form.getInputProps('reporterEmail')} />
          <TextInput label="Subject" required {...form.getInputProps('issueType')} />
          <Textarea
            label="Issue description"
            placeholder="Describe the inaccuracy"
            {...form.getInputProps('description')}
            required
            autosize
            minRows={2}
          />
          <Group justify="flex-end" mt="lg">
            <Button type="submit">Send</Button>
          </Group>
        </Box>
      </Modal>
    </>
  )
}

'use client'

import React from 'react'
import {
  Box,
  Button,
  ButtonProps,
  Group,
  Modal,
  Textarea,
  TextInput,
  Text,
  LoadingOverlay,
  Tooltip,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isEmail, isLength } from 'validator'
import { showError, showInfo } from '@/utils/notification'
import { createReport } from '@/utils/fetch'
import { BarometerDTO } from '@/app/types'

interface Props extends ButtonProps {
  barometer: BarometerDTO
}
const maxFeedbackLen = 1000

export default function InaccuracyReport({ barometer, ...props }: Props) {
  const queryClient = useQueryClient()
  const [isOpened, { open, close }] = useDisclosure(false)
  const form = useForm({
    initialValues: {
      reporterName: '',
      reporterEmail: '',
      description: '',
    },
    validate: {
      reporterEmail: value => (!isEmail(value) ? 'Invalid email' : null),
      reporterName: value =>
        !isLength(value, { min: 2, max: 50 }) ? 'Value must be between 2 and 50 characters' : null,
      description: value =>
        !isLength(value, { min: 5, max: maxFeedbackLen })
          ? `Value must be between 5 and ${maxFeedbackLen} characters`
          : null,
    },
    transformValues: values => ({
      ...values,
      barometerId: barometer.id,
    }),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: createReport,
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ['inaccuracyReport'] })
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
      <Tooltip
        multiline
        w={210}
        label={
          <Text size="xs">
            Report issues in the description of &laquo;
            <span style={{ textTransform: 'capitalize' }}>{barometer.name}</span>&raquo;
          </Text>
        }
      >
        <Button variant="light" color="primary" {...props} onClick={open}>
          <Text fw={400} fz="sm" size="md" lts="0.05rem" tt="uppercase">
            Report inaccuracy
          </Text>
        </Button>
      </Tooltip>
      <Modal
        size="xl"
        opened={isOpened}
        onClose={close}
        title={`Report Inaccuracy in ${barometer.name}`}
        centered
        styles={{ title: { fontWeight: 500, fontSize: '1.2rem', textTransform: 'capitalize' } }}
      >
        <LoadingOverlay
          visible={isPending}
          zIndex={1000}
          loaderProps={{ color: 'dark', type: 'oval' }}
          overlayProps={{ blur: 2 }}
        />
        <Box component="form" onSubmit={form.onSubmit(values => mutate(values))}>
          <TextInput label="Name" required {...form.getInputProps('reporterName')} />
          <TextInput label="Email" required {...form.getInputProps('reporterEmail')} />
          <Textarea
            label="Feedback"
            description={(() => {
              const feedbackLen = form.values.description.length
              const symbolsLeft = maxFeedbackLen - feedbackLen
              return feedbackLen > 0 && feedbackLen <= maxFeedbackLen
                ? `${symbolsLeft} symbol${symbolsLeft === 1 ? '' : 's'} remaining`
                : feedbackLen > maxFeedbackLen
                  ? `Feedback is ${-symbolsLeft} character${-symbolsLeft === 1 ? '' : 's'} longer than allowed`
                  : undefined
            })()}
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

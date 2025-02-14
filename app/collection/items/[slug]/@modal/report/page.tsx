'use client'

import { Box, Button, Group, LoadingOverlay, Modal, Textarea, TextInput } from '@mantine/core'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useForm } from '@mantine/form'
import { isEmail, isLength } from 'validator'
import { showError, showInfo } from '@/utils/notification'
import { createReport, fetchBarometer } from '@/utils/fetch'

const maxFeedbackLen = 1000

export default function Report({ params: { slug } }: { params: { slug: string } }) {
  const router = useRouter()

  const { data: barometer } = useQuery({
    enabled: !!slug,
    queryKey: [slug],
    queryFn: () => fetchBarometer(slug),
  })
  const close = () => {
    router.back()
  }

  const queryClient = useQueryClient()

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
      barometerId: barometer?.id,
    }),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: createReport,
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: [slug] })
      close()
      form.reset()
      showInfo(
        `Thank you! Your report was registered with ID ${id}. We will contact you at the provided email`,
      )
    },
    onError: err => showError(err.message),
  })
  return (
    <Modal
      size="xl"
      opened
      onClose={close}
      title={`Report Inaccuracy in ${barometer?.name ?? 'barometer'}`}
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
  )
}

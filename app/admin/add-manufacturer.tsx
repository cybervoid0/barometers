'use client'

import React from 'react'
import axios, { AxiosError } from 'axios'
import { Box, Button, TextInput, Title, Textarea, Modal, ActionIcon, Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { isLength } from 'validator'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconSquareRoundedPlus } from '@tabler/icons-react'
import { IManufacturer } from '@/models/manufacturer'
import { showError, showInfo } from '@/utils/notification'
import { manufacturersApiRoute } from '../constants'

export function AddManufacturer() {
  const [opened, { open, close }] = useDisclosure(false)

  const form = useForm<IManufacturer>({
    initialValues: {
      name: '',
      city: '',
      country: '',
      description: '',
    },
    validate: {
      name: val =>
        isLength(val, { min: 2, max: 100 })
          ? null
          : 'Name should be longer than 2 and shorter than 100 symbols',
      city: val =>
        isLength(val ?? '', { max: 100 }) ? null : 'City should be shorter that 100 symbols',
      country: val =>
        isLength(val ?? '', { max: 100 }) ? null : 'Country should be shorter that 100 symbols',
    },
  })
  const queryClient = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: (values: IManufacturer) =>
      axios
        .post(manufacturersApiRoute, values, {
          headers: { 'Content-Type': 'application/json' },
        })
        .then(({ data }) => data),
    onSuccess: ({ id }, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['manufacturers'],
      })
      form.reset()
      close()
      showInfo(`${variables.name} has been recorded as a manufacturer #${id ?? 0}`, 'Success')
    },
    onError: (error: AxiosError) => {
      showError(
        (error.response?.data as { message: string })?.message ||
          error.message ||
          'Error adding manufacturer',
      )
    },
  })
  return (
    <>
      <Modal opened={opened} onClose={close} centered>
        <Box
          flex={1}
          component="form"
          onSubmit={form.onSubmit((values, event) => {
            // prevent bubbling up to parent form
            event?.stopPropagation()
            mutate(values)
          })}
        >
          <Title mb="lg" order={3}>
            Add Manufacturer
          </Title>
          <TextInput id="manufacturer-name" required label="Name" {...form.getInputProps('name')} />
          <TextInput label="Country" {...form.getInputProps('country')} />
          <TextInput label="City" {...form.getInputProps('city')} />
          <Textarea
            autosize
            minRows={2}
            label="Description"
            {...form.getInputProps('description')}
          />
          <Button mt="lg" type="submit" color="dark" variant="outline">
            Add Manufacturer
          </Button>
        </Box>
      </Modal>

      <Tooltip color="dark.3" withArrow label="Add manufacturer">
        <ActionIcon onClick={open} variant="default">
          <IconSquareRoundedPlus color="grey" />
        </ActionIcon>
      </Tooltip>
    </>
  )
}

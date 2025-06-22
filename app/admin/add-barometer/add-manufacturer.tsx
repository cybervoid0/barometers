'use client'

import React, { useEffect, useCallback, useState } from 'react'
import {
  Box,
  Button,
  TextInput,
  Title,
  Textarea,
  Modal,
  ActionIcon,
  Tooltip,
  MultiSelect,
  FileButton,
  Group,
  CloseButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { isLength } from 'validator'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconSquareRoundedPlus, IconPhotoPlus, IconX } from '@tabler/icons-react'
import { showError, showInfo } from '@/utils/notification'
import { addManufacturer } from '@/utils/fetch'
import { useBarometers } from '@/app/hooks/useBarometers'
import { generateIcon } from '@/utils/misc'

interface AddManufacturerProps {
  onAddManufacturer: (newId: string) => void
}

interface Form {
  firstName: string
  name: string
  city: string
  countries: number[]
  description: string
  icon?: string | null
}

export function AddManufacturer({ onAddManufacturer }: AddManufacturerProps) {
  const { countries } = useBarometers()
  const [opened, { open, close }] = useDisclosure(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const form = useForm<Form>({
    initialValues: {
      firstName: '',
      name: '',
      city: '',
      countries: [],
      description: '',
      icon: null,
    },
    validate: {
      name: val =>
        isLength(val, { min: 2, max: 100 })
          ? null
          : 'Name should be longer than 2 and shorter than 100 symbols',
      firstName: val =>
        isLength(val ?? '', { max: 100 })
          ? null
          : 'First name should be longer than 2 and shorter than 100 symbols',
      city: val =>
        isLength(val ?? '', { max: 100 }) ? null : 'City should be shorter that 100 symbols',
    },
  })
  const queryClient = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: addManufacturer,
    onSuccess: ({ id }, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['manufacturers'],
      })
      form.reset()
      onAddManufacturer(id)
      close()
      showInfo(`${variables.name} has been recorded as a manufacturer #${id ?? 0}`, 'Success')
    },
    onError: error => {
      showError(error.message || 'Error adding manufacturer')
    },
  })

  useEffect(() => {
    if (opened) {
      form.reset()
      setSelectedFile(null)
      setPreviewUrl(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileSelect = useCallback((file: File | null) => {
    setSelectedFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }, [])

  const handleSubmit = useCallback(
    async (values: Form, event?: React.FormEvent) => {
      event?.stopPropagation()

      let iconData: string | null = null
      if (selectedFile) {
        const fileUrl = URL.createObjectURL(selectedFile)
        iconData = await generateIcon(fileUrl, 50)
        URL.revokeObjectURL(fileUrl)
      }

      mutate({
        ...values,
        countries: values.countries.map(id => ({ id })),
        icon: iconData,
      })
    },
    [mutate, selectedFile],
  )
  return (
    <>
      <Modal opened={opened} onClose={close} centered>
        <Box flex={1} component="form" onSubmit={form.onSubmit(handleSubmit)}>
          <Title mb="lg" order={3}>
            Add Manufacturer
          </Title>
          <TextInput label="First name" {...form.getInputProps('firstName')} />
          <TextInput id="manufacturer-name" required label="Name" {...form.getInputProps('name')} />
          <MultiSelect
            label="Countries"
            placeholder={form.values.countries.length === 0 ? 'Select countries' : undefined}
            data={countries.data?.map(({ id, name }) => ({
              value: String(id),
              label: name,
            }))}
            value={form.values.countries.map(String)}
            onChange={states =>
              form.setValues({
                countries: states.map(Number),
              })
            }
          />
          <TextInput label="City" {...form.getInputProps('city')} />
          <Textarea
            autosize
            minRows={2}
            label="Description"
            {...form.getInputProps('description')}
          />

          <Box>
            <Title order={6} mb="xs">
              Icon
            </Title>
            <Group align="flex-start">
              <FileButton onChange={handleFileSelect} accept="image/*">
                {props => (
                  <Button
                    {...props}
                    variant="outline"
                    color="dark.4"
                    leftSection={<IconPhotoPlus size={16} />}
                  >
                    Select Icon
                  </Button>
                )}
              </FileButton>

              {previewUrl && (
                <Box pos="relative">
                  <CloseButton
                    pos="absolute"
                    right={-8}
                    top={-8}
                    size="sm"
                    radius="xl"
                    bg="white"
                    c="dark.3"
                    onClick={() => handleFileSelect(null)}
                    icon={<IconX size={12} />}
                  />
                  <img
                    src={previewUrl}
                    alt="Icon preview"
                    className="h-12 w-12 rounded border object-cover"
                  />
                </Box>
              )}
            </Group>
          </Box>

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

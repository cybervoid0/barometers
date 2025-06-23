'use client'

import { useEffect, useCallback, useState } from 'react'
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
  CloseButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { isLength } from 'validator'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconSquareRoundedPlus, IconPhotoPlus } from '@tabler/icons-react'
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
      icon: val => (isLength(val ?? '', { min: 1 }) ? null : 'Icon should be selected'),
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened])

  const handleIconChange = useCallback(
    async (file: File | null) => {
      if (!file) {
        form.setFieldValue('icon', null)
        return
      }
      form.clearFieldError('icon')
      try {
        const fileUrl = URL.createObjectURL(file)
        const iconData = await generateIcon(fileUrl, 50)
        URL.revokeObjectURL(fileUrl)
        form.setFieldValue('icon', iconData)
      } catch (error) {
        form.setFieldValue('icon', null)
        form.setFieldError(
          'icon',
          error instanceof Error ? error.message : 'Image cannot be opened',
        )
      }
    },
    [form],
  )

  const handleSubmit = useCallback(
    async (values: Form) => {
      mutate({
        ...values,
        countries: values.countries.map(id => ({ id })),
      })
    },
    [mutate],
  )

  return (
    <>
      <Modal opened={opened} onClose={close} centered>
        <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
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
          <div className="mt-4 flex justify-between">
            <div className="flex items-end">
              <Button
                type="button"
                color="dark"
                variant="outline"
                onClick={() => form.onSubmit(handleSubmit)()}
              >
                Add Manufacturer
              </Button>
            </div>
            <IconUpload onFileChange={handleIconChange} errorMsg={form.errors.icon} />
          </div>
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

interface IconUploadProps {
  onFileChange: (file: File | null) => void
  errorMsg: React.ReactNode
}

const IconUpload = ({ onFileChange, errorMsg }: IconUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileSelect = (selectedFile: File | null) => {
    onFileChange(selectedFile)

    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <div className="flex flex-col items-end gap-1">
      {previewUrl && (
        <div className="relative w-fit">
          <CloseButton
            className="!absolute -right-2 -top-2 !rounded-full !bg-white"
            size="xs"
            onClick={() => handleFileSelect(null)}
            aria-label="Remove icon"
          />
          <img
            src={previewUrl}
            alt="Icon preview"
            className="h-12 w-12 rounded border object-cover"
          />
        </div>
      )}
      <div className="flex flex-col items-end gap-1">
        <FileButton onChange={handleFileSelect} accept="image/*">
          {props => (
            <Button
              {...props}
              variant="default"
              color="dark.4"
              leftSection={<IconPhotoPlus size={16} />}
            >
              Select Icon
            </Button>
          )}
        </FileButton>
        {errorMsg && <div className="text-xs text-red-500">{errorMsg}</div>}
      </div>
    </div>
  )
}

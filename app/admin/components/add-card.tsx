'use client'

import { Box, Title, Button, TextInput, Select, Textarea } from '@mantine/core'
import dayjs from 'dayjs'
import { useForm } from '@mantine/form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { isLength } from 'validator'
import { showInfo, showError } from '@/utils/notification'
import { useBarometers } from '@/app/hooks/useBarometers'
import { FileUpload } from './file-upload'
import { AddManufacturer } from './add-manufacturer'
import { Dimensions } from './dimensions'
import { type BarometerFormProps } from '../../types'
import { createBarometer } from '@/utils/fetch'
import { slug } from '@/utils/misc'

export function AddCard() {
  const { condition, categories, manufacturers } = useBarometers()

  const form = useForm<BarometerFormProps>({
    initialValues: {
      collectionId: '',
      name: '',
      categoryId: '',
      date: '',
      dateDescription: '',
      manufacturerId: '',
      conditionId: '',
      description: '',
      dimensions: [],
      images: [],
    },
    validate: {
      collectionId: val => (isLength(val, { max: 100 }) ? null : 'Too long catalogue ID (<100)'),
      name: val => (isLength(val, { max: 200 }) ? null : 'Too long name (<200)'),
      images: val => (val.length > 0 ? null : 'At least one image is required'),
    },
  })

  const queryClient = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: async (values: BarometerFormProps) => {
      const barometerWithImages = {
        ...values,
        date: dayjs(`${values.date}-01-01`).toISOString(),
        images: values.images.map((image, i) => ({
          url: image,
          order: i,
          name: values.name,
        })),
        slug: slug(values.name),
      }
      return createBarometer(barometerWithImages)
    },
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({
        queryKey: ['barometers'],
      })
      form.reset()
      showInfo(`Added ${id} to the database`)
    },
    onError: error => {
      showError(error.message || 'Error adding barometer')
    },
  })

  // set default barometer category
  useEffect(() => {
    if (categories.data.length === 0) return
    form.setFieldValue('categoryId', String(categories.data[0].id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.data])

  // set default barometer condition
  useEffect(() => {
    if (condition.data.length === 0) return
    form.setFieldValue('conditionId', String(condition.data.at(-1)?.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition.data])

  // set default manufacturer
  useEffect(() => {
    // if there are no manufacturers or manufacturer is already set, do nothing
    if (manufacturers.data.length === 0 || form.values.manufacturerId) return
    form.setFieldValue('manufacturerId', String(manufacturers.data[0].id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manufacturers.data])

  const onAddManufacturer = (id: string) => {
    form.setFieldValue('manufacturerId', id)
  }

  return (
    <Box mt="lg" flex={1}>
      <Title mb="lg" order={3} tt="capitalize">
        Add new barometer
      </Title>
      <Box component="form" onSubmit={form.onSubmit(values => mutate(values))}>
        <TextInput label="Catalogue No." required {...form.getInputProps('collectionId')} />
        <TextInput label="Title" required id="barometer-name" {...form.getInputProps('name')} />
        <TextInput
          label="Year"
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
        <TextInput required label="Date description" {...form.getInputProps('dateDescription')} />
        <Select
          data={categories.data.map(({ name, id }) => ({
            label: name,
            value: id,
          }))}
          label="Category"
          required
          allowDeselect={false}
          {...form.getInputProps('categoryId')}
        />
        <Select
          data={manufacturers.data.map(({ name, id }) => ({
            label: name,
            value: id,
          }))}
          label="Manufacturer"
          allowDeselect={false}
          leftSection={<AddManufacturer onAddManufacturer={onAddManufacturer} />}
          {...form.getInputProps('manufacturerId')}
          styles={{
            input: {
              paddingLeft: '2.5rem',
            },
          }}
        />
        <Select
          label="Condition"
          data={condition.data.map(({ name, id }) => ({
            label: name,
            value: id,
          }))}
          allowDeselect={false}
          {...form.getInputProps('conditionId')}
        />
        {/* Images upload */}
        <FileUpload
          fileNames={form.values.images}
          setFileNames={images => form.setFieldValue('images', images)}
          validateError={form.errors.images}
          clearValidateError={() => form.clearFieldError('images')}
        />
        {/* Dimensions */}
        <Dimensions form={form} />
        <Textarea label="Description" autosize minRows={2} {...form.getInputProps('description')} />
        <Button mt="lg" type="submit" variant="outline" color="dark">
          Add new barometer
        </Button>
      </Box>
    </Box>
  )
}

'use client'

import { Box, Title, Button, TextInput, Select, Textarea } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { isLength } from 'validator'
import { showInfo, showError } from '@/utils/notification'
import { useBarometers } from '@/app/hooks/useBarometers'
import { FileUpload } from './file-upload'
import { AddManufacturer } from './add-manufacturer'
import { Dimensions } from './dimensions'
import type { BarometerFormProps } from '../types'
import { barometersApiRoute } from '@/app/constants'

export function AddCard() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const { condition, types, manufacturers } = useBarometers()

  const form = useForm<BarometerFormProps>({
    initialValues: {
      collectionId: '',
      name: '',
      type: '',
      dating: '',
      manufacturer: '0',
      condition: '',
      description: '',
      dimensions: [],
    },
    validate: {
      collectionId: val => (isLength(val, { max: 100 }) ? null : 'Too long catalogue ID (<100)'),
      name: val => (isLength(val, { max: 200 }) ? null : 'Too long name (<200)'),
    },
  })

  const queryClient = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: async (values: BarometerFormProps) => {
      const barometerWithImages = {
        ...values,
        manufacturer: manufacturers.data.at(+values.manufacturer),
        images: uploadedImages.map(image => image.split('/').at(-1)),
      }
      const { data } = await axios.post(barometersApiRoute, barometerWithImages)
      return data
    },
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({
        queryKey: ['barometers'],
      })
      form.reset()
      setUploadedImages([])
      showInfo(`Added ${name} to the database`)
    },
    onError: (error: AxiosError) => {
      showError(
        (error.response?.data as { message: string })?.message ||
          error.message ||
          'Error adding barometer',
      )
    },
  })

  useEffect(() => {
    if (types.data.length === 0) return
    form.setFieldValue('type', String(types.data[0]._id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [types.data])

  useEffect(() => {
    if (condition.data.length === 0) return
    form.setFieldValue('condition', String(condition.data.at(-1)?._id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition.data])

  return (
    <Box mt="lg" flex={1}>
      <Title mb="lg" order={3} tt="capitalize">
        Add new barometer
      </Title>
      <Box component="form" onSubmit={form.onSubmit(values => mutate(values))}>
        <TextInput label="Catalogue No." required {...form.getInputProps('collectionId')} />
        <TextInput label="Title" required id="barometer-name" {...form.getInputProps('name')} />
        <TextInput label="Dating" key={form.key('dating')} {...form.getInputProps('dating')} />
        <Select
          data={types.data.map(({ name, _id }) => ({
            label: name,
            value: String(_id),
          }))}
          label="Type"
          required
          allowDeselect={false}
          {...form.getInputProps('type')}
        />
        <Select
          data={manufacturers.data.map(({ name }, i) => ({
            label: name,
            value: String(i),
          }))}
          label="Manufacturer"
          allowDeselect={false}
          /* отсюда открывать модальное окно с производителями */
          leftSection={<AddManufacturer />}
          {...form.getInputProps('manufacturer')}
          styles={{
            input: {
              paddingLeft: '2.5rem',
            },
          }}
        />
        <Select
          label="Condition"
          data={condition.data.map(({ name, _id }) => ({
            label: name,
            value: String(_id),
          }))}
          allowDeselect={false}
          {...form.getInputProps('condition')}
        />
        {/* Images upload */}
        <FileUpload fileNames={uploadedImages} setFileNames={setUploadedImages} />
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

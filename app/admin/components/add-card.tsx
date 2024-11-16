'use client'

import { useSWRConfig } from 'swr'
import { Box, Title, Button, TextInput, Select, Textarea } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useEffect, useState } from 'react'
import { isLength } from 'validator'
import { showInfo, showError } from '@/utils/notification'
import { FileUpload } from './file-upload'
import { AddManufacturer } from './add-manufacturer'
import { Dimensions } from './dimensions'
import type { BarometerFormProps } from '../types'
import { useBarometers } from '@/app/hooks/useBarometers'
import { createBarometer } from '@/actions/barometers'

export function AddCard() {
  const { mutate } = useSWRConfig()
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const { types, manufacturers, conditions } = useBarometers()

  const form = useForm<BarometerFormProps>({
    initialValues: {
      collectionId: '',
      name: '',
      type: '',
      dating: '',
      manufacturer: '',
      condition: '',
      description: '',
      dimensions: [],
    },
    validate: {
      collectionId: val => (isLength(val, { max: 100 }) ? null : 'Too long catalogue ID (<100)'),
      name: val => (isLength(val, { max: 200 }) ? null : 'Too long name (<200)'),
    },
  })

  const saveBarometer = async (values: BarometerFormProps) => {
    try {
      const barometerWithImages = {
        ...values,
        manufacturer: manufacturers?.find(({ _id }) => _id === values.manufacturer),
        images: uploadedImages.map(image => image.split('/').at(-1)),
      } as any
      await createBarometer(barometerWithImages)
      form.reset()
      setUploadedImages([])
      showInfo(`Added ${values.name} to the database`)
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error adding barometer')
    }
  }

  // set default barometer type
  useEffect(() => {
    if (types?.length === 0) return
    form.setFieldValue('type', String(types?.[0]._id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [types])

  // set default barometer condition
  useEffect(() => {
    if (conditions?.length === 0) return
    form.setFieldValue('condition', String(conditions?.at(-1)?._id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditions])

  // set default manufacturer
  useEffect(() => {
    // if there are no manufacturers or manufacturer is already set, do nothing
    if (manufacturers?.length === 0 || form.values.manufacturer) return
    form.setFieldValue('manufacturer', String(manufacturers?.[0]._id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manufacturers])

  const onAddManufacturer = (id: string) => {
    mutate('manufacturers')
    form.setFieldValue('manufacturer', id)
  }

  return (
    <Box mt="lg" flex={1}>
      <Title mb="lg" order={3} tt="capitalize">
        Add new barometer
      </Title>
      <Box component="form" onSubmit={form.onSubmit(values => saveBarometer(values))}>
        <TextInput label="Catalogue No." required {...form.getInputProps('collectionId')} />
        <TextInput label="Title" required id="barometer-name" {...form.getInputProps('name')} />
        <TextInput label="Dating" key={form.key('dating')} {...form.getInputProps('dating')} />
        <Select
          data={types?.map(({ name, _id }) => ({
            label: name,
            value: String(_id),
          }))}
          label="Type"
          required
          allowDeselect={false}
          {...form.getInputProps('type')}
        />
        <Select
          data={manufacturers?.map(({ name, _id }) => ({
            label: name,
            value: _id!,
          }))}
          label="Manufacturer"
          allowDeselect={false}
          leftSection={<AddManufacturer onAddManufacturer={onAddManufacturer} />}
          {...form.getInputProps('manufacturer')}
          styles={{
            input: {
              paddingLeft: '2.5rem',
            },
          }}
        />
        <Select
          label="Condition"
          data={conditions?.map(({ name, _id }) => ({
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

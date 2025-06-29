'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Modal,
  UnstyledButton,
  ActionIcon,
  UnstyledButtonProps,
  TextInput,
  Button,
  Tooltip,
  Box,
  Textarea,
  Title,
  Select,
  Group,
  MultiSelect,
  LoadingOverlay,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { isLength, isURL } from 'validator'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import type { BarometerDTO } from '@/app/types'
import { showError, showInfo } from '@/utils/notification'
import { FrontRoutes } from '@/utils/routes-front'
import { useBarometers } from '@/app/hooks/useBarometers'
import { deleteImage, updateBarometer, updateManufacturer } from '@/utils/fetch'
import { ManufacturerImageEdit } from './manufacturer-image-edit'
import { type ManufacturerForm } from './types'
import { getThumbnailBase64 } from '@/utils/misc'
import { imageStorage } from '@/utils/constants'

interface ManufacturerEditProps extends UnstyledButtonProps {
  size?: string | number | undefined
  barometer: BarometerDTO
}

const initialValues: ManufacturerForm = {
  id: '',
  name: '',
  firstName: '',
  city: '',
  countries: [],
  url: '',
  description: '',
  successors: [],
  images: [],
}
export function ManufacturerEdit({
  size = 18,
  barometer,
  ...props
}: ManufacturerEditProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { manufacturers, countries } = useBarometers()
  const [selectedManufacturerIndex, setSelectedManufacturerIndex] =
    useState<number>(0)
  const currentBrand = useMemo(
    () => manufacturers.data[selectedManufacturerIndex],
    [manufacturers.data, selectedManufacturerIndex],
  )
  const brandImages = useMemo(
    () => currentBrand?.images?.map(({ url }) => url),
    [currentBrand?.images],
  )
  const form = useForm<ManufacturerForm>({
    initialValues,
    validate: {
      name: val =>
        isLength(val ?? '', { min: 2, max: 100 })
          ? null
          : 'Name should be longer than 2 and shorter than 100 symbols',
      city: val =>
        isLength(val ?? '', { max: 100 })
          ? null
          : 'City should be shorter that 100 symbols',
      url: val =>
        val === '' || isURL(val ?? '') ? null : 'Must be a valid URL',
    },
  })

  const [opened, { open, close }] = useDisclosure()
  const onClose = async () => {
    // delete unused files from storage
    try {
      setIsLoading(true)
      const extraImages = form.values.images.filter(
        img => !brandImages?.includes(img),
      )
      await Promise.all(extraImages.map(deleteImage))
    } catch {
      // do nothing
    } finally {
      setIsLoading(false)
      close()
    }
  }

  // Reset selected manufacturer index
  const resetManufacturerIndex = useCallback(() => {
    const manufacturerIndex = manufacturers.data.findIndex(
      ({ id }) => id === barometer.manufacturer.id,
    )
    setSelectedManufacturerIndex(manufacturerIndex)
  }, [barometer.manufacturer.id, manufacturers.data])

  // Reset selected manufacturer index when modal is opened
  useEffect(() => {
    if (!opened) return
    resetManufacturerIndex()
    form.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, resetManufacturerIndex])

  // Set form values when selected manufacturer index changes
  useEffect(() => {
    // pick all manufacturer fields and put empty string if not present
    const manufacturerFormData = {
      id: currentBrand?.id ?? '',
      name: currentBrand?.name ?? '',
      firstName: currentBrand?.firstName ?? '',
      city: currentBrand?.city ?? '',
      countries: currentBrand?.countries?.map(({ id }) => id) ?? [],
      description: currentBrand?.description ?? '',
      url: currentBrand?.url ?? '',
      successors: currentBrand?.successors?.map(({ id }) => id) ?? [],
      images: currentBrand?.images?.map(({ url }) => url) ?? [],
    } satisfies ManufacturerForm
    form.setValues(manufacturerFormData)
    form.resetDirty(manufacturerFormData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedManufacturerIndex, manufacturers])

  const update = useCallback(
    async (formValues: ManufacturerForm) => {
      setIsLoading(true)
      try {
        // erase deleted images
        const extraFiles = brandImages?.filter(
          url => !formValues.images.includes(url),
        )
        if (extraFiles)
          await Promise.all(
            extraFiles?.map(async file => {
              try {
                await deleteImage(file)
              } catch {
                // don't mind if it was not possible to delete the file
              }
            }),
          )

        const updatedBarometer = {
          id: barometer.id,
          manufacturerId: currentBrand.id,
        }
        const updatedManufacturer = {
          ...formValues,
          successors: formValues.successors.map(id => ({ id })),
          countries: formValues.countries.map(id => ({ id })),
          images: await Promise.all(
            formValues.images.map(async (url, i) => {
              const blurData = await getThumbnailBase64(imageStorage + url)
              return {
                url,
                order: i,
                name: barometer.name,
                blurData,
              }
            }),
          ),
        }
        const [{ slug }, { name }] = await Promise.all([
          updateBarometer(updatedBarometer),
          updateManufacturer(updatedManufacturer),
        ])
        showInfo(`${name} updated`, 'Success')
        close()
        window.location.href = FrontRoutes.Barometer + (slug ?? '')
      } catch (error) {
        showError(
          error instanceof Error
            ? error.message
            : 'Error updating manufacturer',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [barometer.id, barometer.name, brandImages, close, currentBrand?.id],
  )

  return (
    <>
      <Modal pos="relative" opened={opened} onClose={onClose} centered>
        <LoadingOverlay visible={isLoading} zIndex={100} />
        <Box flex={1} component="form" onSubmit={form.onSubmit(update)}>
          <Group mb="lg" align="center">
            <Title order={3}>Edit Manufacturer</Title>
            <Tooltip label="Delete manufacturer">
              <ActionIcon
                variant="outline"
                color="dark"
                onClick={() => manufacturers.delete(currentBrand?.slug)}
              >
                <IconTrash />
              </ActionIcon>
            </Tooltip>
          </Group>
          <Select
            value={String(selectedManufacturerIndex)}
            data={manufacturers.data.map(({ name }, i) => ({
              value: String(i),
              label: name,
            }))}
            label="Manufacturer"
            onChange={index => setSelectedManufacturerIndex(Number(index))}
          />
          <TextInput label="First name" {...form.getInputProps('firstName')} />
          <TextInput
            id="manufacturer-name"
            required
            label="Name / Company name"
            {...form.getInputProps('name')}
          />
          <MultiSelect
            label="Countries"
            placeholder={
              form.values.countries.length === 0
                ? 'Select countries'
                : undefined
            }
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
          <TextInput label="External URL" {...form.getInputProps('url')} />
          <MultiSelect
            label="Successors"
            placeholder="Select brands"
            data={manufacturers.data.map(({ name, id }) => ({
              value: id,
              label: name,
            }))}
            value={form.values.successors}
            onChange={successors => form.setValues({ successors })}
          />
          <ManufacturerImageEdit
            imageUrls={brandImages}
            form={form}
            setLoading={setIsLoading}
          />
          <Textarea
            autosize
            minRows={2}
            label="Description"
            {...form.getInputProps('description')}
          />
          <Button
            fullWidth
            mt="lg"
            type="submit"
            color="dark"
            variant="outline"
          >
            Update
          </Button>
        </Box>
      </Modal>
      <Tooltip label="Edit manufacturer">
        <UnstyledButton {...props} onClick={open}>
          <IconEdit color="brown" size={size} />
        </UnstyledButton>
      </Tooltip>
    </>
  )
}

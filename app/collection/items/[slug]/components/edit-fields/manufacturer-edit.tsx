'use client'

import { useCallback, useEffect, useState } from 'react'
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
} from '@mantine/core'
import axios, { AxiosError } from 'axios'
import { useDisclosure } from '@mantine/hooks'
import { isLength } from 'validator'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import type { BarometerDTO, ManufacturerDTO } from '@/app/types'
import { showError, showInfo } from '@/utils/notification'
import { barometerRoute, barometersApiRoute } from '@/app/constants'
import { useBarometers } from '@/app/hooks/useBarometers'

interface ManufacturerEditProps extends UnstyledButtonProps {
  size?: string | number | undefined
  barometer: BarometerDTO
}
type ManufacturerForm = Partial<NonNullable<ManufacturerDTO>>
export function ManufacturerEdit({ size = 18, barometer, ...props }: ManufacturerEditProps) {
  const { manufacturers } = useBarometers()
  const [selectedManufacturerIndex, setSelectedManufacturerIndex] = useState<number>(0)
  const form = useForm<ManufacturerForm>({
    initialValues: {
      name: '',
      city: '',
      country: '',
      description: '',
    },
    validate: {
      name: val =>
        isLength(val ?? '', { min: 2, max: 100 })
          ? null
          : 'Name should be longer than 2 and shorter than 100 symbols',
      city: val =>
        isLength(val ?? '', { max: 100 }) ? null : 'City should be shorter that 100 symbols',
      country: val =>
        isLength(val ?? '', { max: 100 }) ? null : 'Country should be shorter that 100 symbols',
    },
  })

  const [opened, { open, close }] = useDisclosure()

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
  }, [opened, resetManufacturerIndex])

  // Set form values when selected manufacturer index changes
  useEffect(() => {
    const selectedManufacturer = manufacturers?.data[selectedManufacturerIndex]
    // pick all manufacturer fields and put empty string if not present
    const manufacturerFormData = {
      id: selectedManufacturer.id,
      name: selectedManufacturer.name,
      city: selectedManufacturer.city,
      country: selectedManufacturer.country,
      description: selectedManufacturer.description,
    } as ManufacturerForm
    form.setValues(manufacturerFormData)
    form.resetDirty(manufacturerFormData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedManufacturerIndex, manufacturers])

  const update = async (manufacturer: ManufacturerForm) => {
    try {
      const selectedManufacturer = manufacturers.data[selectedManufacturerIndex]
      const updatedBarometer = {
        ...barometer,
        manufacturer: {
          ...selectedManufacturer,
          ...manufacturer,
        },
      }
      const { data } = await axios.put(barometersApiRoute, updatedBarometer)
      showInfo(`${manufacturer.name} updated`, 'Success')
      close()
      window.location.href = barometerRoute + (data.slug ?? '')
    } catch (error) {
      if (error instanceof AxiosError) {
        showError(
          (error.response?.data as { message: string })?.message ||
            error.message ||
            'Error updating barometer',
        )
      }
    }
  }

  return (
    <>
      <Modal opened={opened} onClose={close} centered>
        <Box flex={1} component="form" onSubmit={form.onSubmit(update)}>
          <Group mb="lg" align="center">
            <Title order={3}>Edit Manufacturer</Title>
            <Tooltip label="Delete manufacturer">
              <ActionIcon
                variant="outline"
                color="dark"
                onClick={() =>
                  manufacturers.delete(manufacturers.data[selectedManufacturerIndex].id)
                }
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
          <TextInput id="manufacturer-name" required label="Name" {...form.getInputProps('name')} />
          <TextInput label="Country" {...form.getInputProps('country')} />
          <TextInput label="City" {...form.getInputProps('city')} />
          <Textarea
            autosize
            minRows={2}
            label="Description"
            {...form.getInputProps('description')}
          />
          <Button fullWidth mt="lg" type="submit" color="dark" variant="outline">
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

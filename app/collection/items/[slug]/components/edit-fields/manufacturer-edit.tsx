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
import { useDisclosure } from '@mantine/hooks'
import { isLength } from 'validator'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { IBarometer } from '@/models/barometer'
import { IManufacturer } from '@/models/manufacturer'
import { showError, showInfo } from '@/utils/notification'
import { barometerRoute } from '@/app/constants'
import { useBarometers } from '@/app/hooks/useBarometers'
import { deleteManufacturer } from '@/actions/manufacturers'
import { updateBarometer } from '@/actions/barometers'

interface ManufacturerEditProps extends UnstyledButtonProps {
  size?: string | number | undefined
  barometer: IBarometer
}

export function ManufacturerEdit({ size = 18, barometer, ...props }: ManufacturerEditProps) {
  const { manufacturers } = useBarometers()
  const [selectedManufacturerIndex, setSelectedManufacturerIndex] = useState<number>(0)
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

  const [opened, { open, close }] = useDisclosure()

  // Reset selected manufacturer index
  const resetManufacturerIndex = useCallback(() => {
    const manufacturerIndex = manufacturers?.findIndex(
      ({ _id }) => _id === barometer.manufacturer?._id,
    )
    setSelectedManufacturerIndex(manufacturerIndex ?? 0)
  }, [barometer.manufacturer?._id, manufacturers])

  // Reset selected manufacturer index when modal is opened
  useEffect(() => {
    if (!opened) return
    resetManufacturerIndex()
  }, [opened, resetManufacturerIndex])

  // Set form values when selected manufacturer index changes
  useEffect(() => {
    const selectedManufacturer = manufacturers?.[selectedManufacturerIndex]
    // pick all manufacturer fields and put empty string if not present
    const manufacturerFormData: IManufacturer = {
      _id: selectedManufacturer?._id ?? '',
      name: selectedManufacturer?.name ?? '',
      city: selectedManufacturer?.city ?? '',
      country: selectedManufacturer?.country ?? '',
      description: selectedManufacturer?.description ?? '',
    }
    form.setValues(manufacturerFormData)
    form.resetDirty(manufacturerFormData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedManufacturerIndex, manufacturers])

  const update = async (manufacturer: IManufacturer) => {
    try {
      const selectedManufacturer = manufacturers?.[selectedManufacturerIndex]
      const updatedBarometer = {
        ...barometer,
        manufacturer: {
          ...selectedManufacturer,
          ...manufacturer,
        },
      }
      const slug = await updateBarometer(updatedBarometer)
      showInfo(`${manufacturer.name} updated`, 'Success')
      close()
      window.location.href = barometerRoute + slug
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error updating manufacturer')
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
                onClick={() => deleteManufacturer(manufacturers?.[selectedManufacturerIndex]._id!)}
              >
                <IconTrash />
              </ActionIcon>
            </Tooltip>
          </Group>
          <Select
            value={String(selectedManufacturerIndex)}
            data={manufacturers?.map(({ name }, i) => ({
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

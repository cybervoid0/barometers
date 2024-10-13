'use client'

import { useEffect } from 'react'
import {
  Modal,
  UnstyledButton,
  UnstyledButtonProps,
  TextInput,
  Button,
  Tooltip,
  Box,
  Textarea,
  Title,
} from '@mantine/core'
import axios, { AxiosError } from 'axios'
import { useDisclosure } from '@mantine/hooks'
import { isLength } from 'validator'
import { IconEdit } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { IBarometer } from '@/models/barometer'
import { IManufacturer } from '@/models/manufacturer'
import { showError, showInfo } from '@/utils/notification'
import { barometerRoute, barometersApiRoute } from '@/app/constants'

interface ManufacturerEditProps extends UnstyledButtonProps {
  size?: string | number | undefined
  barometer: IBarometer
}

export function ManufacturerEdit({ size = 18, barometer, ...props }: ManufacturerEditProps) {
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

  const update = async (manufacturer: IManufacturer) => {
    try {
      const updatedBarometer = {
        ...barometer,
        manufacturer: {
          ...barometer.manufacturer,
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

  // set initial form values after modal is opened
  useEffect(() => {
    if (barometer) {
      const { manufacturer } = barometer
      const validManufacturer = {
        name: manufacturer?.name || '',
        city: manufacturer?.city || '',
        country: manufacturer?.country || '',
        description: manufacturer?.description || '',
      }
      form.setValues(validManufacturer)
      form.resetDirty(validManufacturer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barometer])

  // Reset form when modal is reopened
  useEffect(() => {
    if (opened) form.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened])
  return (
    <>
      <Modal opened={opened} onClose={close} centered>
        <Box flex={1} component="form" onSubmit={form.onSubmit(update)}>
          <Title mb="lg" order={3}>
            Edit Manufacturer
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

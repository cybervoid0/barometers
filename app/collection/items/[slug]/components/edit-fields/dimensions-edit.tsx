'use client'

/* eslint-disable react-hooks/exhaustive-deps */

import { isEqual } from 'lodash'
import { useEffect } from 'react'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import axios, { AxiosError } from 'axios'
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Modal,
  Stack,
  TextInput,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import { IconEdit, IconTrash, IconSquareRoundedPlus } from '@tabler/icons-react'
import { BarometerDTO, Dimensions } from '@/app/types'
import { barometerRoute, barometersApiRoute } from '@/app/constants'
import { showError, showInfo } from '@/utils/notification'

interface DimFormProps {
  dimensions: Dimensions
}
interface DimensionEditProps {
  barometer: BarometerDTO
}

export default function DimensionEdit({ barometer }: DimensionEditProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const form = useForm<DimFormProps>({
    initialValues: {
      dimensions: [],
    },
  })
  // set initial form values on modal open
  useEffect(() => {
    const dimensions = barometer.dimensions as Dimensions | undefined
    if (!dimensions) return
    form.setValues({ dimensions })
    form.resetDirty({ dimensions })
  }, [barometer])
  // Reset form when modal is reopened
  useEffect(() => {
    if (opened) form.reset()
  }, [opened])

  const updateBarometer = async ({ dimensions }: DimFormProps) => {
    try {
      if (isEqual(dimensions, barometer.dimensions)) {
        close()
        return
      }
      const updatedBarometer: BarometerDTO = {
        ...barometer,
        // keep non-empty entries
        dimensions: dimensions?.filter(({ dim }) => dim),
      }
      const { data } = await axios.put(barometersApiRoute, updatedBarometer)
      showInfo(`${barometer.name} updated`, 'Success')
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
  const addDimension = () => {
    if ((form.values.dimensions?.length ?? 0) > 6) return
    form.insertListItem('dimensions', { dim: '', value: '' })
  }

  const removeDimension = (index: number) => {
    form.removeListItem('dimensions', index)
  }
  return (
    <>
      <Tooltip label="Edit dimensions">
        <UnstyledButton onClick={open}>
          <IconEdit color="brown" size={18} />
        </UnstyledButton>
      </Tooltip>
      <Modal
        centered
        opened={opened}
        onClose={close}
        title="Edit dimensions"
        size="md"
        tt="capitalize"
        styles={{ title: { fontSize: '1.5rem', fontWeight: 500 } }}
      >
        <Box component="form" onSubmit={form.onSubmit(updateBarometer)}>
          <Stack>
            <Stack gap="xs" align="flex-start">
              {form.values.dimensions?.map((_, i) => (
                <Group w="100%" wrap="nowrap" gap="xs" key={form.key(`dimensions.${i}`)}>
                  <Tooltip color="dark.3" withArrow label="Delete parameter">
                    <ActionIcon variant="default" onClick={() => removeDimension(i)}>
                      <IconTrash color="grey" size={20} />
                    </ActionIcon>
                  </Tooltip>
                  <TextInput
                    flex={1}
                    placeholder="Unit"
                    {...form.getInputProps(`dimensions.${i}.dim`)}
                  />
                  <TextInput
                    flex={1}
                    placeholder="Value"
                    {...form.getInputProps(`dimensions.${i}.value`)}
                  />
                </Group>
              ))}
              <Tooltip color="dark.3" withArrow label="Add parameter">
                <ActionIcon variant="default" onClick={addDimension}>
                  <IconSquareRoundedPlus color="grey" />
                </ActionIcon>
              </Tooltip>
            </Stack>
            <Button fullWidth color="dark.4" variant="outline" type="submit">
              Save
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  )
}

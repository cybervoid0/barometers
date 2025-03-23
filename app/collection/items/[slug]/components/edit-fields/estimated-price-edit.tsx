/* eslint-disable react-hooks/exhaustive-deps */

'use client'

import {
  Modal,
  UnstyledButton,
  UnstyledButtonProps,
  TextInput,
  Button,
  Stack,
  Tooltip,
  Box,
  Center,
} from '@mantine/core'
import { isDecimal } from 'validator'
import { IconEdit } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { useCallback, useEffect } from 'react'
import { BarometerDTO } from '@/app/types'
import { updateBarometer } from '@/utils/fetch'
import { showError, showInfo } from '@/utils/notification'
import { barometerRoute } from '@/utils/routes-front'

interface Props extends UnstyledButtonProps {
  size?: string | number | undefined
  barometer: BarometerDTO
}

const property: keyof BarometerDTO = 'estimatedPrice'

export function EstimatedPriceEdit({ size = 18, barometer, ...props }: Props) {
  const form = useForm({
    initialValues: { estimatedPrice: '' },
    validate: {
      estimatedPrice: value => (isDecimal(value) ? null : 'Wrong decimal number'),
    },
  })
  const [opened, { open, close }] = useDisclosure(false)

  const update = useCallback(
    async ({ estimatedPrice }: typeof form.values) => {
      const newEstimatedPrice = Number(estimatedPrice)
      try {
        if (newEstimatedPrice === barometer.estimatedPrice) {
          close()
          return
        }

        const { slug } = await updateBarometer({
          id: barometer.id,
          estimatedPrice: newEstimatedPrice,
        })

        showInfo(`${barometer.name} updated`, 'Success')
        close()
        window.location.href = barometerRoute + (slug ?? '')
      } catch (error) {
        showError(error instanceof Error ? error.message : 'Error updating barometer')
      }
    },
    [barometer.estimatedPrice, barometer.id, barometer.name, close, form],
  )

  // set initial form values on modal open
  useEffect(() => {
    const estimatedPriceValue = barometer.estimatedPrice
    if (estimatedPriceValue !== null && estimatedPriceValue !== undefined) {
      form.setValues({ estimatedPrice: String(estimatedPriceValue) })
      form.resetDirty({ estimatedPrice: String(estimatedPriceValue) })
    }
  }, [barometer])

  // Reset form when modal is reopened
  useEffect(() => {
    if (opened) form.reset()
  }, [opened])
  return (
    <>
      <Tooltip label="Edit Estimated Price">
        <UnstyledButton {...props} onClick={open}>
          <Center>
            <IconEdit color="brown" size={size} />
          </Center>
        </UnstyledButton>
      </Tooltip>
      <Modal
        centered
        opened={opened}
        onClose={close}
        title="Edit Estimated Price"
        size="md"
        tt="capitalize"
        styles={{ title: { fontSize: '1.5rem', fontWeight: 500 } }}
      >
        <Box component="form" onSubmit={form.onSubmit(update)}>
          <Stack>
            <TextInput leftSection="€" required {...form.getInputProps(property)} />
            <Button fullWidth color="dark" variant="outline" type="submit">
              Save
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  )
}

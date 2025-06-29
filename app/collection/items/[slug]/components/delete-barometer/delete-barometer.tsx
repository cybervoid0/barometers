'use client'

import React from 'react'
import { Button, ActionIcon, ActionIconProps, Group, Modal, Text, Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/navigation'
import { IconTrash } from '@tabler/icons-react'
import { BarometerDTO } from '@/app/types'
import { deleteBarometer } from '@/utils/fetch'
import { showError, showInfo } from '@/utils/notification'
import { FrontRoutes } from '@/utils/routes-front'
import { IsAdmin } from '@/app/components/is-admin'

interface Props extends ActionIconProps {
  barometer: BarometerDTO
}

export function DeleteBarometer({ barometer, ...props }: Props) {
  const [opened, { open, close }] = useDisclosure(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      const { message } = await deleteBarometer(barometer.slug)
      showInfo(message, 'Success')
      close()
      router.replace(FrontRoutes.Categories + barometer.category.name)
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error deleting barometer')
    }
  }
  return (
    <IsAdmin>
      <Tooltip tt="capitalize" label={`Delete ${barometer.name}`}>
        <ActionIcon {...props} onClick={open} className="!bg-orange-800 hover:!bg-orange-900">
          <IconTrash />
        </ActionIcon>
      </Tooltip>
      <Modal
        centered
        opened={opened}
        onClose={close}
        title={`Delete ${barometer.name}`}
        size="md"
        tt="capitalize"
        styles={{ title: { fontSize: '1.5rem', fontWeight: 500 } }}
      >
        <div className="transform-none indent-4 font-medium leading-tight text-red-700">
          <p>Are you sure you want to completely remove {barometer.name} from the database?</p>
          <p>This action cannot be undone.</p>
        </div>

        <Group mt="lg" justify="flex-end">
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button variant="filled" onClick={handleDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </IsAdmin>
  )
}

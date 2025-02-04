'use client'

import React from 'react'
import { Button, ActionIcon, ActionIconProps, Group, Modal, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/navigation'
import { IconTrash } from '@tabler/icons-react'
import { BarometerDTO } from '@/app/types'
import { deleteBarometer } from '@/utils/fetch'
import { showError, showInfo } from '@/utils/notification'
import sx from './styles.module.scss'
import { categoriesRoute } from '@/utils/routes-front'
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
      router.replace(categoriesRoute + barometer.category.name)
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error deleting barometer')
    }
  }
  return (
    <IsAdmin>
      <ActionIcon {...props} onClick={open} className={sx.deleteButton}>
        <IconTrash />
      </ActionIcon>
      <Modal
        centered
        opened={opened}
        onClose={close}
        title={`Delete ${barometer.name}`}
        size="md"
        tt="capitalize"
        styles={{ title: { fontSize: '1.5rem', fontWeight: 500 } }}
      >
        <Text className={sx.warning}>
          Are you sure you want to completely remove {barometer.name} from the database?
        </Text>
        <Text className={sx.warning}>This action cannot be undone.</Text>
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

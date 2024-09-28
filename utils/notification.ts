import { notifications } from '@mantine/notifications'

export const showError = (message: string, title?: string) =>
  notifications.show({
    title: title || 'Error',
    message,
    withBorder: true,
    position: 'top-center',
    color: 'red',
    bg: 'red.0',
  })
export const showInfo = (message: string, title?: string) =>
  notifications.show({
    title: title || 'Info',
    position: 'top-center',
    withBorder: true,
    message,
    color: 'green',
    bg: 'green.0',
  })

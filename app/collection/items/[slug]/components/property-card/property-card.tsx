import { Group, Center, Stack, Title, Text } from '@mantine/core'
import { ReactNode, FC, ReactElement } from 'react'
import { IsAdmin } from '@/app/components/is-admin'
import sx from './styles.module.scss'

interface PropertyCardProps {
  id?: string | number
  icon: ReactElement
  title: string
  content: ReactNode
  /**
   * Button which invokes editing dialog windows. Shown only to admins
   */
  edit?: ReactNode
  /**
   * Component is only shown to logged in administrators
   */
  adminOnly?: boolean
}
const Card: FC<PropertyCardProps> = ({ content, icon, title, edit }) => (
  <Group className={sx.card}>
    <Center className={sx.icon}>{icon}</Center>
    <Stack className={sx.stack}>
      <Title order={3} className={sx.title}>
        {title}
      </Title>
      {typeof content === 'object' ? content : <Text size="sm">{content}</Text>}
    </Stack>
    {edit && (
      <IsAdmin>
        <Center>{edit}</Center>
      </IsAdmin>
    )}
  </Group>
)

export const PropertyCard: FC<PropertyCardProps> = ({ adminOnly, ...props }) => {
  // if content is missing, display only to admins to be able to add data
  if (!props.content)
    return (
      <IsAdmin>
        <Card {...props} />
      </IsAdmin>
    )
  return adminOnly ? (
    <IsAdmin>
      <Card {...props} />
    </IsAdmin>
  ) : (
    <Card {...props} />
  )
}

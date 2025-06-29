import { Group, Center, Stack, Title, Text, GridCol } from '@mantine/core'
import { ReactNode, FC } from 'react'
import { type IconProps } from '@tabler/icons-react'
import { IsAdmin } from '@/app/components/is-admin'

interface PropertyCardProps {
  id?: string | number
  icon: FC<IconProps>
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
const Card: FC<PropertyCardProps> = ({ content, icon: Icon, title, edit }) => (
  <GridCol
    span={{ base: 12, sm: 6, lg: 4 }}
    className="max-w-[450px] overflow-hidden"
  >
    <Group className="h-full flex-nowrap justify-center rounded-sm bg-gray-50 p-3">
      <Center className="h-[60px] w-[60px] flex-shrink-0 rounded-sm bg-gradient-to-b from-white to-gray-50">
        <Icon width={35} height={35} title={title} strokeWidth={1.2} />
      </Center>
      <Stack className="flex-grow gap-1">
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
        {typeof content === 'object' ? (
          content
        ) : (
          <Text size="sm">{content}</Text>
        )}
      </Stack>
      {edit && (
        <IsAdmin>
          <Center>{edit}</Center>
        </IsAdmin>
      )}
    </Group>
  </GridCol>
)

export const PropertyCard: FC<PropertyCardProps> = ({
  adminOnly,
  ...props
}) => {
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

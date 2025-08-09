import { ReactNode, FC, ComponentProps } from 'react'
import { type IconProps } from '@tabler/icons-react'
import { IsAdmin } from '@/app/components/is-admin'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PropertyCardProps extends ComponentProps<'div'> {
  icon: FC<IconProps>
  title: string
  /**
   * Button which invokes editing dialog windows. Shown only to admins
   */
  edit?: ReactNode
  /**
   * Component is only shown to logged in administrators
   */
  adminOnly?: boolean
}

function PropertyCardCore({
  children,
  className,
  icon: Icon,
  title,
  edit,
  ...props
}: PropertyCardProps) {
  return (
    <Card
      className={cn(
        className,
        'flex h-full min-h-20 flex-row flex-nowrap justify-center gap-0 overflow-hidden bg-secondary py-0',
        'bg-gradient-to-b from-card-gradient-from to-card-gradient-to',
      )}
      {...props}
    >
      <div className="m-2 flex shrink-0 items-center justify-center rounded-md bg-card px-2">
        <Icon width={35} height={35} title={title} strokeWidth={1.2} />
      </div>
      <div className="flex grow flex-col justify-center gap-2 py-2">
        <h4 className="text-lg leading-none tracking-normal text-muted-foreground">{title}</h4>
        {typeof children === 'object' ? (
          children
        ) : (
          <p className="text-sm leading-none">{children}</p>
        )}
      </div>
      {edit && (
        <IsAdmin>
          <div className="flex items-center justify-center p-2">{edit}</div>
        </IsAdmin>
      )}
    </Card>
  )
}

export const PropertyCard: FC<PropertyCardProps> = ({ adminOnly, ...props }) => {
  // if content is missing, display only to admins to be able to add data
  if (!props.children)
    return (
      <IsAdmin>
        <PropertyCardCore {...props} />
      </IsAdmin>
    )
  return adminOnly ? (
    <IsAdmin>
      <PropertyCardCore {...props} />
    </IsAdmin>
  ) : (
    <PropertyCardCore {...props} />
  )
}

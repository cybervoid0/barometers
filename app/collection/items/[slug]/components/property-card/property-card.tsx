import { ReactNode, FC, ComponentProps } from 'react'
import { type LucideProps } from 'lucide-react'
import { IsAdmin } from '@/components/is-admin'
import { Card } from '@/components/ui'
import { cn } from '@/utils'

interface PropertyCardProps extends ComponentProps<'div'> {
  icon: FC<LucideProps>
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
        'bg-secondary flex h-full min-h-20 flex-row flex-nowrap justify-center gap-0 overflow-hidden py-0',
        'from-card-gradient-from to-card-gradient-to bg-linear-to-b',
      )}
      {...props}
    >
      <div className="bg-card m-2 flex shrink-0 items-center justify-center rounded-md px-2">
        <Icon width={35} height={35} aria-label={title} strokeWidth={1.2} />
      </div>
      <div className="flex grow flex-col justify-center gap-2 py-2">
        <h4 className="text-muted-foreground text-lg leading-none tracking-normal">{title}</h4>
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

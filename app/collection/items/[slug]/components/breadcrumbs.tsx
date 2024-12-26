import Link from 'next/link'
import { Breadcrumbs, Anchor, Text } from '@mantine/core'
import { categoriesRoute } from '@/app/constants'

interface BreadcrumbsComponentProps {
  type: string
  catId: string
}

export function BreadcrumbsComponent({ type, catId, ...props }: BreadcrumbsComponentProps) {
  const breadcrumbs = [
    { title: 'Home', href: '/' },
    {
      title: type.toLowerCase(),
      href: categoriesRoute + type.toLowerCase(),
    },
    { title: catId },
  ]

  return (
    <Breadcrumbs
      separator="→"
      {...props}
      mt={{ base: 'sm', sm: 'xl' }}
      mb={{ base: 'none', sm: '2rem' }}
    >
      {breadcrumbs.map(({ href, title }, i) =>
        href ? (
          <Anchor
            size="lg"
            fw={{ base: 500, sm: 400 }}
            c="dark.4"
            key={i}
            component={Link}
            href={href}
            underline="hover"
          >
            {title}
          </Anchor>
        ) : (
          <Text key={i} fw={600}>
            {title}
          </Text>
        ),
      )}
    </Breadcrumbs>
  )
}

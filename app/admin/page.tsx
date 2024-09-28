import { FC } from 'react'
import { Flex } from '@mantine/core'
import { AddCard } from './add-card'
import { AddManufacturer } from './add-manufacturer'

export const Admin: FC = () => {
  return (
    <Flex mt="lg" gap="lg" direction={{ base: 'column', xs: 'row' }}>
      <AddCard />
      <AddManufacturer />
    </Flex>
  )
}
export default Admin

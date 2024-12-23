import { ReactNode } from 'react'
import {
  Box,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  Title,
  UnstyledButton,
  Text,
} from '@mantine/core'
import { IconInfoSquareRounded } from '@tabler/icons-react'
import { ConditionListDTO } from '@/app/types'
import sx from '../styles.module.scss'

interface ConditionProps {
  condition: ConditionListDTO[number]
  editButton: ReactNode
}

export function Condition({ condition, editButton }: ConditionProps) {
  return (
    <Box w="fit-content" pos="relative">
      <Title className={sx.heading} order={3}>
        Condition:&nbsp;
      </Title>
      <Title c="dark.3" fw={400} display="inline" order={4}>
        {condition.name}
        {editButton}
      </Title>
      <Popover width={200} position="bottom" offset={0} withArrow shadow="md">
        <PopoverTarget>
          <UnstyledButton pos="absolute" right={-18}>
            <IconInfoSquareRounded color="#696969" size={18} stroke={1.3} />
          </UnstyledButton>
        </PopoverTarget>
        <PopoverDropdown>
          <Text fw={500} size="xs">
            {condition.description}
          </Text>
        </PopoverDropdown>
      </Popover>
    </Box>
  )
}

import { Box, Popover, PopoverDropdown, PopoverTarget, UnstyledButton, Text } from '@mantine/core'
import { IconInfoSquareRounded } from '@tabler/icons-react'
import { ConditionListDTO } from '@/app/types'

interface ConditionProps {
  condition: ConditionListDTO[number]
}

export function Condition({ condition }: ConditionProps) {
  return (
    <Box w="fit-content" pos="relative">
      <Text size="sm" display="inline">
        {condition.name}
      </Text>
      <Popover width={200} position="bottom" offset={0} withArrow shadow="md">
        <PopoverTarget>
          <UnstyledButton pos="absolute" right={-16}>
            <IconInfoSquareRounded color="#696969" size={16} stroke={1.3} />
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

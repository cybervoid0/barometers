import {
  Fieldset,
  TextInput,
  Group,
  ActionIcon,
  Tooltip,
  Stack,
} from '@mantine/core'
import { IconTrash, IconSquareRoundedPlus } from '@tabler/icons-react'
import { UseFormReturnType } from '@mantine/form'
import { type BarometerFormProps } from '@/app/types'

interface DimensionsProps {
  form: UseFormReturnType<BarometerFormProps>
}

export function Dimensions({ form }: DimensionsProps) {
  const addDimension = () => {
    if (form.values.dimensions.length > 6) return
    form.insertListItem('dimensions', { dim: '', value: '' })
  }

  const removeDimension = (index: number) => {
    form.removeListItem('dimensions', index)
  }

  return (
    <Fieldset m={0} mt="0.2rem" p="sm" pt="0.3rem" legend="Dimensions">
      <Stack gap="xs" align="flex-start">
        {form.values.dimensions?.map((_, i) => (
          <Group
            w="100%"
            wrap="nowrap"
            gap="xs"
            key={form.key(`dimensions.${i}`)}
          >
            <Tooltip color="dark.3" withArrow label="Delete parameter">
              <ActionIcon variant="default" onClick={() => removeDimension(i)}>
                <IconTrash color="grey" size={20} />
              </ActionIcon>
            </Tooltip>
            <TextInput
              flex={1}
              placeholder="Unit"
              {...form.getInputProps(`dimensions.${i}.dim`)}
            />
            <TextInput
              flex={1}
              placeholder="Value"
              {...form.getInputProps(`dimensions.${i}.value`)}
            />
          </Group>
        ))}
        <Tooltip color="dark.3" withArrow label="Add parameter">
          <ActionIcon variant="default" onClick={addDimension}>
            <IconSquareRoundedPlus color="grey" />
          </ActionIcon>
        </Tooltip>
      </Stack>
    </Fieldset>
  )
}

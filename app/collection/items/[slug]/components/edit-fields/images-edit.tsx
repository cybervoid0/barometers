import { Tooltip, UnstyledButton, UnstyledButtonProps } from '@mantine/core'
import { IconEdit } from '@tabler/icons-react'
import { IBarometer } from '@/models/barometer'
import { useEditField } from './useEditField'

interface ImagesEditProps extends UnstyledButtonProps {
  size?: string | number | undefined
  barometer: IBarometer
}

export default function ImagesEdit({ barometer, size, ...props }: ImagesEditProps) {
  const { open, update, close, form, opened } = useEditField({ property: 'images', barometer })
  return (
    <>
      <Tooltip label="Edit manufacturer">
        <UnstyledButton {...props} onClick={open}>
          <IconEdit color="brown" size={size} />
        </UnstyledButton>
      </Tooltip>
    </>
  )
}

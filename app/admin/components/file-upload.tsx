'use client'

import { Dispatch, SetStateAction, useState } from 'react'
import {
  CloseButton,
  Fieldset,
  FileButton,
  Image,
  ActionIcon,
  Stack,
  Group,
  Paper,
  Tooltip,
} from '@mantine/core'
import { IconPhotoPlus, IconXboxX } from '@tabler/icons-react'
import { uploadImages, deleteImage } from '@/actions/images'
import { showError, showInfo } from '@/utils/notification'

interface FileUploadProps {
  fileNames: string[]
  setFileNames: Dispatch<SetStateAction<string[]>>
}
export function FileUpload({ setFileNames, fileNames }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  // upload images to Google cloud
  const googleUploadImages = async (files: File[] | null) => {
    if (!files || !Array.isArray(files) || files.length === 0) return
    setIsUploading(true)
    try {
      const urls = await uploadImages(
        files.map(({ name, type }) => ({
          fileName: name,
          contentType: type,
        })),
      )
      // upload all files to Google cloud concurrently
      await Promise.all(
        urls.map(async ({ signed }, i) => {
          const file = files[i]
          await fetch(signed, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            },
          })
        }),
      )
      showInfo(`Uploaded ${urls.length} image${urls.length > 1 ? 's' : ''}`)
      setFileNames(old => [...old, ...urls.map(url => url.public)])
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Can`t upload images')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteImage = async (imgUrl: string) => {
    try {
      await deleteImage(imgUrl.split('/').at(-1))
      setFileNames(old => [...old].filter(file => file !== imgUrl))
    } catch (error) {
      showError(error instanceof Error ? error.message : `Can't delete image ${imgUrl}`)
    }
  }

  return (
    <Fieldset m={0} mt="0.2rem" p="sm" pt="0.3rem" legend="Images">
      <Stack gap="xs" align="flex-start">
        <Group w="100%" justify="space-between">
          <FileButton onChange={googleUploadImages} accept="image/*" multiple>
            {props => (
              <Tooltip color="dark.3" withArrow label="Add image">
                <ActionIcon loading={isUploading} variant="default" {...props}>
                  <IconPhotoPlus color="grey" />
                </ActionIcon>
              </Tooltip>
            )}
          </FileButton>
          <Group gap="0.4rem" wrap="wrap">
            {fileNames.map(fileName => (
              <Paper key={fileName} withBorder pos="relative">
                <CloseButton
                  p={0}
                  c="dark.3"
                  radius={100}
                  size="1rem"
                  right={1}
                  top={1}
                  pos="absolute"
                  icon={<IconXboxX />}
                  bg="white"
                  onClick={() => handleDeleteImage(fileName)}
                />
                <Image h="3rem" w="3rem" src={fileName} />
              </Paper>
            ))}
          </Group>
        </Group>
      </Stack>
    </Fieldset>
  )
}

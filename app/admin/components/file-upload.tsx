'use client'

import { ReactNode, useState } from 'react'
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
  Text,
} from '@mantine/core'
import { IconPhotoPlus, IconXboxX } from '@tabler/icons-react'
import { showError } from '@/utils/notification'
import { deleteImage, uploadFileToCloud, createImageUrls } from '@/utils/fetch'

interface FileUploadProps {
  fileNames: string[]
  setFileNames: (names: string[]) => void
  validateError?: ReactNode
  clearValidateError?: () => void
}
export function FileUpload({
  setFileNames,
  fileNames,
  validateError,
  clearValidateError,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const googleUploadImages = async (files: File[] | null) => {
    if (clearValidateError) clearValidateError()
    if (!files || !Array.isArray(files) || files.length === 0) return
    setIsUploading(true)
    try {
      const urlsDto = await createImageUrls(
        files.map(file => ({
          fileName: file.name,
          contentType: file.type,
        })),
      )
      await Promise.all(
        urlsDto.urls.map((urlObj, index) => uploadFileToCloud(urlObj.signed, files[index])),
      )
      setFileNames([...fileNames, ...urlsDto.urls.map(urlObj => urlObj.public)])
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error uploading files')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteFile = async (index: number) => {
    const fileName = fileNames.at(index)?.split('/').at(-1)
    if (!fileName) return
    try {
      await deleteImage(fileName)
      setFileNames(fileNames.filter((_, i) => i !== index))
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error deleting file')
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
            {fileNames.map((fileName, i) => (
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
                  onClick={() => handleDeleteFile(i)}
                />
                <Image h="3rem" w="3rem" src={fileName} />
              </Paper>
            ))}
          </Group>
        </Group>
      </Stack>
      {validateError && (
        <Text mt="xs" size="xs" c="red">
          {validateError}
        </Text>
      )}
    </Fieldset>
  )
}

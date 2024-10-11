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
import axios, { AxiosError } from 'axios'
import { showError } from '@/utils/notification'
import { FileDto, UrlDto } from '../api/barometers/upload/images/types'
import { imageUploadApiRoute } from '../constants'

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
      const {
        data: { urls },
      } = await axios.post<UrlDto>(
        imageUploadApiRoute,
        {
          files: files.map(file => ({
            fileName: file.name,
            contentType: file.type,
          })),
        } as FileDto,
        { headers: { 'Content-Type': 'application/json' } },
      )
      // upload all files concurrently
      await Promise.all(
        urls.map(async ({ signed }, index) => {
          const file = files[index]
          await axios.put(signed, file, {
            headers: {
              'Content-Type': file.type,
            },
          })
        }),
      )
      setFileNames(old => [...old, ...urls.map(url => url.public)])
    } catch (error) {
      const defaultErrMsg = 'Error uploading files'
      if (error instanceof AxiosError) {
        showError((error.response?.data as { message?: string })?.message || defaultErrMsg)
        return
      }
      showError(error instanceof Error ? error.message : defaultErrMsg)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteFile = async (index: number) => {
    const fileName = fileNames.at(index)?.split('/').at(-1)
    try {
      await axios.delete(imageUploadApiRoute, {
        params: {
          fileName,
        },
      })
      setFileNames(old => [...old].filter((_, i) => i !== index))
    } catch (error) {
      const defaultErrMsg = 'Error deleting file'
      if (error instanceof AxiosError) {
        showError((error.response?.data as { message?: string })?.message || defaultErrMsg)
        return
      }
      showError(error instanceof Error ? error.message : defaultErrMsg)
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
    </Fieldset>
  )
}

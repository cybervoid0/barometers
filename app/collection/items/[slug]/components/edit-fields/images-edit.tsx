import { isEqual } from 'lodash'
import {
  Box,
  Button,
  CloseButton,
  FileButton,
  Group,
  LoadingOverlay,
  Modal,
  Stack,
  Tooltip,
  UnstyledButton,
  UnstyledButtonProps,
} from '@mantine/core'
import NextImage from 'next/image'
import { IconEdit, IconPhotoPlus, IconXboxX } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  useSortable,
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
import axios, { AxiosError } from 'axios'
import { IBarometer } from '@/models/barometer'
import sx from './styles.module.scss'
import {
  barometerRoute,
  barometersApiRoute,
  googleStorageImagesFolder,
  imageUploadApiRoute,
} from '@/app/constants'
import { FileDto, UrlDto } from '@/app/api/barometers/upload/images/types'
import { showError, showInfo } from '@/utils/notification'

interface ImagesEditProps extends UnstyledButtonProps {
  size?: string | number | undefined
  barometer: IBarometer
}
interface FormProps {
  images: string[]
}

async function deleteFromStorage(img: string) {
  // delete image file from google storage
  await axios.delete(imageUploadApiRoute, {
    params: {
      fileName: img,
    },
  })
}

function SortableImage({
  image,
  handleDelete,
}: {
  image: string
  handleDelete: (image: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: image,
  })

  return (
    <Box
      pos="relative"
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
    >
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
        onClick={() => handleDelete(image)}
      />
      <Box {...listeners}>
        <NextImage
          className={sx.thumbnail}
          alt="Barometer"
          key={image}
          src={googleStorageImagesFolder + image}
          width={100}
          height={200}
          quality={50}
        />
      </Box>
    </Box>
  )
}
export function ImagesEdit({ barometer, size, ...props }: ImagesEditProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [opened, { open, close }] = useDisclosure()
  const form = useForm<FormProps>({
    initialValues: {
      images: [],
    },
  })
  useEffect(() => {
    if (!barometer.images || !opened) return
    form.setFieldValue('images', barometer.images)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barometer.images, opened])

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = form.values.images.findIndex(image => image === active.id)
      const newIndex = form.values.images.findIndex(image => image === over.id)

      const newOrder = arrayMove(form.values.images, oldIndex, newIndex)
      form.setFieldValue('images', newOrder)
    }
  }
  const editImages = async (values: FormProps) => {
    // exit if no image was changed
    if (isEqual(values.images, barometer.images)) {
      close()
      return
    }
    setIsUploading(true)
    try {
      // erase deleted images
      const extraFiles = barometer.images?.filter(img => !form.values.images.includes(img))
      if (extraFiles) await Promise.all(extraFiles?.map(deleteFromStorage))
      const updatedBarometer: IBarometer = {
        ...barometer,
        images: form.getValues().images,
      }
      const { data } = await axios.put(barometersApiRoute, updatedBarometer)
      showInfo(`${barometer.name} updated`, 'Success')
      close()
      window.location.href = barometerRoute + (data.slug ?? '')
    } catch (error) {
      if (error instanceof AxiosError) {
        showError(
          (error.response?.data as { message: string })?.message ||
            error.message ||
            'Error updating barometer',
        )
      }
    } finally {
      setIsUploading(false)
    }
  }
  /**
   * Upload images to google storage
   */
  const uploadImages = async (files: File[]) => {
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
      // extracting file names from URLs
      const newImages = urls
        .map(url => new URL(url.public).pathname.split('/').at(-1) ?? '')
        .filter(url => Boolean(url))
      form.setFieldValue('images', prev => [...prev, ...newImages])
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

  const handleDeleteFile = async (img: string) => {
    setIsUploading(true)
    try {
      // if the image file was uploaded but not yet added to the barometer
      if (!barometer.images?.includes(img)) await deleteFromStorage(img)
      form.setFieldValue('images', old => old.filter(file => !file.includes(img)))
    } catch (error) {
      const defaultErrMsg = 'Error deleting file'
      if (error instanceof AxiosError) {
        showError((error.response?.data as { message?: string })?.message || defaultErrMsg)
        return
      }
      showError(error instanceof Error ? error.message : defaultErrMsg)
    } finally {
      setIsUploading(false)
    }
  }

  const onClose = async () => {
    // delete unused files from storage
    try {
      setIsUploading(true)
      const extraImages = form.values.images.filter(img => !barometer.images?.includes(img))
      await Promise.all(extraImages.map(deleteFromStorage))
    } catch (error) {
      // do nothing
    } finally {
      setIsUploading(false)
      close()
    }
  }
  return (
    <>
      <Modal
        size="auto"
        title="Edit images"
        centered
        opened={opened}
        onClose={onClose}
        classNames={{ title: sx.imageEditModalTitle }}
      >
        <Box pos="relative" component="form" onSubmit={form.onSubmit(editImages)}>
          <LoadingOverlay visible={isUploading} zIndex={100} />
          <Stack>
            <FileButton multiple onChange={uploadImages} accept="image/**">
              {fbProps => (
                <Button
                  color="dark.4"
                  className={sx.addImageBtn}
                  leftSection={<IconPhotoPlus />}
                  {...fbProps}
                >
                  Add images
                </Button>
              )}
            </FileButton>

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={form.values.images} strategy={horizontalListSortingStrategy}>
                <Group>
                  {form.getValues().images.map(img => (
                    <SortableImage key={img} image={img} handleDelete={handleDeleteFile} />
                  ))}
                </Group>
              </SortableContext>
            </DndContext>

            <Button type="submit" fullWidth variant="outline" color="dark.4">
              Save
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Tooltip label="Edit images">
        <UnstyledButton className={sx.imageEdit} {...props} onClick={open}>
          <IconEdit color="brown" size={size} />
        </UnstyledButton>
      </Tooltip>
    </>
  )
}

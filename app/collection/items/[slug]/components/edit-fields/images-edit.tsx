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
import { IBarometer } from '@/models/barometer'
import sx from './styles.module.scss'
import { barometerRoute, googleStorageImagesFolder } from '@/app/constants'
import { showError, showInfo } from '@/utils/notification'
import { updateBarometer } from '@/actions/barometers'
import { deleteImage, uploadImages } from '@/actions/images'

interface ImagesEditProps extends UnstyledButtonProps {
  size?: string | number | undefined
  barometer: IBarometer
}
interface FormProps {
  images: string[]
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
      const extraFiles = barometer.images?.filter(img => !form.values.images.includes(img))
      if (extraFiles) await Promise.all(extraFiles?.map(deleteImage))
      const updatedBarometer: IBarometer = {
        ...barometer,
        images: form.getValues().images,
      }
      const slug = await updateBarometer(updatedBarometer)
      showInfo(`${barometer.name} updated`, 'Success')
      close()
      window.location.href = barometerRoute + slug
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error uploading images')
    } finally {
      setIsUploading(false)
    }
  }
  /**
   * Upload images to google storage
   */
  const googleUploadImages = async (files: File[]) => {
    if (!files || !Array.isArray(files) || files.length === 0) return
    setIsUploading(true)
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
        await fetch(signed, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      }),
    )
    // extracting file names from URLs
    const newImages = urls
      .map(url => new URL(url.public).pathname.split('/').at(-1) ?? '')
      .filter(url => Boolean(url))
    form.setFieldValue('images', prev => [...prev, ...newImages])
    setIsUploading(false)
  }

  const handleDeleteFile = async (img: string) => {
    setIsUploading(true)
    if (!barometer.images?.includes(img)) await deleteImage(img)
    form.setFieldValue('images', old => old.filter(file => !file.includes(img)))
    setIsUploading(false)
  }

  const onClose = async () => {
    // delete unused files from storage
    try {
      setIsUploading(true)
      const extraImages = form.values.images.filter(img => !barometer.images?.includes(img))
      await Promise.all(extraImages.map(deleteImage))
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
            <FileButton multiple onChange={googleUploadImages} accept="image/**">
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

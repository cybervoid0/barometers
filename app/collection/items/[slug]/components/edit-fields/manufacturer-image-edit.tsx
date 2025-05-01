'use client'

import { useCallback } from 'react'
import NextImage from 'next/image'
import { CSS } from '@dnd-kit/utilities'
import {
  arrayMove,
  useSortable,
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { Fieldset, ActionIcon, FileButton, CloseButton } from '@mantine/core'
import { IconPhotoPlus, IconXboxX } from '@tabler/icons-react'
import { UseFormReturnType } from '@mantine/form'
import { createImageUrls, deleteImage, uploadFileToCloud } from '@/utils/fetch'
import { ManufacturerForm } from './types'
import { showError } from '@/utils/notification'

interface Props {
  imageUrls: string[]
  form: UseFormReturnType<ManufacturerForm, (values: ManufacturerForm) => ManufacturerForm>
  setLoading: (loading: boolean) => void
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
    <div
      className="relative shrink-0"
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
      <div {...listeners}>
        <NextImage
          className="h-auto w-auto"
          alt="Barometer"
          key={image}
          src={image}
          width={100}
          height={200}
        />
      </div>
    </div>
  )
}

export function ManufacturerImageEdit({ imageUrls, form, setLoading }: Props) {
  /**
   * Upload images to google storage
   */
  const uploadImages = useCallback(async (files: File[]) => {
    if (!files || !Array.isArray(files) || files.length === 0) return
    setLoading(true)
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

      const newImages = urlsDto.urls.map(url => url.public).filter(url => Boolean(url))
      form.setFieldValue('images', prev => [...prev, ...newImages])
    } catch (error) {
      const defaultErrMsg = 'Error uploading files'
      if (error instanceof Error) {
        showError(error.message || defaultErrMsg)
        return
      }
      showError(error instanceof Error ? error.message : defaultErrMsg)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDeleteFile = useCallback(
    async (img: string) => {
      setLoading(true)
      try {
        // if the image file was uploaded but not yet added to the entity
        if (!imageUrls?.includes(img)) await deleteImage(img)
        form.setFieldValue('images', old => old.filter(file => !file.includes(img)))
      } catch (error) {
        showError(error instanceof Error ? error.message : 'Error deleting file')
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [imageUrls],
  )

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event
    if (!over) return
    if (active.id !== over.id) {
      const oldIndex = form.values.images.findIndex(image => image === active.id)
      const newIndex = form.values.images.findIndex(image => image === over.id)

      const newOrder = arrayMove(form.values.images, oldIndex, newIndex)
      form.setFieldValue('images', newOrder)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Fieldset pos="relative" legend="Images" my="xs" p="xs" pt={0}>
      <div className="flex flex-nowrap gap-2">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={form.values.images} strategy={horizontalListSortingStrategy}>
            <div className="grow overflow-x-auto">
              <div className="flex flex-nowrap gap-1">
                {form.values.images.map(img => (
                  <SortableImage key={img} image={img} handleDelete={handleDeleteFile} />
                ))}
              </div>
            </div>
          </SortableContext>
        </DndContext>
        <FileButton multiple onChange={uploadImages} accept="image/*">
          {fbProps => (
            <ActionIcon variant="outline" color="primary" {...fbProps}>
              <IconPhotoPlus color="var(--mantine-color-primary)" />
            </ActionIcon>
          )}
        </FileButton>
      </div>
    </Fieldset>
  )
}

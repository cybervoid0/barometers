'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { EditButton, ImageUpload, MultiSelect, RequiredFieldMark } from '@/components/elements'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
  Input,
  LoadingOverlay,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui'
import type { AllBarometersDTO } from '@/server/barometers/queries'
import type { ConditionsDTO } from '@/server/conditions/queries'
import { deleteDocument, updateDocument } from '@/server/documents/actions'
import type { AllDocumentsDTO } from '@/server/documents/queries'
import { deleteFiles } from '@/server/files/actions'
import type { MediaFile } from '@/types'
import { cn } from '@/utils'
import {
  type DocumentEditForm,
  DocumentEditSchema,
  DocumentEditTransformSchema,
} from './document-edit-schema'

type DocumentType = AllDocumentsDTO[number]

interface Props {
  document: DocumentType
  conditions: ConditionsDTO
  allBarometers: AllBarometersDTO
}

export function DocumentEdit({ document, conditions, allBarometers }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  const docImages = useMemo(
    () => (document.images ?? []).map(img => ({ name: img.name ?? '', url: img.url }) as MediaFile),
    [document.images],
  )

  const form = useForm<DocumentEditForm>({
    resolver: zodResolver(DocumentEditSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const onUpdate = useCallback(
    async (values: DocumentEditForm) => {
      setLoading(true)
      try {
        if (!form.formState.isDirty) {
          toast.info('No changes to save')
          setOpenDialog(false)
          return
        }

        const deletedImages = docImages.filter(
          img => !values.images.some(({ url }) => img.url === url),
        )

        const result = await updateDocument(await DocumentEditTransformSchema.parseAsync(values))
        if (!result.success) throw new Error(result.error)
        toast.success(`Document "${result.data.title}" was updated`)

        setTimeout(() => {
          setLoading(false)
          setOpenDialog(false)
          router.refresh()
          if (deletedImages.length > 0) deleteFiles(deletedImages)
        }, 100)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error updating document')
        setLoading(false)
      }
    },
    [form.formState.isDirty, docImages, router],
  )

  const onDelete = useCallback(async () => {
    try {
      setLoading(true)
      const result = await deleteDocument(document.id)
      if (!result.success) throw new Error(result.error)
      toast.success(`Document "${document.title}" was deleted`)
      setOpenDeleteDialog(false)
      setOpenDialog(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error deleting document')
    } finally {
      setLoading(false)
    }
  }, [document, router])

  useEffect(() => {
    if (!openDialog) return
    form.reset({
      id: document.id,
      title: document.title,
      catalogueNumber: document.catalogueNumber,
      documentType: document.documentType,
      subject: document.subject ?? '',
      creator: document.creator ?? '',
      date: document.date ? new Date(document.date).toISOString().split('T')[0] : '',
      dateDescription: document.dateDescription ?? '',
      placeOfOrigin: document.placeOfOrigin ?? '',
      language: document.language ?? '',
      physicalDescription: document.physicalDescription ?? '',
      annotations: document.annotations?.join('\n') ?? '',
      provenance: document.provenance ?? '',
      acquisitionDate: document.acquisitionDate
        ? new Date(document.acquisitionDate).toISOString().split('T')[0]
        : '',
      description: document.description ?? '',
      conditionId: document.conditionId ?? '',
      images: document.images.map(({ url, name }) => ({ url, name: name ?? '' })),
      relatedBarometers: [],
    })
  }, [openDialog, document, form])

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: wrapper to stop event propagation to table row
    <div role="presentation" onClick={e => e.stopPropagation()}>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <EditButton title="Edit document" />
        <DialogContent
          className={cn('max-w-2xl max-h-[90vh] overflow-y-auto', { 'overflow-hidden': loading })}
        >
          {loading && <LoadingOverlay />}
          <DialogHeader>
            <div className="flex items-center gap-4">
              <DialogTitle>Edit Document</DialogTitle>
              <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    aria-label="Delete document"
                    className="w-6 h-6"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Document</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{document.title}"? This action cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <DialogDescription>Update document details.</DialogDescription>
          </DialogHeader>

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onUpdate)} noValidate className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Title <RequiredFieldMark />
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="catalogueNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Catalogue Number <RequiredFieldMark />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Document Type <RequiredFieldMark />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="creator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Creator</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Description</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. circa 1850" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="placeOfOrigin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place of Origin</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea autoResize {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="physicalDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physical Description</FormLabel>
                    <FormControl>
                      <Textarea autoResize {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="annotations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annotations (one per line)</FormLabel>
                    <FormControl>
                      <Textarea autoResize {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="provenance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provenance</FormLabel>
                    <FormControl>
                      <Textarea autoResize {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acquisitionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acquisition Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conditionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {conditions.map(condition => (
                          <SelectItem key={condition.id} value={condition.id}>
                            {condition.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ImageUpload existingImages={docImages} isDialogOpen={openDialog} />

              <FormField
                control={form.control}
                name="relatedBarometers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Barometers</FormLabel>
                    <FormControl>
                      <MultiSelect
                        selected={field.value}
                        options={allBarometers.map(b => ({ id: b.id, name: b.name }))}
                        onChange={field.onChange}
                        placeholder="Select related barometers"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
                <Button disabled={loading} type="submit" variant="outline" className="w-full">
                  Update
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  )
}

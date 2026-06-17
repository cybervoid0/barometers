'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { EditButton, IsAdmin, PdfFilesUpload, RequiredFieldMark } from '@/components/elements'
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
import { deleteEssay, updateEssay } from '@/server/essays/actions'
import type { AllEssaysDTO } from '@/server/essays/queries'
import type { MediaFile } from '@/types'
import { cn } from '@/utils'
import {
  ESSAY_TOPICS,
  type EssayFormData,
  EssayFormSchema,
  toEssayActionPayload,
} from '../admin/add-essay/essay-form.schema'

dayjs.extend(utc)

type Essay = AllEssaysDTO[number]

export function EssayEdit({ essay }: { essay: Essay }) {
  return (
    <IsAdmin>
      <EssayEditDialog essay={essay} />
    </IsAdmin>
  )
}

function EssayEditDialog({ essay }: { essay: Essay }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  const existingPdf = useMemo<MediaFile[]>(
    () => [{ url: essay.pdfUrl, name: essay.pdfName }],
    [essay.pdfUrl, essay.pdfName],
  )

  const form = useForm<EssayFormData>({
    resolver: zodResolver(EssayFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const onUpdate = useCallback(
    async (values: EssayFormData) => {
      setLoading(true)
      try {
        if (!form.formState.isDirty) {
          toast.info('No changes to save')
          setOpenDialog(false)
          return
        }
        const result = await updateEssay({ id: essay.id, ...toEssayActionPayload(values) })
        if (!result.success) throw new Error(result.error)
        toast.success(`Essay "${result.data.title}" was updated`)
        setOpenDialog(false)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error updating essay')
      } finally {
        setLoading(false)
      }
    },
    [form.formState.isDirty, essay.id, router],
  )

  const onDelete = useCallback(async () => {
    try {
      setLoading(true)
      const result = await deleteEssay(essay.id)
      if (!result.success) throw new Error(result.error)
      toast.success(`Essay "${essay.title}" was deleted`)
      setOpenDeleteDialog(false)
      setOpenDialog(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error deleting essay')
    } finally {
      setLoading(false)
    }
  }, [essay.id, essay.title, router])

  useEffect(() => {
    if (!openDialog) return
    form.reset({
      title: essay.title,
      standfirst: essay.standfirst,
      topic: essay.topic,
      date: dayjs.utc(essay.date).format('YYYY-MM-DD'),
      pdfFiles: existingPdf,
    })
  }, [openDialog, essay, existingPdf, form])

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <EditButton label="Edit essay" />
      <DialogContent
        className={cn('max-w-2xl max-h-[90vh] overflow-y-auto', { 'overflow-hidden': loading })}
      >
        {loading && <LoadingOverlay />}
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle>Edit Essay</DialogTitle>
            <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  aria-label="Delete essay"
                  className="w-6 h-6"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Essay</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{essay.title}"? This also removes its PDF and
                    cannot be undone.
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
          <DialogDescription>Update essay details or replace the PDF.</DialogDescription>
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
                    <Textarea {...field} autoResize rows={1} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="standfirst"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Standfirst <RequiredFieldMark />
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} autoResize rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Topic <RequiredFieldMark />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ESSAY_TOPICS.map(topic => (
                          <SelectItem key={topic} value={topic}>
                            {topic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Date <RequiredFieldMark />
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <PdfFilesUpload
              fieldName="pdfFiles"
              maxFiles={1}
              label="PDF"
              message="Drop a new PDF here to replace the current one"
              existingFiles={existingPdf}
              isDialogOpen={openDialog}
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
  )
}

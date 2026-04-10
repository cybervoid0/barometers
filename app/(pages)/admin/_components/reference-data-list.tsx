'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { RequiredFieldMark } from '@/components/elements'
import {
  Button,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { DeleteAlert } from './delete-alert'
import { EditDialog } from './edit-dialog'
import type {
  ReferenceDataActions,
  ReferenceDataForm,
  ReferenceDataItem,
} from './reference-data-schema'
import { referenceDataSchema } from './reference-data-schema'

interface ReferenceDataListProps extends ReferenceDataActions {
  addLabel: string
  items: ReferenceDataItem[]
}

export function ReferenceDataList({
  addLabel,
  items,
  onCreate,
  onUpdate,
  onDelete,
}: ReferenceDataListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<ReferenceDataForm>({
    resolver: zodResolver(referenceDataSchema),
    mode: 'onChange',
    defaultValues: { name: '', description: '' },
  })

  const editForm = useForm<ReferenceDataForm>({
    resolver: zodResolver(referenceDataSchema),
    mode: 'onChange',
    defaultValues: { name: '', description: '' },
  })

  const [editItem, setEditItem] = useEditItem(editForm)

  const onSubmit = useCallback(
    (values: ReferenceDataForm) => {
      startTransition(async () => {
        const result = await onCreate({
          name: values.name,
          description: values.description || undefined,
        })
        if (result.success) {
          toast.success(`${result.data.name} was added`)
          form.reset()
          router.refresh()
        } else {
          toast.error(result.error)
        }
      })
    },
    [onCreate, form, router],
  )

  const handleDelete = useCallback(
    (item: ReferenceDataItem) => {
      startTransition(async () => {
        const result = await onDelete({ id: item.id })
        if (result.success) {
          toast.success(`${item.name} was deleted`)
          router.refresh()
        } else {
          toast.error(result.error)
        }
      })
    },
    [onDelete, router],
  )

  const handleUpdate = useCallback(
    (values: ReferenceDataForm) => {
      if (!editItem) return
      startTransition(async () => {
        const result = await onUpdate({
          id: editItem.id,
          name: values.name,
          description: values.description || undefined,
        })
        if (result.success) {
          toast.success(`${result.data.name} was updated`)
          setEditItem(null)
          router.refresh()
        } else {
          toast.error(result.error)
        }
      })
    },
    [editItem, onUpdate, setEditItem, router],
  )

  return (
    <section className="space-y-8">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <h4 className="text-sm font-medium">{addLabel}</h4>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <RequiredFieldMark />
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter description (optional)" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending || !form.formState.isValid} className="w-full">
            {isPending ? 'Adding...' : 'Add'}
          </Button>
        </form>
      </FormProvider>

      {items.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id}>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={isPending}
                    aria-label={`Edit ${item.name}`}
                    onClick={() => setEditItem(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.description}</TableCell>
                <TableCell>
                  <DeleteAlert
                    name={item.name}
                    disabled={isPending}
                    onConfirm={() => handleDelete(item)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <EditDialog
        item={editItem}
        form={editForm}
        isPending={isPending}
        onClose={() => setEditItem(null)}
        onSubmit={handleUpdate}
      />
    </section>
  )
}

function useEditItem(editForm: ReturnType<typeof useForm<ReferenceDataForm>>) {
  const [editItem, setEditItem] = useState<ReferenceDataItem | null>(null)

  useEffect(() => {
    if (editItem) {
      editForm.reset({ name: editItem.name, description: editItem.description ?? '' })
    }
  }, [editItem, editForm])

  return [editItem, setEditItem] as const
}

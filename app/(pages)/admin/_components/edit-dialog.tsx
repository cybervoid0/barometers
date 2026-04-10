'use client'

import type { UseFormReturn } from 'react-hook-form'
import { RequiredFieldMark } from '@/components/elements'
import {
  Button,
  Dialog,
  DialogContent,
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
} from '@/components/ui'
import type { ReferenceDataForm, ReferenceDataItem } from './reference-data-schema'

interface EditDialogProps {
  item: ReferenceDataItem | null
  form: UseFormReturn<ReferenceDataForm>
  isPending: boolean
  onClose: () => void
  onSubmit: (values: ReferenceDataForm) => void
}

export function EditDialog({ item, form, isPending, onClose, onSubmit }: EditDialogProps) {
  return (
    <Dialog open={item !== null} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {item?.name}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <RequiredFieldMark />
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Optional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isValid}
                variant="outline"
                className="w-full"
              >
                {isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

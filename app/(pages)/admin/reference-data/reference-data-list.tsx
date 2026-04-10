'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState, useTransition } from 'react'
import { toast } from 'sonner'
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
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import type { ActionResult } from '@/types'

type Item = { id: number; name: string; description: string | null }

interface ReferenceDataListProps {
  title: string
  items: Item[]
  onCreate: (data: {
    name: string
    description?: string
  }) => Promise<ActionResult<{ id: number; name: string }>>
  onDelete: (data: { id: number }) => Promise<ActionResult<{ id: number }>>
}

export function ReferenceDataList({ title, items, onCreate, onDelete }: ReferenceDataListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await onCreate({ name, description: description || undefined })
      if (result.success) {
        toast.success(`${result.data.name} was added`)
        setName('')
        setDescription('')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleDelete(item: Item) {
    startTransition(async () => {
      const result = await onDelete({ id: item.id })
      if (result.success) {
        toast.success(`${item.name} was deleted`)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <Input
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="max-w-48"
        />
        <Input
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="max-w-64"
        />
        <Button type="submit" size="sm" disabled={isPending}>
          Add
        </Button>
      </form>

      {items.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.description}</TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-7 w-7"
                        disabled={isPending}
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {item.name}</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{item.name}&quot;? This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(item)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  )
}

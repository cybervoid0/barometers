import { flexRender, type Table as ReactTable } from '@tanstack/react-table'
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react'
import type { ComponentProps } from 'react'
import {
  Button,
  TableBody,
  TableCell,
  Table as TableCore,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { cn } from '@/utils'

interface Props<T> extends ComponentProps<typeof TableCore> {
  table: ReactTable<T>
  onRowClick?: (rowData: T) => void
}

export function Table<T>({ table, onRowClick, ...props }: Props<T>) {
  return (
    <TableCore {...props}>
      <TableHeader>
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => {
              const canSort = header.column.getCanSort()
              const sortDirection = header.column.getIsSorted()

              return (
                <TableHead
                  key={header.id}
                  className="font-semibold"
                  style={{
                    width: (header.column.columnDef.meta as { width?: string })?.width || 'auto',
                  }}
                >
                  {header.isPlaceholder ? null : (
                    <div className="flex items-center gap-2">
                      <p className="capitalize">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </p>
                      {canSort && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : sortDirection === 'desc' ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronsUpDown className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={table.getAllColumns().length} className="text-center">
              No data available
            </TableCell>
          </TableRow>
        ) : (
          table.getRowModel().rows.map(row => (
            <TableRow
              key={row.id}
              className={cn('odd:bg-muted/40', { 'cursor-pointer': Boolean(onRowClick) })}
              onClick={() => onRowClick?.(row.original)}
            >
              {row.getVisibleCells().map(cell => (
                <TableCell
                  key={cell.id}
                  style={{
                    width: (cell.column.columnDef.meta as { width?: string })?.width || 'auto',
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </TableCore>
  )
}

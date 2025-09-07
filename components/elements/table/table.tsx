import { flexRender, type Table as ReactTable } from '@tanstack/react-table'
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react'
import {
  Button,
  TableBody,
  TableCell,
  Table as TableCore,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'

interface Props<T> {
  table: ReactTable<T>
  className?: string
}

export function Table<T>({ table, className }: Props<T>) {
  return (
    <TableCore className={className}>
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
                      {flexRender(header.column.columnDef.header, header.getContext())}
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
            <TableRow key={row.id} className="odd:bg-muted/40">
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

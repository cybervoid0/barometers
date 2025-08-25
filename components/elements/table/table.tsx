import { flexRender, type Table as ReactTable } from '@tanstack/react-table'
import {
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
            {headerGroup.headers.map(header => (
              <TableHead key={header.id} className="font-semibold whitespace-nowrap">
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
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
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
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

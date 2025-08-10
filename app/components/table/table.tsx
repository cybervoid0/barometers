import { flexRender, type Table as ReactTable } from '@tanstack/react-table'
import {
  Table as TableCore,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
              <TableHead key={header.id} className="whitespace-nowrap font-semibold">
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

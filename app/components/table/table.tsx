import {
  Table as MantineTable,
  TableTbody,
  TableThead,
  TableTd,
  TableTr,
  type TableProps,
} from '@mantine/core'
import { flexRender, type Table as ReactTable } from '@tanstack/react-table'

interface Props<T> extends TableProps {
  table: ReactTable<T>
}
export function Table<T>({ table, ...props }: Props<T>) {
  return (
    <MantineTable {...props}>
      <TableThead fw={600} style={{ whiteSpace: 'nowrap' }}>
        <TableTr>
          {table
            .getHeaderGroups()
            .map(headerGroup =>
              headerGroup.headers.map(header => (
                <TableTd key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableTd>
              )),
            )}
        </TableTr>
      </TableThead>
      <TableTbody>
        {table.getRowModel().rows.length === 0 ? (
          <TableTr>
            <TableTd colSpan={table.getAllColumns().length}>No data available</TableTd>
          </TableTr>
        ) : (
          table.getRowModel().rows.map(row => (
            <TableTr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableTd key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableTd>
              ))}
            </TableTr>
          ))
        )}
      </TableTbody>
    </MantineTable>
  )
}

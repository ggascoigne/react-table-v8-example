import { Box, Chip } from '@mui/material'
import { Column } from '@tanstack/react-table'
import type { Table as TableInstance } from '@tanstack/table-core'
import { RowData } from '@tanstack/table-core'
import { useCallback } from 'react'

interface FilterChipBarProps<T extends RowData> {
  table: TableInstance<T>
}

// const getFilterValue = (column: ColumnInstance<any>, filterValue: FilterValue) => {
//   switch (column.filter) {
//     case 'between':
//       const min = filterValue[0]
//       const max = filterValue[1]
//       return min ? (max ? `${min}-${max}` : `>=${min}`) : `<=${max}`
//   }
//   return filterValue
// }

export function FilterChipBar<T extends RowData>({ table }: FilterChipBarProps<T>) {
  const { getState } = table
  const { columnFilters } = getState()

  const handleDelete = useCallback((column: Column<T>) => {
    column.setFilterValue(undefined)
  }, [])

  if (Object.keys(columnFilters).length === 0) return null

  return (
    <Box
      sx={{
        padding: '18px 0 5px 10px',
        width: '100%',
      }}
    >
      <Box
        component='span'
        sx={{
          color: '#998',
          fontSize: '14px',
          paddingRight: '10px',
        }}
      >
        Active filters:
      </Box>
      <>
        {columnFilters &&
          table.getAllLeafColumns().map((column) => {
            const filter = columnFilters.find((f) => f.id === column.id)
            const value = filter?.value

            return (
              value !== undefined && (
                <Chip
                  sx={{
                    marginRight: '4px',
                    color: '#222',
                  }}
                  key={column.id}
                  label={
                    <>
                      <Box
                        component='span'
                        sx={{
                          fontWeight: 500,
                          marginRight: '5px',
                        }}
                      >
                        {column.columnDef.header as string}:{' '}
                      </Box>
                      {column.getFilterValue()}
                    </>
                  }
                  onDelete={() => handleDelete(column)}
                  variant='outlined'
                />
              )
            )
          })}
      </>
    </Box>
  )
}

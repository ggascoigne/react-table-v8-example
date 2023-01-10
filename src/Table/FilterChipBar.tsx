import { Box, Chip } from '@mui/material'
import { Column } from '@tanstack/react-table'
import type { Table as TableInstance } from '@tanstack/table-core'
import { RowData } from '@tanstack/table-core'
import { useCallback } from 'react'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()({
  filtersActiveLabel: {
    color: '#998',
    fontSize: '14px',
    paddingRight: 10,
  },
  chipZone: {
    padding: '18px 0 5px 10px',
    width: '100%',
  },
  chipLabel: {
    fontWeight: 500,
    marginRight: 5,
  },
  filterChip: {
    marginRight: 4,
    color: '#222',
  },
})

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
  const { classes } = useStyles()
  const { getAllColumns, getState } = table
  const { columnFilters } = getState()

  const handleDelete = useCallback((column: Column<T>) => {
    column.setFilterValue(undefined)
  }, [])

  if (Object.keys(columnFilters).length === 0) return null

  return (
    <Box className={classes.chipZone}>
      <span className={classes.filtersActiveLabel}>Active filters:</span>
      <>
        {columnFilters &&
          getAllColumns().map((column) => {
            const filter = columnFilters.find((f) => f.id === column.id)
            const value = filter?.value
            return (
              value && (
                <Chip
                  className={classes.filterChip}
                  key={column.id}
                  label={
                    <>
                      <span className={classes.chipLabel}>{column.columnDef.header as string}: </span>
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

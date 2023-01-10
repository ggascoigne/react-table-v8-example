import { Box, Checkbox, FormControlLabel, Popover, Typography } from '@mui/material'
import { Column, Header, flexRender } from '@tanstack/react-table'
import type { RowData, Table as TableInstance } from '@tanstack/table-core'
import { ReactElement } from 'react'

interface ColumnHidePageProps<T extends RowData> {
  table: TableInstance<T>
  anchorEl?: Element
  onClose: () => void
  show: boolean
}

const id = 'popover-column-hide'

const findHeaderForColumn = <T extends RowData>(column: Column<T, unknown>, table: TableInstance<T>) => {
  let matched: Header<T, unknown> | undefined

  table.getHeaderGroups().forEach((headerGroup) => {
    headerGroup.headers.forEach((header) => {
      if (header.column === column) {
        matched = header
      }
    })
  })
  return matched
}

export function ColumnHidePage<T extends RowData>({
  table,
  anchorEl,
  onClose,
  show,
}: ColumnHidePageProps<T>): ReactElement | null {
  const hideableColumns = table.getAllLeafColumns().filter((column) => !(column.id === '_selector'))
  const checkedCount = hideableColumns.reduce((acc, val) => acc + (val.getIsVisible() ? 0 : 1), 0)
  const onlyOneOptionLeft = checkedCount + 1 >= hideableColumns.length

  return hideableColumns.length > 1 ? (
    <div>
      <Popover
        anchorEl={anchorEl}
        sx={{ p: 4 }}
        id={id}
        onClose={onClose}
        open={show}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 4 }}>
          <Typography sx={{ fontWeight: 500, padding: '0 24px 24px 0', textTransform: 'uppercase' }}>
            Visible Columns
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 198px)',
              '@media (max-width: 600px)': {
                gridTemplateColumns: 'repeat(1, 160px)',
              },
              gridColumnGap: 6,
              gridRowGap: 6,
            }}
          >
            {hideableColumns.map((column) => (
              <FormControlLabel
                key={column.id}
                control={<Checkbox value={`${column.id}`} disabled={column.getIsVisible() && onlyOneOptionLeft} />}
                label={
                  flexRender(column.columnDef.header, findHeaderForColumn(column, table)!.getContext()) as ReactElement
                }
                checked={column.getIsVisible()}
                onChange={column.getToggleVisibilityHandler()}
              />
            ))}
          </Box>
        </Box>
      </Popover>
    </div>
  ) : null
}

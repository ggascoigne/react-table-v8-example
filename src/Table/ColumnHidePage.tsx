import { ReactElement } from 'react'

import { Box, Checkbox, FormControlLabel, Popover, Typography } from '@mui/material'
import type { RowData, Table as TableInstance } from '@tanstack/table-core'

interface ColumnHidePageProps<T extends RowData> {
  table: TableInstance<T>
  anchorEl?: Element
  onClose: () => void
  show: boolean
}

const id = 'popover-column-hide'

export function ColumnHidePage<T extends RowData>({
  table,
  anchorEl,
  onClose,
  show,
}: ColumnHidePageProps<T>): ReactElement | null {
  const hidableColumns = table.getAllLeafColumns().filter((column) => !(column.id === '_selector'))
  const checkedCount = hidableColumns.reduce((acc, val) => acc + (val.getIsVisible() ? 0 : 1), 0)
  const onlyOneOptionLeft = checkedCount + 1 >= hidableColumns.length

  return hidableColumns.length > 1 ? (
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
            {hidableColumns.map((column) => (
              <FormControlLabel
                key={column.id}
                control={<Checkbox value={`${column.id}`} disabled={column.getIsVisible() && onlyOneOptionLeft} />}
                // note that this isn't really correct, but react-table removes invisible
                // headers, as such there's no way to get a valid context for a hidden column
                // faking it leaves a header context that is still missing information needed to provide a valid
                // interface.  This is at least predictable
                label={column.columnDef.header as string}
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

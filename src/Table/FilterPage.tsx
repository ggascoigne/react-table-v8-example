import { Box, Button, Popover, Typography } from '@mui/material'
import type { RowData, Table as TableInstance } from '@tanstack/table-core'
import { FormEvent, ReactElement, useCallback } from 'react'

interface FilterPageProps<T extends RowData> {
  table: TableInstance<T>
  anchorEl?: Element
  onClose: () => void
  show: boolean
}

export function FilterPage<T extends RowData>({ table, anchorEl, onClose, show }: FilterPageProps<T>): ReactElement {
  const { setColumnFilters } = table

  const allColumns = table
    .getAllLeafColumns()
    .filter((column) => !(column.id === '_selector'))
    .filter((column) => column.getCanFilter())

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      onClose()
    },
    [onClose]
  )

  const resetFilters = useCallback(() => {
    setColumnFilters([])
  }, [setColumnFilters])

  return (
    <div>
      <Popover
        anchorEl={anchorEl}
        id='popover-filters'
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
        <Box
          sx={{
            padding: '24px',
          }}
        >
          <Typography
            sx={{
              fontWeight: 500,
              padding: '0 24px 24px 0',
              textTransform: 'uppercase',
            }}
          >
            Filters
          </Typography>
          <form onSubmit={onSubmit}>
            <Button
              sx={{
                top: '18px',
                right: '21px',
              }}
              color='primary'
              onClick={resetFilters}
              style={{ position: 'absolute' }}
            >
              Reset
            </Button>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 218px)',
                '@media (max-width: 600px)': {
                  gridTemplateColumns: 'repeat(1, 180px)',
                },
                gridColumnGap: '24px',
                gridRowGap: '24px',
              }}
            >
              {allColumns.map((column) => (
                <Box
                  key={column.id}
                  sx={{
                    width: '100%',
                    display: 'inline-flex',
                    flexDirection: 'column',
                  }}
                >
                  {column.columnDef.meta?.filterRender?.({ table, column })}
                </Box>
              ))}
            </Box>
            <Button
              sx={{
                display: 'none',
              }}
              type='submit'
            >
              &nbsp;
            </Button>
          </form>
        </Box>
      </Popover>
    </div>
  )
}

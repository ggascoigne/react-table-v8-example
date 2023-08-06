import { MouseEvent, MouseEventHandler, PropsWithChildren, ReactElement, useCallback, useState } from 'react'

import AddIcon from '@mui/icons-material/Add'
import CachedIcon from '@mui/icons-material/Cached'
import CreateIcon from '@mui/icons-material/CreateOutlined'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import FilterListIcon from '@mui/icons-material/FilterList'
import ViewColumnsIcon from '@mui/icons-material/ViewColumn'
import { Button, IconButton, Toolbar, Tooltip } from '@mui/material'
import { RowData, Table } from '@tanstack/table-core'

import { ColumnHidePage } from './ColumnHidePage'
import { FilterPage } from './FilterPage'

export interface TableMouseEventHandler<T extends RowData> {
  (table: Table<T>): MouseEventHandler
}

interface ActionButton<T extends RowData> {
  table: Table<T>
  icon?: JSX.Element
  onClick: TableMouseEventHandler<T>
  enabled?: (table: Table<T>) => boolean
  label: string
  variant?: 'right' | 'left'
}

export const LabeledActionButton = <T extends RowData>({
  table,
  icon,
  onClick,
  label,
  enabled = () => true,
}: ActionButton<T>): ReactElement => (
  <Button variant="outlined" color="primary" onClick={onClick(table)} disabled={!enabled(table)}>
    {icon}
    &nbsp;
    {label}
  </Button>
)

export const SmallIconActionButton = <T extends RowData>({
  table,
  icon,
  onClick,
  label,
  enabled = () => true,
  variant,
}: ActionButton<T>) => (
  <Tooltip title={label} aria-label={label}>
    <span>
      <IconButton
        sx={[
          variant === 'right' && {
            padding: '12px',
            marginTop: '-6px',
            width: '48px',
            height: '48px',
            '&:last-of-type': {
              marginRight: '-12px',
            },
          },
          variant === 'left' && {
            '&:first-of-type': {
              marginLeft: '-12px',
            },
          },
        ]}
        onClick={onClick(table)}
        disabled={!enabled(table)}
        size="large"
      >
        {icon}
      </IconButton>
    </span>
  </Tooltip>
)

export interface Command<T extends RowData> {
  label: string
  onClick: TableMouseEventHandler<T>
  icon?: JSX.Element
  enabled: (table: Table<T>) => boolean
  type?: 'icon' | 'button'
}

interface TableToolbarProps<T extends RowData> {
  table: Table<T>
  onAdd?: TableMouseEventHandler<T>
  onDelete?: TableMouseEventHandler<T>
  onEdit?: TableMouseEventHandler<T>
  onRefresh?: MouseEventHandler
  extraCommands?: Command<T>[]
}

export function TableToolbar<T extends RowData>({
  table,
  onAdd,
  onDelete,
  onEdit,
  extraCommands = [],
  onRefresh,
}: PropsWithChildren<TableToolbarProps<T>>): ReactElement | null {
  const { getAllColumns } = table
  const [anchorEl, setAnchorEl] = useState<Element | undefined>(undefined)
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const hidableColumns = getAllColumns().filter((column) => !(column.id === '_selector'))

  const handleColumnsClick = useCallback(
    (event: MouseEvent) => {
      setAnchorEl(event.currentTarget)
      setColumnsOpen(true)
    },
    [setAnchorEl, setColumnsOpen],
  )

  const handleFilterClick = useCallback(
    (event: MouseEvent) => {
      setAnchorEl(event.currentTarget)
      setFilterOpen(true)
    },
    [setAnchorEl, setFilterOpen],
  )

  function handleClose() {
    setColumnsOpen(false)
    setFilterOpen(false)
    setAnchorEl(undefined)
  }

  // toolbar with add, edit, delete, filter/search column select.
  return (
    <Toolbar
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <div>
        {onAdd && (
          <SmallIconActionButton<T>
            table={table}
            icon={<AddIcon />}
            onClick={onAdd}
            label="Add"
            enabled={(t: Table<T>) => !t.getIsSomeRowsSelected()}
            variant="left"
          />
        )}
        {onEdit && (
          <SmallIconActionButton<T>
            table={table}
            icon={<CreateIcon />}
            onClick={onEdit}
            label="Edit"
            enabled={({ getState }: Table<T>) => Object.keys(getState().rowSelection ?? {}).length === 1}
            variant="left"
          />
        )}
        {onDelete && (
          <SmallIconActionButton<T>
            table={table}
            icon={<DeleteIcon />}
            onClick={onDelete}
            label="Delete"
            enabled={(t: Table<T>) => t.getIsSomeRowsSelected()}
            variant="left"
          />
        )}
        {extraCommands.map((c) => {
          const { type = 'icon' } = c
          return type === 'icon' ? (
            <SmallIconActionButton<T>
              key={`command-${c.label}`}
              table={table}
              icon={c.icon}
              onClick={c.onClick}
              label={c.label}
              enabled={c.enabled}
              variant="left"
            />
          ) : (
            <LabeledActionButton<T>
              key={`command-${c.label}`}
              table={table}
              icon={c.icon}
              onClick={c.onClick}
              label={c.label}
              enabled={c.enabled}
            />
          )
        })}
      </div>
      <div>
        <ColumnHidePage<T> table={table} onClose={handleClose} show={columnsOpen} anchorEl={anchorEl} />
        <FilterPage<T> table={table} onClose={handleClose} show={filterOpen} anchorEl={anchorEl} />
        {onRefresh && (
          <SmallIconActionButton<T>
            table={table}
            icon={<CachedIcon />}
            onClick={() => onRefresh}
            label="Refresh Table"
            variant="right"
          />
        )}
        {hidableColumns.length > 1 && (
          <SmallIconActionButton<T>
            table={table}
            icon={<ViewColumnsIcon />}
            onClick={() => handleColumnsClick}
            label="Show / hide columns"
            variant="right"
          />
        )}
        <SmallIconActionButton<T>
          table={table}
          icon={<FilterListIcon />}
          onClick={() => handleFilterClick}
          label="Filter by columns"
          variant="right"
        />
      </div>
    </Toolbar>
  )
}

import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp'
import { TableSortLabel, TextField, Tooltip } from '@mui/material'
import {
  Cell,
  CellContext,
  Column,
  ColumnDef,
  HeaderContext,
  Row,
  RowData,
  Table as TableInstance,
  TableOptions,
  TableState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { FilterRenderProps } from '@tanstack/table-core'
import React, { CSSProperties, MouseEventHandler, ReactElement, useCallback, useEffect, useMemo } from 'react'

import { camelToWords, isDev, useDebounce } from '../utils'
import { FilterChipBar } from './FilterChipBar'
import { fuzzyTextFilter, numericTextFilter } from './filters'
import { ResizeHandle } from './ResizeHandle'
import { TableDebug, TableDebugButton } from './TableDebug'
import { TablePagination } from './TablePagination'
import {
  HeaderCheckbox,
  RowCheckbox,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableHeadRow,
  TableLabel,
  TableRow,
  TableTable,
  useStyles,
} from './TableStyles'
import { Command, TableToolbar } from './TableToolbar'
import { TooltipCellRenderer } from './TooltipCell'
import { useInitialTableState } from './useInitialTableState'

export type TableProps<T extends RowData> = Partial<TableOptions<T>> &
  Pick<TableOptions<T>, 'columns' | 'data'> & {
    name: string
    onAdd?: (instance: TableInstance<T>) => MouseEventHandler
    onDelete?: (instance: TableInstance<T>) => MouseEventHandler
    onEdit?: (instance: TableInstance<T>) => MouseEventHandler
    onClick?: (row: Row<T>) => void
    extraCommands?: Command<T>[]
    onRefresh?: MouseEventHandler
    initialState?: Partial<TableState>
  }

const DefaultHeader = <T extends RowData>({ column }: HeaderContext<T, any>) => (
  <>{column.id.startsWith('_') ? null : camelToWords(column.id)}</>
)

// yes this is recursive, but the depth never exceeds three, so it seems safe enough
const findFirstColumn = <T extends RowData>(columns: Array<Column<T>>): Column<T> =>
  columns[0].columns?.length ? findFirstColumn(columns[0].columns) : columns[0]

function DefaultColumnFilter<T extends RowData>({ table, column }: FilterRenderProps<T>) {
  const { id, getFilterValue, setFilterValue, columnDef } = column
  const [value, setValue] = React.useState(getFilterValue() || '')
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
  }
  // ensure that reset loads the new value
  useEffect(() => {
    setValue(getFilterValue() || '')
  }, [getFilterValue])

  const isFirstColumn = findFirstColumn(table.getAllColumns()) === column
  return (
    <TextField
      name={id}
      label={columnDef.header as string}
      InputLabelProps={{ htmlFor: id }}
      value={value}
      autoFocus={isFirstColumn}
      variant='standard'
      onChange={handleChange}
      onBlur={(e) => {
        const value = e.target.value || undefined
        setFilterValue(value)
        if (value !== getFilterValue()) table.setPageIndex(0)
      }}
    />
  )
}

const DEFAULT_PAGE_SIZE = 25

export function Table<T extends RowData>(props: TableProps<T>): ReactElement {
  const {
    name,
    columns: userColumns,
    onAdd,
    onDelete,
    onEdit,
    onClick,
    extraCommands,
    onRefresh,
    initialState: userInitialState = {},
  } = props

  const { classes, cx } = useStyles()

  const selectionColumn = useMemo<ColumnDef<T>>(
    () => ({
      id: '_selector',
      enableResizing: false,
      enableGrouping: false,
      minSize: 45,
      size: 45,
      maxSize: 45,
      aggregatedCell: undefined,
      header: ({ table }: HeaderContext<T, any>) => (
        <HeaderCheckbox
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler(),
          }}
        />
      ),
      cell: ({ row }: CellContext<T, any>) => (
        <RowCheckbox
          {...{
            checked: row.getIsSelected(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler(),
          }}
        />
      ),
    }),
    []
  )

  const columns = useMemo(() => [selectionColumn, ...userColumns], [selectionColumn, userColumns])

  const defaultColumn = useMemo<Partial<ColumnDef<T>>>(
    () => ({
      enableResizing: false,
      enableGrouping: false,
      meta: {
        filterRender: DefaultColumnFilter,
      },
      cell: TooltipCellRenderer,
      header: DefaultHeader,
      aggregationFn: 'uniqueCount',
      aggregatedCell: ({ getValue }: CellContext<T, unknown>) => <>{getValue()} Unique Values</>,
      minSize: 30,
      size: 150,
      maxSize: 200,
    }),
    []
  )

  const [initialState, setInitialState] = useInitialTableState(`tableState:${name}`, columns, {
    pagination: {
      pageSize: DEFAULT_PAGE_SIZE,
      pageIndex: 0,
    },
    ...userInitialState,
  })

  const table = useReactTable<T>({
    ...props,
    columns,
    filterFns: {
      fuzzyText: fuzzyTextFilter,
      numeric: numericTextFilter,
    },
    defaultColumn,
    initialState,
    autoResetPageIndex: false,
    autoResetExpanded: false,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const debouncedState = useDebounce(table.getState(), 500)

  useEffect(() => {
    setInitialState(debouncedState)
  }, [setInitialState, debouncedState])

  const cellClickHandler = useCallback(
    (cell: Cell<T, unknown>) => () => {
      onClick &&
        !cell.column.getIsGrouped() &&
        !cell.row.getIsGrouped() &&
        cell.column.id !== '_selector' &&
        onClick(cell.row)
    },
    [onClick]
  )

  return (
    <>
      <TableToolbar table={table} {...{ onAdd, onDelete, onEdit, extraCommands, onRefresh }} />
      <FilterChipBar<T> table={table} />
      <TableTable>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => {
            return (
              <TableHeadRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const style = {
                    textAlign: header.column.columnDef?.meta?.align || 'left ',
                  } as CSSProperties

                  return (
                    <TableHeadCell
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ position: 'relative', width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          {header.column.getCanGroup() && (
                            <Tooltip title={'Toggle Grouping'}>
                              <TableSortLabel
                                active
                                direction={header.column.getIsGrouped() ? 'desc' : 'asc'}
                                IconComponent={KeyboardArrowRight}
                                className={classes.headerIcon}
                                onClick={header.column.getToggleGroupingHandler()}
                              />
                            </Tooltip>
                          )}
                          {header.column.getCanSort() ? (
                            <Tooltip title={'Toggle Sort'}>
                              <TableSortLabel
                                active={!!header.column.getIsSorted()}
                                direction={header.column.getIsSorted() || 'asc'}
                                onClick={header.column.getToggleSortingHandler()}
                                className={classes.tableSortLabel}
                                style={style}
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </TableSortLabel>
                            </Tooltip>
                          ) : (
                            <TableLabel style={style}>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </TableLabel>
                          )}
                        </>
                      )}
                      {header.column.getCanResize() && <ResizeHandle header={header} />}
                    </TableHeadCell>
                  )
                })}
              </TableHeadRow>
            )
          })}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            return (
              <TableRow key={row.id} className={cx({ rowSelected: row.getIsSelected(), clickable: !!onClick })}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <TableCell key={cell.id} onClick={cellClickHandler(cell)} style={{ width: cell.column.getSize() }}>
                      {cell.getIsGrouped() ? (
                        <>
                          <TableSortLabel
                            classes={{
                              iconDirectionAsc: classes.iconDirectionAsc,
                              iconDirectionDesc: classes.iconDirectionDesc,
                            }}
                            active
                            direction={row.getIsExpanded() ? 'desc' : 'asc'}
                            IconComponent={KeyboardArrowUp}
                            onClick={row.getToggleExpandedHandler()}
                            className={classes.cellIcon}
                          />
                          {flexRender(cell.column.columnDef.cell, cell.getContext())} ({row.subRows.length})
                        </>
                      ) : cell.getIsAggregated() ? (
                        flexRender(
                          cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      ) : cell.getIsPlaceholder() ? null : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </TableTable>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <TableDebugButton enabled={isDev} instance={table} />
        <TablePagination<T> table={table} />
      </div>
      <TableDebug enabled={isDev} instance={table} />
    </>
  )
}

/* eslint-disable @getify/proper-ternary/nested */
import React, { CSSProperties, MouseEventHandler, ReactElement, useCallback, useEffect, useMemo } from 'react'

import { css as emotionCss } from '@emotion/css'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp'
import { TableSortLabel, TextField, Tooltip } from '@mui/material'
import { css } from '@mui/material/styles'
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
import { FilterRenderProps, getExpandedRowModel, getGroupedRowModel } from '@tanstack/table-core'
import classnames from 'classnames'

import { FilterChipBar } from './FilterChipBar'
import { fuzzyTextFilter, numericTextFilter } from './filters'
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
  ResizeHandle,
} from './TableStyles'
import { Command, TableToolbar } from './TableToolbar'
import { TooltipCellRenderer } from './TooltipCell'
import { useInitialTableState } from './useInitialTableState'

import { camelToWords, isDev, useDebounce } from '../utils'

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
        const _value = e.target.value || undefined
        setFilterValue(_value)
        if (_value !== getFilterValue()) table.setPageIndex(0)
      }}
    />
  )
}

const sortStyles = {
  iconDirectionAsc: {
    transform: 'rotate(90deg)',
  },
  iconDirectionDesc: {
    transform: 'rotate(180deg)',
  },
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
      enableResizing: true,
      enableGrouping: true,
      meta: {
        filterRender: DefaultColumnFilter,
      },
      cell: TooltipCellRenderer,
      header: DefaultHeader,
      aggregationFn: 'uniqueCount',
      aggregatedCell: ({ getValue }: CellContext<T, unknown>) => <>{getValue()} Unique Values</>,
      minSize: 50,
      size: 200,
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
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
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

  const headerGroups = table.getHeaderGroups()
  const { rows } = table.getRowModel()

  return (
    <>
      <TableToolbar table={table} {...{ onAdd, onDelete, onEdit, extraCommands, onRefresh }} />
      <FilterChipBar<T> table={table} />
      <TableTable>
        <TableHead>
          {headerGroups.map((headerGroup) => (
            <TableHeadRow key={headerGroup.id}>
              {headerGroup.headers.map((header, headerIndex) => {
                const style = {
                  display: 'flex',
                  justifyContent: header.column.columnDef?.meta?.align === 'right' ? 'flex-end' : 'flex-start',
                } as CSSProperties

                return (
                  <TableHeadCell
                    key={header.id}
                    colSpan={header.colSpan}
                    sx={[
                      {
                        position: 'relative',
                        width: header.getSize(),
                      },
                      headerIndex + 1 === headerGroup.headers.length && {
                        flex: '1 1 auto',
                      },
                      style,
                    ]}
                  >
                    {header.isPlaceholder ? null : (
                      <>
                        {/* I only want the leaves of columns to show grouping */}
                        {header.column.getCanGroup() && headerGroup.depth + 1 === headerGroups.length && (
                          <Tooltip title='Toggle Grouping'>
                            <TableSortLabel
                              active
                              direction={header.column.getIsGrouped() ? 'desc' : 'asc'}
                              IconComponent={KeyboardArrowRight}
                              sx={{
                                '& svg': {
                                  width: '16px',
                                  height: '16px',
                                  marginRight: 0,
                                  marginLeft: '-4px',
                                },
                              }}
                              onClick={header.column.getToggleGroupingHandler()}
                            />
                          </Tooltip>
                        )}
                        {header.column.getCanSort() ? (
                          <Tooltip title='Toggle Sort'>
                            <TableSortLabel
                              active={!!header.column.getIsSorted()}
                              direction={header.column.getIsSorted() || 'asc'}
                              onClick={header.column.getToggleSortingHandler()}
                              sx={{
                                '& svg': {
                                  width: '16px',
                                  height: '16px',
                                  marginTop: 0,
                                  marginLeft: '2px',
                                },
                              }}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </TableSortLabel>
                          </Tooltip>
                        ) : (
                          <TableLabel>{flexRender(header.column.columnDef.header, header.getContext())}</TableLabel>
                        )}
                      </>
                    )}
                    {header.column.getCanResize() && <ResizeHandle header={header} />}
                  </TableHeadCell>
                )
              })}
            </TableHeadRow>
          ))}
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const cells = row.getVisibleCells()
            return (
              <TableRow key={row.id} className={classnames({ rowSelected: row.getIsSelected(), clickable: !!onClick })}>
                {cells.map((cell, cellIndex) => (
                  <TableCell
                    key={cell.id}
                    onClick={cellClickHandler(cell)}
                    style={{
                      width: cell.column.getSize(),
                      flex: cellIndex + 1 === cells.length ? '1 1 auto' : undefined,
                    }}
                  >
                    {cell.getIsGrouped() ? (
                      <>
                        <TableSortLabel
                          classes={{
                            iconDirectionAsc: emotionCss(css(sortStyles.iconDirectionAsc).styles),
                            iconDirectionDesc: emotionCss(css(sortStyles.iconDirectionDesc).styles),
                          }}
                          active
                          direction={row.getIsExpanded() ? 'desc' : 'asc'}
                          IconComponent={KeyboardArrowUp}
                          onClick={row.getToggleExpandedHandler()}
                          sx={{
                            '& svg': {
                              width: '16px',
                              height: '16px',
                            },
                          }}
                        />
                        {flexRender(cell.column.columnDef.cell, cell.getContext())} ({row.subRows.length})
                      </>
                    ) : cell.getIsAggregated() ? (
                      flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, cell.getContext())
                    ) : cell.getIsPlaceholder() ? null : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </TableCell>
                ))}
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

import { Button, CssBaseline, InputLabel, MenuItem, TextField } from '@mui/material'
import {
  AggregationFn,
  CellContext,
  ColumnDef,
  FilterFn,
  FilterRenderProps,
  Row,
  Table as TableInstance,
} from '@tanstack/react-table'
import React, { useCallback } from 'react'

import { Page } from './Page'
import { Table } from './Table'
import { fuzzyTextFilter } from './Table/filters'
import { makeData, Person } from './utils'

const roundedMedian: AggregationFn<any> = (columnId, leafRows) => {
  if (!leafRows.length) {
    return
  }

  let min = 0
  let max = 0

  leafRows.forEach((row) => {
    let value = row.getValue(columnId)
    if (typeof value === 'number') {
      min = Math.min(min, value)
      max = Math.max(max, value)
    }
  })

  return Math.round(min + max) / 2
}

const filterGreaterThan: FilterFn<any> = (row, columnId, value) => {
  const rowValue = row.getValue<number>(columnId)
  return rowValue >= value
}

// This is an autoRemove method on the filter function that
// when given the new filter value and returns true, the filter
// will be automatically removed. Normally this is just an undefined
// check, but here, we want to remove the filter if it's not a number
filterGreaterThan.autoRemove = (val: any) => typeof val !== 'number'

function SelectColumnFilter({
  column: { id, columnDef, setFilterValue, getFilterValue },
  table: { getPreFilteredRowModel },
}: FilterRenderProps<Person>) {
  const options = React.useMemo(() => {
    const options = new Set<any>()
    getPreFilteredRowModel().flatRows.forEach((row) => {
      options.add(row.getValue(id))
    })
    return [...Array.from(options.values())]
  }, [id, getPreFilteredRowModel])
  const columnFilterValue = getFilterValue()

  return (
    <TextField
      select
      label={columnDef.header as string}
      value={columnFilterValue || ''}
      onChange={(e) => {
        setFilterValue(e.target.value || undefined)
      }}
      variant='standard'
    >
      <MenuItem value={''}>All</MenuItem>
      {options.map((option, i) => (
        <MenuItem key={i} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  )
}

const getMinMax = (rows: Row<Person>[], id: string) => {
  let min = rows.length ? rows[0].getValue<number>(id) : 0
  let max = rows.length ? rows[0].getValue<number>(id) : 0
  rows.forEach((row) => {
    min = Math.min(row.getValue<number>(id), min)
    max = Math.max(row.getValue<number>(id), max)
  })
  return [min, max]
}

function SliderColumnFilter({
  column: { id, columnDef, setFilterValue, getFilterValue },
  table: { getPreFilteredRowModel },
}: FilterRenderProps<Person>) {
  const [min, max] = React.useMemo(() => getMinMax(getPreFilteredRowModel().flatRows, id), [getPreFilteredRowModel, id])

  const columnFilterValue = getFilterValue()

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <TextField
        name={id}
        label={columnDef.header as string}
        type='range'
        inputProps={{
          min,
          max,
        }}
        value={columnFilterValue || min}
        onChange={(e) => {
          setFilterValue(parseInt(e.target.value, 10))
        }}
        variant='standard'
      />
      <Button variant='outlined' style={{ width: 60, height: 36 }} onClick={() => setFilterValue(undefined)}>
        Off
      </Button>
    </div>
  )
}

const useActiveElement = () => {
  const [active, setActive] = React.useState(document.activeElement)

  const handleFocusIn = () => {
    setActive(document.activeElement)
  }

  React.useEffect(() => {
    document.addEventListener('focusin', handleFocusIn)
    return () => {
      document.removeEventListener('focusin', handleFocusIn)
    }
  }, [])

  return active
}

// This is a custom UI for our 'between' or number range
// filter. It uses two number boxes and filters rows to
// ones that have values between the two
function NumberRangeColumnFilter({
  column: { id, columnDef, setFilterValue, getFilterValue },
  table: { getPreFilteredRowModel },
}: FilterRenderProps<Person>) {
  const [min, max] = React.useMemo(() => getMinMax(getPreFilteredRowModel().flatRows, id), [getPreFilteredRowModel, id])
  const focusedElement = useActiveElement()
  const hasFocus = focusedElement && (focusedElement.id === `${id}_1` || focusedElement.id === `${id}_2`)
  const columnFilterValue = (getFilterValue() as [number, number]) || [0, 0]

  return (
    <>
      <InputLabel htmlFor={id} shrink focused={!!hasFocus}>
        {columnDef.header as string}
      </InputLabel>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingTop: 5,
        }}
      >
        <TextField
          id={`${id}_1`}
          value={columnFilterValue[0] || ''}
          type='number'
          onChange={(e) => {
            const val = e.target.value
            setFilterValue((old: [number, number]) => [val ? parseInt(val, 10) : undefined, old[1]])
          }}
          placeholder={`Min (${min})`}
          style={{
            width: '70px',
            marginRight: '0.5rem',
          }}
          variant='standard'
        />
        to
        <TextField
          id={`${id}_2`}
          value={columnFilterValue[1] || ''}
          type='number'
          onChange={(e) => {
            const val = e.target.value
            setFilterValue((old: [number, number]) => [old[0], val ? parseInt(val, 10) : undefined])
          }}
          placeholder={`Max (${max})`}
          style={{
            width: '70px',
            marginLeft: '0.5rem',
          }}
          variant='standard'
        />
      </div>
    </>
  )
}

const columns: ColumnDef<Person>[] = [
  {
    header: 'Name',
    columns: [
      {
        header: 'First Name',
        accessorKey: 'firstName',
        aggregationFn: 'count',
        aggregatedCell: ({ getValue }: CellContext<Person, unknown>) => `${getValue()} Names`,
      },
      {
        header: 'Last Name',
        accessorKey: 'lastName',
        aggregationFn: 'uniqueCount',
        filterFn: fuzzyTextFilter,
        aggregatedCell: ({ getValue }: CellContext<Person, unknown>) => `${getValue()} Unique Names`,
      },
    ],
  },
  {
    header: 'Info',
    columns: [
      {
        header: 'Age',
        accessorKey: 'age',
        size: 50,
        minSize: 50,
        filterFn: 'equals',
        aggregationFn: 'mean',
        enableGrouping: false,
        enableSorting: false,
        aggregatedCell: ({ getValue }: CellContext<Person, unknown>) => `${getValue()} (avg)`,
        meta: {
          aligns: 'right', // todo should be align
          filterRender: SliderColumnFilter,
        },
      },
      {
        header: 'Visits',
        accessorKey: 'visits',
        size: 50,
        minSize: 50,
        filterFn: 'inNumberRange',
        aggregationFn: 'sum',
        aggregatedCell: ({ getValue }: CellContext<Person, unknown>) => `${getValue()} (total)`,
        meta: {
          align: 'right',
          filterRender: NumberRangeColumnFilter,
        },
      },
      {
        header: 'Status',
        accessorKey: 'status',
        filterFn: 'includesString',
        meta: {
          filterRender: SelectColumnFilter,
        },
      },
      {
        header: 'Profile Progress',
        accessorKey: 'progress',
        filterFn: filterGreaterThan,
        aggregationFn: roundedMedian,
        aggregatedCell: ({ getValue }: CellContext<Person, unknown>) => `${getValue()} (med)`,
        meta: {
          filterRender: SliderColumnFilter,
        },
      },
    ] as ColumnDef<Person>[],
  },
] //.flatMap((c:any)=>c.columns) // remove comment to drop header groups

const App: React.FC = () => {
  const [data] = React.useState<Person[]>(() => makeData(100))

  const dummy = useCallback(
    (instance: TableInstance<Person>) => () => {
      console.log(
        'Selected',
        instance
          .getSelectedRowModel()
          .flatRows.map((v) => `'${v.original.firstName} ${v.original.lastName}'`)
          .join(', ')
      )
    },
    []
  )

  return (
    <Page>
      <CssBaseline />
      <Table<Person> name={'testTable'} columns={columns} data={data} onAdd={dummy} onEdit={dummy} onDelete={dummy} />
    </Page>
  )
}

export default App

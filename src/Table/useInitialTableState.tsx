import { useCallback, useMemo } from 'react'

import { ColumnDef, TableState } from '@tanstack/react-table'
import { RowData } from '@tanstack/table-core'
import { dequal as deepEqual } from 'dequal'

import { useLocalStorage } from '../utils'

interface PersistedState {
  createdFor: {
    columns: string
    initialState: Partial<TableState>
  }
  value: Partial<TableState>
}

export const useInitialTableState = <T extends RowData>(
  name: string,
  columns: ReadonlyArray<ColumnDef<T>>,
  userInitialState: Partial<TableState>
) => {
  const createdFor = useMemo(
    () => ({
      columns: columns.map((c) => c.id).join(','),
      initialState: userInitialState,
    }),
    [columns, userInitialState]
  )

  const [initialState, setInitialState] = useLocalStorage<PersistedState>(name, {
    createdFor,
    value: userInitialState,
  })

  const setNewState = useCallback(
    (input: Partial<TableState>) => {
      const {
        sorting,
        columnFilters,
        pagination,
        columnSizing,
        columnVisibility,
        columnOrder,
        grouping,
        globalFilter,
      } = input
      setInitialState({
        createdFor,
        value: {
          sorting,
          columnFilters,
          pagination,
          columnSizing,
          columnVisibility,
          columnOrder,
          grouping,
          globalFilter,
        },
      })
    },
    [createdFor, setInitialState]
  )
  const value = deepEqual(initialState.createdFor, createdFor) ? initialState.value : userInitialState

  return [value, setNewState] as const
}

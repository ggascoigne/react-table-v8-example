import {RowData, Table } from '@tanstack/table-core'
import { Property } from 'csstype'
import {Column} from "@tanstack/react-table";

declare module '@tanstack/table-core' {
  interface FilterRenderProps<T extends RowData> {
    column: Column<T, unknown>
    table: Table<T>
  }

  interface ColumnMeta<TData extends RowData> {
    align?: Property.TextAlign | undefined
    filterRender?: (props: FilterRenderProps<TData>) => JSX.Element
  }
}

import { WithT } from 'i18next'
import {
  CalculatedColumn,
  Column as RdgColumns,
  DataGridProps as RdgDataGridProps,
  SortDirection,
} from 'react-data-grid'
// import { XOR } from '../../../types/lib';

export type DataGridProps<R, SR> = Omit<RdgDataGridProps<R, SR>, 'rows' | 'columns'> &
  TableProps<R, unknown>
export type Column<R, SR> = RdgColumns<R, SR> & {
  [key: string]: any
}

export type TableProps<R extends { [key: string]: any }, SR> = {
  rawData: any
  columnMode: readonly Column<R, unknown>[]
  generateRows: (rawData: any, ...rest: any[]) => Array<R>
  generateColumns: ({
    columnsRaw,
    t,
    ...rest
  }: {
    columnsRaw: readonly Column<R, SR>[]
    [key: string]: any
  } & WithT) => Array<RdgColumns<R>>
  // rows: any;
  columns?: readonly Column<R, unknown>[]
  setRows?: () => any
  rowClassFn?: (row: R, ...rest: TableProps<R, SR>[]) => string
  frozeSort?: boolean
  rowHeight?: number // px
  actionColumns?: Array<string>
  sortInitDirection?: 'DESC' | 'ASC' | undefined
  sortDefaultKey?: string
  sortMethod?: (rows: R[], sortColumn: string, sortDirection: 'DESC' | 'ASC' | undefined) => R[]
  handleSort?: (columnKey: string, direction: SortDirection) => boolean
  EmptyRowsRenderer?: ''
  onRowClick?: (rowIdx: number, row: R, column: CalculatedColumn<R, SR>) => void
}
//& XOR<{ rows: R[] }, {generateRows: (rawData: any, ...rest: any[]) => Array<R>}>;

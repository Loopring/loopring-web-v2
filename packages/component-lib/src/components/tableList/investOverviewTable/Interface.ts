import { CoinInfo, InvestItem, RowConfig } from '@loopring-web/common-resources'
import { TokenInfo, XOR } from '@loopring-web/loopring-sdk'

export type DepartmentRow = Required<InvestItem & { token: TokenInfo; coinInfo: CoinInfo<any> }>
export type RowInvest = DepartmentRow & {
  isExpanded?: boolean
  children?: InvestItem[]
}

export enum SubRowAction {
  ToggleSubRow = 'toggleSubRow',
  UpdateRaw = 'updateRaw',
  SortRow = 'sortRow',
}

export interface InvestRowAction<R = DepartmentRow> {
  type: SubRowAction
  symbol?: string
  sortColumn?: string
  _des?: 'DESC' | 'ASC' | undefined
  rows?: R[]
}

type FilterExtend = {
  showFilter: boolean
  filterValue: string
  getFilteredData: (filterValue: string) => void
}
export type InvestOverviewTableProps<R = DepartmentRow> = {
  rawData: R[]
  wait?: number
  coinJson: any
  showLoading?: boolean
  rowConfig?: typeof RowConfig
} & XOR<FilterExtend, {}>

export enum ColumnKey {
  TYPE = 'TYPE',
  APR = 'APR',
  DURATION = 'DURATION',
  ACTION = 'ACTION',
}

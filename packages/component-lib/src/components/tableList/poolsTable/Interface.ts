import {
  Account,
  AmmDetail,
  CAMPAIGNTAGCONFIG,
  // ForexMap,
  RowConfig,
} from '@loopring-web/common-resources'
// import { Currency } from "@loopring-web/loopring-sdk";

export type PoolRow<T> = AmmDetail<T>
type FilterExtend = {
  showFilter?: boolean
  filterValue: string
  getFilteredData: (filterValue: string) => void
}
export type PoolTableProps<R extends PoolRow<T>, T = any> = {
  rawData: R[]
  handleWithdraw: (row: R) => void
  handleDeposit: (row: R) => void
  campaignTagConfig?: CAMPAIGNTAGCONFIG
  wait?: number
  tableHeight?: number
  showLoading?: boolean
  rowConfig?: typeof RowConfig
  forexValue?: number
} & FilterExtend

export type IconColumnProps<R> = {
  row: R
  account: Account
  size?: number
  campaignTagConfig?: CAMPAIGNTAGCONFIG
}

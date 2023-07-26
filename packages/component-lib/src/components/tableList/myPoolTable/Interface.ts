import {
  Account,
  AmmDetail,
  CoinKey,
  ForexMap,
  MyAmmLP,
  RowConfig,
} from '@loopring-web/common-resources'
import { Currency, LoopringMap, TokenInfo } from '@loopring-web/loopring-sdk'
import { EarningsDetail } from '../rewardTable'

export type MyPoolRow<R> = MyAmmLP<R> & {
  ammDetail: AmmDetail<R>
}

export type Method<R> = {
  handleWithdraw: (row: R) => void
  handleDeposit: (row: R) => void
  allowTrade?: any
}

export type MyPoolTableProps<R> = {
  rawData: R[]
  totalAMMClaims?: {
    detail: EarningsDetail[]
    totalDollar: string
  }
  account: Account
  title: string | (() => JSX.Element) | JSX.Element
  totalDollar?: string | number | undefined
  pagination?: {
    pageSize: number
  }
  filter: { searchValue: string }
  handleFilterChange: (props: { searchValue: string }) => void
  forexMap: ForexMap<Currency>
  idIndex: { [key: string]: string }
  tokenMap: LoopringMap<TokenInfo & { tradePairs: Array<CoinKey<R>> }>
  tokenPrices: { [key in keyof R]: number }
  allowTrade?: any
  tableHeight?: number
  showFilter?: boolean
  hideSmallBalances?: boolean
  wait?: number
  showloading?: boolean
  currency?: Currency
  rowConfig?: typeof RowConfig
  setHideSmallBalances?: (value: boolean) => void
  hideAssets?: boolean
} & Method<R>

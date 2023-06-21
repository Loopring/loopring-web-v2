import { CoinInfo, ForexMap } from '@loopring-web/common-resources'
import { Currency } from '@loopring-web/loopring-sdk'

export enum AmmTradeType {
  add = 'add',
  swap = 'swap',
  remove = 'remove',
}

enum TxStatus {
  processing = 'processing',
  processed = 'processed',
  received = 'received',
  failed = 'failed',
}

export interface AmmRecordRow<C> {
  totalDollar: number
  amountA: number
  amountB: number
  time: number
  type: keyof typeof AmmTradeType
  coinA: CoinInfo<C>
  coinB: CoinInfo<C>
  status?: keyof typeof TxStatus
}

export type AmmRecordTableProps<T, R = AmmRecordRow<T>> = {
  rawData: R[]
  pagination?: {
    pageSize: number
    total: number
  }
  scroll?: boolean
  page?: number
  handlePageChange?: (props: any) => void
  showFilter?: boolean
  wait?: number
  showloading?: boolean
  currentheight?: number
  rowHeight?: number
  headerRowHeight?: number
  currency?: Currency
  forexMap: ForexMap<Currency>
}
// rowHeight={RowConfig.rowHeight}
// headerRowHeight={RowConfig.headerRowHeight}
// currentheight={tableHeight}

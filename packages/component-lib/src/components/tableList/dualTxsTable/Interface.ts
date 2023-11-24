import {
  DualCurrentPrice,
  DualViewOrder,
  RowConfig,
  RowConfigType,
} from '@loopring-web/common-resources'
import { DualDetailType } from '../../tradePanel'

export type RawDataDualTxsItem = DualViewOrder & {
  amount: string
}

export type RawDataDualAssetItem = DualViewOrder & {
  amount: string
  currentPrice: DualCurrentPrice
}

export interface DualAssetTableProps<R> {
  rawData: R[]
  getDetail: (item: R) => DualDetailType
  dualMarketMap: any
  idIndex: { [key: string]: string }
  tokenMap: { [key: string]: any }
  showloading: boolean
  getDualAssetList: (props: any) => Promise<void>
  showDetail: (item: R) => void
  cancelReInvest: (item: R) => void
  refresh: (item: R) => void
  hideAssets?: boolean
  pagination?: {
    pageSize: number
    total: number
  }
  getProduct: (item: R) => void
  rowConfig?: typeof RowConfig
}

export interface DualTxsTableProps<R = RawDataDualTxsItem> {
  rawData: R[]
  pagination?: {
    pageSize: number
    total: number
  }
  idIndex: { [key: string]: string }
  tokenMap: { [key: string]: any }
  dualMarketMap: any
  getDualTxList: (props: any) => Promise<void>
  showloading: boolean
}

export enum LABEL_INVESTMENT_STATUS_MAP {
  INVESTMENT_RECEIVED = 'labelInvestmentStatusSettled',
  DELIVERING = 'labelInvestmentStatusDelivering',
  INVESTMENT_SUBSCRIBE = 'labelInvestmentStatusSubscribe',
}

import * as sdk from '@loopring-web/loopring-sdk'

export type RawDataDefiTxsItem = Partial<sdk.UserDefiTxsHistory>

export interface DefiTxsTableProps<R = RawDataDefiTxsItem> {
  rawData: R[]
  pagination?: {
    pageSize: number
    total: number
  }
  idIndex: { [key: string]: string }
  tokenMap: { [key: string]: any }
  getDefiTxList: (props: any) => Promise<void>
  showloading: boolean
}

export interface RawDataDefiSideStakingItem
  extends sdk.StakeInfoOrigin,
    Omit<sdk.STACKING_PRODUCT, 'status'> {
  status_product: number
}

export interface DefiSideStakingTableProps<R = RawDataDefiSideStakingItem> {
  rawData: R[]
  pagination?: {
    pageSize: number
    total: number
  }
  idIndex: { [key: string]: string }
  tokenMap: { [key: string]: any }
  geDefiSideStakingList: (props: any) => Promise<void>
  showloading: boolean
  redeemItemClick: (item: R) => void
  hideAssets?: boolean
  noMinHeight?: boolean
}

export type RawDataTaikoFarmingTxItem = sdk.STACKING_TRANSACTIONS & {
  stakingType: string
}

export interface TaikoFarmingTxTableProps<R = RawDataTaikoFarmingTxItem> {
  rawData: R[]
  pagination?: {
    pageSize: number
    total: number
  }
  idIndex: { [key: string]: string }
  tokenMap: { [key: string]: any }
  getSideStakingTxList: (props: any) => Promise<void>
  showloading: boolean
}

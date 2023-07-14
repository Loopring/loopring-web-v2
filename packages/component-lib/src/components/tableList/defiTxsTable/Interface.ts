import * as sdk from '@loopring-web/loopring-sdk'

export type RawDataDefiTxsItem = Partial<sdk.UserDefiTxsHistory>

export interface DefiTxsTableProps<R = RawDataDefiTxsItem> {
  // etherscanBaseUrl?: string;
  rawData: R[]
  pagination?: {
    pageSize: number
    total: number
  }
  idIndex: { [key: string]: string }
  tokenMap: { [key: string]: any }

  getDefiTxList: (props: any) => Promise<void>
  // filterTokens: string[];
  // showFilter?: boolean;
  showloading: boolean
  // accAddress: string;
  // accountId: number;
}

export interface RawDataDefiSideStakingItem
  extends sdk.StakeInfoOrigin,
    Omit<sdk.STACKING_PRODUCT, 'status'> {
  status_product: number
}

export interface DefiSideStakingTableProps<R = RawDataDefiSideStakingItem> {
  // etherscanBaseUrl?: string;
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
}

export type RawDataDefiSideStakingTxItem = sdk.STACKING_TRANSACTIONS & {
  stakingType: string
}

export interface DefiSideStakingTxTableProps<R = RawDataDefiSideStakingTxItem> {
  // etherscanBaseUrl?: string;
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

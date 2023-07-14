export type NFTTradeFilter = {
  side: undefined | 'SELL' | 'BUY'
  limit?: number
  offset?: number
  start?: number
  end?: number
  // pageSize:number,
  // duration?: DateRange<Date | string>;
  page?: number
}

export enum FilterTradeNFTTypes {
  // maker = "Maker",
  // taker = "Taker",
  allTypes = 'all',
  sell = 'sell',
  buy = 'buy',
  self = 'self',
}

export type NFTTradeProps<Row> = NFTTradeFilter & {
  etherscanBaseUrl?: string
  rawData: Row[]
  pagination?: {
    pageSize: number
    total: number
    page: number
  }
  idIndex: { [key: string]: string }
  tokenMap: any
  getTradeList: (filter: NFTTradeFilter) => Promise<void>
  showFilter?: boolean
  showLoading: boolean
  accAddress: string
  accountId: number
  currentHeight: number
  rowHeight?: number
  headerRowHeight?: number
  // accAddress?: string;
}

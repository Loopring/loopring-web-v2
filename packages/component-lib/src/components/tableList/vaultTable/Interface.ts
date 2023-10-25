import * as sdk from '@loopring-web/loopring-sdk'

export enum VaultRecordType {
  borrow = 'borrow',
  open = 'open',
  closeout = 'closeout',
  margin = 'margin',
  repay = 'repay',
  trade = 'trade',
}

export type RawDataVaultTxItem = {
  type: VaultRecordType
  status: sdk.VaultOperationStatus
  vSymbol: string
  vTokenB: string
  erc20SymbolB: string
  erc20Symbol: string
  mainContentRender: string | JSX.Element
  fillAmount: string
  percentage: string
  feeStr: string
  feeTokenSymbol: string
  raw_data: { operation: sdk.VaultOperation; order: sdk.VaultOrder }
  // fromAmount: string
  // fromSymbol: string
  // toAmount: string
  // toSymbol: string
  // fromFAmount: string
  // toFAmount: string
  // price: {
  //   key: string
  //   value: string
  //   from: string
  // }
  // feeAmount: string
  // feeSymbol: string
  // time: number
  // filledPercent: string
  // settledFromAmount: string
  // settledToAmount: string
}

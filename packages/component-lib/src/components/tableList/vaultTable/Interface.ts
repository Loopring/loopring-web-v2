export enum VaultRecordType {
  swap = 'swap',
  borrow = 'borrow',
  open = 'open',
  closeout = 'closeout',
  margin = 'margin',
}

export type RawDataVaultTxItem = {
  type: VaultRecordType
  fromAmount: string
  fromSymbol: string
  toAmount: string
  toSymbol: string
  fromFAmount: string
  toFAmount: string
  price: {
    key: string
    value: string
    from: string
  }
  feeAmount: string
  feeSymbol: string
  time: number
  filledPercent: string
  settledFromAmount: string
  settledToAmount: string
}

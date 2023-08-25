import { EXCHANGE_TYPE, WALLET_TYPE } from '@loopring-web/common-resources'
import { AddressType } from '@loopring-web/loopring-sdk'

const addressToExWalletMap: [AddressType, EXCHANGE_TYPE | WALLET_TYPE][] = [
  [AddressType.EXCHANGE_COINBASE, EXCHANGE_TYPE.Coinbase],
  [AddressType.EXCHANGE_BINANCE, EXCHANGE_TYPE.Binance],
  [AddressType.EXCHANGE_HUOBI, EXCHANGE_TYPE.Huobi],
  [AddressType.EXCHANGE_OTHER, EXCHANGE_TYPE.Others],
  [AddressType.EOA, WALLET_TYPE.EOA],
  [AddressType.LOOPRING_DEX_EOA, WALLET_TYPE.EOA],
  [AddressType.LOOPRING_HEBAO_CF, WALLET_TYPE.Loopring],
  [AddressType.LOOPRING_HEBAO_CONTRACT_1_1_6, WALLET_TYPE.Loopring],
  [AddressType.LOOPRING_HEBAO_CONTRACT_1_2_0, WALLET_TYPE.Loopring],
  [AddressType.LOOPRING_HEBAO_CONTRACT_2_0_0, WALLET_TYPE.Loopring],
  [AddressType.LOOPRING_HEBAO_CONTRACT_2_1_0, WALLET_TYPE.Loopring],
  [AddressType.LOOPRING_HEBAO_CONTRACT_2_2_0, WALLET_TYPE.Loopring],
  [AddressType.CONTRACT, WALLET_TYPE.OtherSmart],
]
export const addressToExWalletMapFn = (a: AddressType) => {
  const found = addressToExWalletMap.find((x) => x[0] === a)
  return found ? found[1] : undefined
}

const exWalletToAddressMap: [WALLET_TYPE | EXCHANGE_TYPE, AddressType][] = [
  [WALLET_TYPE.EOA, AddressType.EOA],
  [EXCHANGE_TYPE.Binance, AddressType.EXCHANGE_BINANCE],
  [EXCHANGE_TYPE.Huobi, AddressType.EXCHANGE_HUOBI],
  [EXCHANGE_TYPE.Others, AddressType.EXCHANGE_OTHER],
  [WALLET_TYPE.Loopring, AddressType.LOOPRING_HEBAO_CF], // to do: is here AddressType.LOOPRING_HEBAO_CF?
  [WALLET_TYPE.OtherSmart, AddressType.CONTRACT], // to do: is here AddressType.LOOPRING_HEBAO_CF?
]

export const exWalletToAddressMapFn = (a: WALLET_TYPE | EXCHANGE_TYPE) => {
  const found = exWalletToAddressMap.find((x) => x[0] === a)
  return found ? found[1] : undefined
}

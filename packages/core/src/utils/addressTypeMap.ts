import { EXCHANGE_TYPE, WALLET_TYPE } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

const addressToExWalletMap: [
  (typeof sdk.AddressType)[sdk.AddressTypeKeys],
  EXCHANGE_TYPE | WALLET_TYPE,
][] = [
  [sdk.AddressType.EXCHANGE_COINBASE, EXCHANGE_TYPE.Coinbase],
  [sdk.AddressType.EXCHANGE_BINANCE, EXCHANGE_TYPE.Binance],
  [sdk.AddressType.EXCHANGE_HUOBI, EXCHANGE_TYPE.Huobi],
  [sdk.AddressType.EXCHANGE_OTHER, EXCHANGE_TYPE.Others],
  [sdk.AddressType.EOA, WALLET_TYPE.EOA],
  [sdk.AddressType.LOOPRING_DEX_EOA, WALLET_TYPE.EOA],
  [sdk.AddressType.LOOPRING_HEBAO_CF, WALLET_TYPE.Loopring],
  [sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_1_6, WALLET_TYPE.Loopring],
  [sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_2_0, WALLET_TYPE.Loopring],
  [sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_0_0, WALLET_TYPE.Loopring],
  [sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_1_0, WALLET_TYPE.Loopring],
  [sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_2_0, WALLET_TYPE.Loopring],
  [sdk.AddressType.CONTRACT, WALLET_TYPE.OtherSmart],
]
export const addressToExWalletMapFn = (a: (typeof sdk.AddressType)[sdk.AddressTypeKeys]) => {
  const found = addressToExWalletMap.find((x) => x[0] === a)
  return found ? found[1] : undefined
}

const exWalletToAddressMap: [
  WALLET_TYPE | EXCHANGE_TYPE,
  (typeof sdk.AddressType)[sdk.AddressTypeKeys],
][] = [
  [WALLET_TYPE.EOA, sdk.AddressType.EOA],
  [EXCHANGE_TYPE.Binance, sdk.AddressType.EXCHANGE_BINANCE],
  [EXCHANGE_TYPE.Huobi, sdk.AddressType.EXCHANGE_HUOBI],
  [EXCHANGE_TYPE.Others, sdk.AddressType.EXCHANGE_OTHER],
  [WALLET_TYPE.Loopring, sdk.AddressType.LOOPRING_HEBAO_CF], // to do: is here sdk.AddressType.LOOPRING_HEBAO_CF?
  [WALLET_TYPE.OtherSmart, sdk.AddressType.CONTRACT], // to do: is here AddressType.LOOPRING_HEBAO_CF?
]

export const exWalletToAddressMapFn = (a: WALLET_TYPE | EXCHANGE_TYPE) => {
  const found = exWalletToAddressMap.find((x) => x[0] === a)
  return found ? found[1] : undefined
}

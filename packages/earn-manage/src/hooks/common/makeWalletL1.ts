import { store } from '@loopring-web/core'
import * as configDefault from '../../config/dualConfig.json'
import { MapChainId, WalletMap } from '@loopring-web/common-resources'

export const makeWalletL1 = () => {
  const { defaultNetwork } = store.getState().settings
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const { walletLayer1 } = store.getState().walletLayer1
  return walletLayer1 && configDefault
    ? configDefault[network]?.tokenList?.reduce((prev, item) => {
        if (walletLayer1[item?.toUpperCase()]) {
          prev[item] = walletLayer1[item?.toUpperCase()]
        }
        return prev
      }, {} as WalletMap<any>)
    : {}
}

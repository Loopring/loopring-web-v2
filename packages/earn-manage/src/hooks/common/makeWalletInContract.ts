import * as configDefault from '../../config/dualConfig.json'
import { store } from '@loopring-web/core'
import { useSettings } from '@loopring-web/component-lib'
import { MapChainId } from '@loopring-web/common-resources'

export const makeWalletInContract = async () => {
  //TODO callContract getBalance
  const { defaultNetwork } = store.getState().settings
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  return (
    configDefault &&
    configDefault[network]?.tokenList?.reduce((prev, item) => {
      //TODO
      // if (walletLayer1[item?.toUpperCase()]) {
      // 	prev[item] = walletLayer1[item?.toUpperCase()]
      // }
      //
      return prev
    }, {})
  )
}

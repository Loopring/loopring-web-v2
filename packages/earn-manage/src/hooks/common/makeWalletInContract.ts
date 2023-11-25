import * as configDefault from '../../config/dualConfig.json'
import { store } from '@loopring-web/core'

export const makeWalletInContract = async () => {
  //TODO callContract getBalance
  return configDefault?.tokenList?.reduce((prev, item) => {
    //TODO
    // if (walletLayer1[item?.toUpperCase()]) {
    // 	prev[item] = walletLayer1[item?.toUpperCase()]
    // }
    //
    return prev
  }, {})
}

import { accountServices } from './accountServices'
import { isCoinbaseSmartWallet, LoopringAPI, store, toggleCheck } from '../../index'
import { coinbaseSmartWalletChains, myLog } from '@loopring-web/common-resources'
import { ChainId, generateKeyPair } from '@loopring-web/loopring-sdk'
import { cleanAccountStatus } from '../../stores/account/reducer'

export const checkAccount = async (
  newAccAddress: string,
  chainId: ChainId | undefined,
) => {
  const { account } = store.getState()
  const accountInfoRealTime = await LoopringAPI.exchangeAPI?.getAccount({owner: newAccAddress})
  if (
    account.accAddress === '' ||
    account.accAddress.toLowerCase() !== newAccAddress.toLowerCase()
  ) {
    store.dispatch(cleanAccountStatus(undefined))
    accountServices.sendCheckAccount(newAccAddress, chainId)
  } else if (newAccAddress && newAccAddress !== '') {
    if (account.accountId === -1) {
      accountServices.sendCheckAccount(newAccAddress)
    } else if (accountInfoRealTime?.accInfo.accountId && account.apiKey && account.eddsaKey) {
      accountServices.sendAccountSigned({
        apiKey: account.apiKey,
        eddsaKey: account.eddsaKey,
        isInCounterFactualStatus: account.isInCounterFactualStatus,
        isContract: account.isContract,
      })
    } else {
      accountServices.sendAccountLock()
    }
  }
}

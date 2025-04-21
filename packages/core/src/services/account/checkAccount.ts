import { accountServices } from './accountServices'
import { isCoinbaseSmartWallet, LoopringAPI, store, toggleCheck } from '../../index'
import { coinbaseSmartWalletChains, myLog } from '@loopring-web/common-resources'
import { ChainId, generateKeyPair } from '@loopring-web/loopring-sdk'
import { cleanAccountStatus } from '../../stores/account/reducer'

export const checkAccount = async (
  newAccAddress: string,
  chainId: ChainId | undefined,
) => {
  const {account, localStore: {coinbaseSmartWalletPersist}} = store.getState()
  debugger
  const accountInfoRealTime = await LoopringAPI.exchangeAPI?.getAccount({owner: newAccAddress})
  if (
    account.accAddress === '' ||
    account.accAddress.toLowerCase() !== newAccAddress.toLowerCase()
  ) {
    store.dispatch(cleanAccountStatus(undefined))
    accountServices.sendCheckAccount(newAccAddress, chainId)
  } else if (newAccAddress && newAccAddress !== '') {
    const coinbaseSmartWallet = chainId && coinbaseSmartWalletChains.includes(chainId) && await isCoinbaseSmartWallet(newAccAddress, chainId)
    
    if (
      coinbaseSmartWallet &&
      coinbaseSmartWalletPersist.data &&
      coinbaseSmartWalletPersist.data.wallet.toLowerCase() === newAccAddress.toLowerCase() &&
      accountInfoRealTime?.accInfo.nonce === coinbaseSmartWalletPersist.data.nonce
    ) {
      const { eddsaKey } = coinbaseSmartWalletPersist.data
      LoopringAPI.userAPI
        ?.getUserApiKey(
          {
            accountId: accountInfoRealTime!.accInfo.accountId,
          },
          eddsaKey.sk,
        )
        .then((res) => {
          accountServices.sendAccountSigned({
            apiKey: res.apiKey,
            eddsaKey: eddsaKey,
            isInCounterFactualStatus: false,
            isContract: true,
            accountId: accountInfoRealTime!.accInfo.accountId,
          })
        })
        .catch((e) => {
          accountServices.sendCheckAccount(newAccAddress)
        })

    } else if (account.accountId === -1) {
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

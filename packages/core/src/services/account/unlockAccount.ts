import { ConnectProviders, connectProvides } from '@loopring-web/web3-provider'
import { callSwitchChain, LoopringAPI, store } from '../../index'
import { accountServices } from './accountServices'
import { myLog, UIERROR_CODE } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import Web3 from 'web3'
import { nextAccountSyncStatus } from '../../stores/account/reducer'

export async function unlockAccount() {
  myLog('unlockAccount starts')
  debugger
  const accounStore = store.getState().account
  const { exchangeInfo } = store.getState().system
  const { isMobile } = store.getState().settings
  myLog('unlockAccount account:', accounStore)
  accountServices.sendSign()
  if (
    exchangeInfo &&
    LoopringAPI.userAPI &&
    LoopringAPI.exchangeAPI &&
    LoopringAPI.walletAPI &&
    accounStore.nonce !== undefined &&
    connectProvides?.usedWeb3
  ) {
    let walletType, account: any, _chainId: any
    try {
      const connectName = (ConnectProviders[accounStore.connectName] ??
        accounStore.connectName) as unknown as sdk.ConnectorNames
      const walletTypePromise: Promise<{ walletType: any }> =
        window.ethereum && connectName === sdk.ConnectorNames.MetaMask && isMobile
          ? Promise.resolve({ walletType: undefined })
          : LoopringAPI.walletAPI.getWalletType({
              wallet: accounStore.accAddress,
            })
      ;[{ accInfo: account }, { walletType }, _chainId] = await Promise.all([
        LoopringAPI.exchangeAPI.getAccount({
          owner: accounStore.accAddress,
        }),
        walletTypePromise,
        connectProvides?.usedWeb3?.eth?.getChainId(),
      ])
        .then((response) => {
          if ((response[0] as sdk.RESULT_INFO)?.code) {
            throw response[0]
          }
          return response as any
        })
        .catch((error) => {
          throw error
        })

      const nonce = account ? account.nonce : accounStore.nonce

      const msg =
        account.keySeed && account.keySeed !== ''
          ? account.keySeed
          : sdk.GlobalAPI.KEY_MESSAGE.replace(
              '${exchangeAddress}',
              exchangeInfo.exchangeAddress,
            ).replace('${nonce}', (nonce - 1).toString())

      await callSwitchChain(_chainId)

      alert(JSON.stringify([
        {
          keyPair: {
            web3: connectProvides.usedWeb3 ? true: false,
            address: account.owner,
            keySeed: msg,
            walletType: connectName,
            chainId: Number(_chainId),
            accountId: Number(account.accountId),
            isMobile: isMobile,
          },
          request: {
            accountId: account.accountId,
          },
        },
        account.publicKey,
      ]))
      const response = await LoopringAPI.userAPI.unLockAccount(
        {
          keyPair: {
            web3: connectProvides.usedWeb3 as unknown as Web3,
            address: account.owner,
            keySeed: msg,
            walletType: connectName,
            chainId: Number(_chainId),
            accountId: Number(account.accountId),
            isMobile: isMobile,
          },
          request: {
            accountId: account.accountId,
          },
        },
        account.publicKey,
      )
      if (response.hasOwnProperty('apiKey') && response.hasOwnProperty('eddsaKey')) {
        accountServices.sendAccountSigned({
          apiKey: (response as any).apiKey,
          eddsaKey: (response as any).eddsaKey,
          isInCounterFactualStatus: walletType?.isInCounterFactualStatus,
          isContract: walletType?.isContract,
        })
        if (account?.accountId) {
          LoopringAPI.nftAPI
            ?.getHadUnknownCollection({
              accountId: account.accountId,
            })
            .then((_response) => {
              if ((_response as unknown as sdk.RESULT_INFO)?.code) {
                // console.error(_response)
                return
              }
              if (account && account.accountId === store.getState().account.accountId) {
                store.dispatch(
                  nextAccountSyncStatus({
                    ...store.getState().account,
                    hasUnknownCollection: _response,
                  }),
                )
              }
            })
            .catch((error) => {
              console.error(error)
            })
        }
      } else {
        throw response
      }
    } catch (e: any) {
      myLog('unlock', e)
      const error = LoopringAPI.exchangeAPI.genErr(e)
      const code = sdk.checkErrorInfo(error, true)
      switch (code) {
        case sdk.ConnectorError.USER_DENIED:
        case sdk.ConnectorError.USER_DENIED_2:
          accountServices.sendSignDeniedByUser()
          return
        default:
          break
      }
      accountServices.sendErrorUnlock(
        {
          msg: error.msg ?? error.message,
          code: error.code ?? UIERROR_CODE.UNKNOWN,
          ...error,
        },
        walletType,
      )
    }
  }
}

import { ConnectProviders, connectProvides } from '@loopring-web/web3-provider'
import { callSwitchChain, DAYS, getTimestampDaysLater, goUpdateAccountCoinbaseWalletUpdateAccountOnlyFn, isCoinbaseSmartWallet, isSameEVMAddress, LoopringAPI, store, WalletLayer2Map, web3Modal } from '../../index'
import { accountServices } from './accountServices'
import { Account, AccountStatus, MapChainId, myLog, UIERROR_CODE } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import Web3 from 'web3'
import { nextAccountSyncStatus } from '../../stores/account/reducer'
import Decimal from 'decimal.js'
import { updateWalletLayer2 } from '../../stores/walletLayer2/reducer'
import { AccountStep, setShowAccount, setShowActiveAccount } from '@loopring-web/component-lib'

export const hasLrTAIKODust = () => {
  const walletLayer2 = store.getState().walletLayer2.walletLayer2
  return walletLayer2 && walletLayer2['LRTAIKO'] && new Decimal(walletLayer2['LRTAIKO'].total).gt(0)
}
export const resetlrTAIKOIfNeeded = async (
  account: Account,
  defaultNetwork: sdk.ChainId,
  exchangeInfo: sdk.ExchangeInfo,
  retryTimes: number
) => {
  const taikoFarmingAccountStatus = await LoopringAPI?.defiAPI
    ?.getTaikoFarmingPositionInfo({
      accountId: account.accountId,
    })
    .then((res) => {
      return res.account.status
    })

  const walletLayer2 = store.getState().walletLayer2.walletLayer2

  if (
    !(
      taikoFarmingAccountStatus === 0 &&
      hasLrTAIKODust() &&
      account.apiKey
    )
  ) {
    return
  }
  if (retryTimes === 0) {
    throw new Error('retry_times_out')
  }
  const lrTAIKOBalanceInfo = walletLayer2!['LRTAIKO']
  const { broker } = await LoopringAPI.userAPI!.getAvailableBroker({
    type: 4,
  })
  const storageId = await LoopringAPI.userAPI!.getNextStorageId(
    {
      accountId: account.accountId,
      sellTokenId: lrTAIKOBalanceInfo.tokenId,
    },
    account.apiKey,
  )
  return LoopringAPI.vaultAPI
    ?.sendVaultResetToken(
      {
        request: {
          exchange: exchangeInfo!.exchangeAddress,
          payerAddr: account.accAddress,
          payerId: account.accountId,
          payeeId: 0,
          payeeAddr: broker,
          storageId: storageId.offchainId,
          token: {
            tokenId: lrTAIKOBalanceInfo.tokenId,
            volume: lrTAIKOBalanceInfo.total,
          },
          maxFee: {
            // @ts-ignore
            tokenId: lrTAIKOBalanceInfo.tokenId,
            volume: '0',
          },
          validUntil: getTimestampDaysLater(DAYS),
          memo: '',
        } as any,
        web3: undefined as any,
        chainId: defaultNetwork,
        walletType: sdk.ConnectorNames.Unknown,
        eddsaKey: account.eddsaKey.sk,
        apiKey: account.apiKey,
      },
      {
        accountId: account.accountId,
        counterFactualInfo: account.eddsaKey.counterFactualInfo,
      },
      '1',
    )
    .then(() => {
      store.dispatch(updateWalletLayer2({}))
    })
    .then(() => sdk.sleep(1000 * 2))
    .then(() => resetlrTAIKOIfNeeded(account, defaultNetwork, exchangeInfo, retryTimes - 1))
}

export const checkBeforeUnlock = async () => {
  const {
    account: { accAddress, nonce },
    settings: { defaultNetwork },
    localStore: { coinbaseSmartWalletPersist },
    system: { exchangeInfo },
  } = store.getState()
  if (coinbaseSmartWalletPersist?.data?.updateAccountData?.updateAccountNotFinished) {
    goUpdateAccountCoinbaseWalletUpdateAccountOnlyFn({
      isReset: false,
      updateAccountJSON: coinbaseSmartWalletPersist?.data?.updateAccountData?.json,
    })
    return false
  } else if (await isCoinbaseSmartWallet(accAddress, defaultNetwork)) {
    const hasCorrespondingKey =
      !!coinbaseSmartWalletPersist?.data?.eddsaKey?.sk &&
      coinbaseSmartWalletPersist?.data?.chainId === defaultNetwork &&
      isSameEVMAddress(coinbaseSmartWalletPersist?.data?.wallet, accAddress) &&
      coinbaseSmartWalletPersist?.data?.nonce === nonce
    if (hasCorrespondingKey) {
      store.dispatch(
        setShowAccount({ isShow: true, step: AccountStep.Coinbase_Smart_Wallet_Password_Input })
      )
      return false
    } else {
      store.dispatch(
        setShowActiveAccount({ isShow: true })
      )
      return false
    }
  }


  if (!exchangeInfo) {
    return false
  }
  return true
}

export async function unlockAccount() {

  const shouldContinue = await checkBeforeUnlock()
  if (!shouldContinue) {
    return
  }
  store.dispatch(
    setShowAccount({
      isShow: true,
      step: AccountStep.UpdateAccount_Approve_WaitForAuth,
    }),
  )
  myLog('unlockAccount starts')
  const accounStore = store.getState().account
  const { exchangeInfo } = store.getState().system
  const { isMobile, defaultNetwork } = store.getState().settings
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
              network: MapChainId[defaultNetwork] as sdk.NetworkWallet
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
        
        // send lrTAIKO back to operator
        resetlrTAIKOIfNeeded({...accounStore, ...account, ...response}, defaultNetwork, exchangeInfo, 5)
        .catch((error) => {
          console.error(error)
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
      if (e instanceof Error && e.message === 'sig is empty') {
        accountServices.sendErrorUnlock(
          {
            msg: 'Signature is empty, please try again',
            code: 1,
            message: 'Signature is empty, please try again'
          },
          walletType,
        )
        return 
      }
      const error = LoopringAPI.exchangeAPI.genErr(e)
      const code = sdk.checkErrorInfo(error, true)
      switch (code) {
        case sdk.ConnectorError.USER_DENIED:
        case sdk.ConnectorError.USER_DENIED_2: {          
          store.dispatch(
            setShowAccount({
              isShow: true,
              step: AccountStep.UnlockAccount_User_Denied,
            })
          )
          return
        }
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

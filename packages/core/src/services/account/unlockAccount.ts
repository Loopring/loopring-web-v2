import { ConnectProviders, connectProvides } from '@loopring-web/web3-provider'
import { callSwitchChain, DAYS, getTimestampDaysLater, LoopringAPI, store, WalletLayer2Map, web3Modal } from '../../index'
import { accountServices } from './accountServices'
import { Account, AccountStatus, MapChainId, myLog, UIERROR_CODE } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import Web3 from 'web3'
import { nextAccountSyncStatus } from '../../stores/account/reducer'
import Decimal from 'decimal.js'
import { keys } from 'lodash'

const resetlrTAIKOIfNeeded = async (
  account: Account,
  defaultNetwork: sdk.ChainId,
  exchangeInfo: sdk.ExchangeInfo,
  walletLayer2: WalletLayer2Map<any>
) => {

  const taikoFarmingAccountStatus = await LoopringAPI?.defiAPI
    ?.getTaikoFarmingPositionInfo({
      accountId: account.accountId,
    })
    .then((res) => {
      return res.account.status
    })

  debugger
  if (
    !(
      taikoFarmingAccountStatus === 0 &&
      walletLayer2 &&
      walletLayer2['LRTAIKO'] &&
      new Decimal(walletLayer2['LRTAIKO'].total).gt(0) &&
      account.apiKey
    )
  ) {
    return
  }
  const lrTAIKOBalanceInfo = walletLayer2['LRTAIKO']
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
  const fee = await LoopringAPI.userAPI!.getOffchainFeeAmt(
    {
      accountId: account.accountId,
      requestType: sdk.OffchainFeeReqType.TRANSFER,
    },
    account.apiKey,
  )
  const foundKey = keys(fee.fees).find(key => {
    return new Decimal(walletLayer2[key].total).gte(fee.fees[key].fee)
  })
  const foundFee = foundKey 
    ? fee.fees[foundKey]
    : undefined
  if (!foundFee) return
  
  return LoopringAPI.vaultAPI?.sendVaultResetToken(
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
          tokenId: foundFee.tokenId,
          volume: foundFee.fee,
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
    '1'
  )
}

export async function unlockAccount() {
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
        const state = store.getState()
        resetlrTAIKOIfNeeded({...accounStore, ...account, ...response}, defaultNetwork, exchangeInfo, state.walletLayer2.walletLayer2!)

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

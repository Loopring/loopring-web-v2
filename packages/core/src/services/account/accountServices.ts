import { AccountStatus, myLog, UIERROR_CODE } from '@loopring-web/common-resources'

import { Subject } from 'rxjs'
import { banxaService, LoopringAPI, OrderENDReason, store } from '../../index'
import * as sdk from '@loopring-web/loopring-sdk'
import _ from 'lodash'
import { resetLayer12Data, resetLayer2Data } from './resetAccount'
import { AccountCommands } from './command'
import { updateAccountStatus } from '../../stores/account/reducer'
import {
  setShowDeposit,
  setShowNFTDeploy,
  setShowNFTDeposit,
  setShowNFTMintAdvance,
  setShowNFTTransfer,
  setShowNFTWithdraw,
  setShowTransfer,
  setShowWithdraw,
  setShowActiveAccount,
  setShowExportAccount,
  setShowResetAccount,
  setShowRedPacket,
  setShowClaimWithdraw,
} from '@loopring-web/component-lib'

const subject = new Subject<{ status: AccountCommands; data: any }>()

export const accountServices = {
  //INFO: for update Account and unlock account
  sendSign: async () => {
    subject.next({
      status: AccountCommands.ProcessSign,
      data: undefined,
    })
  },
  sendSignDeniedByUser: () => {
    subject.next({
      status: AccountCommands.SignDeniedByUser,
      data: undefined,
    })
  },
  sendErrorUnlock: (error?: sdk.RESULT_INFO, walletType?: sdk.WalletType) => {
    subject.next({
      status: AccountCommands.ErrorSign,
      data: {
        walletType,
        error:
          error ??
          ({
            code: UIERROR_CODE.UNKNOWN,
            msg: 'unknown error',
          } as sdk.RESULT_INFO),
      },
    })
  },

  sendUpdateAccStatusAndReset: (readyState: AccountStatus, accountId: number = -1) => {
    store.dispatch(
      updateAccountStatus({
        accountId,
        readyState,
        apiKey: '',
        eddsaKey: '',
        publicKey: '',
        nonce: undefined,
      }),
    )

    if (readyState === AccountStatus.ERROR_NETWORK) {
      resetLayer12Data()
      subject.next({
        status: AccountCommands.ErrorNetwork,
        data: undefined,
      })
    } else {
      const { accAddress } = store.getState().account
      accountServices.sendCheckAccount(accAddress)
    }
  },
  sendAccountLock: async (accInfo?: sdk.AccountInfo) => {
    const updateInfo = accInfo
      ? {
          readyState: AccountStatus.LOCKED,
          accountId: accInfo.accountId,
          nonce: accInfo.nonce,
          level: accInfo.tags?.split(';').find((item) => /vip/gi.test(item)) ?? '',
          keyNonce: accInfo.keyNonce,
          keySeed: accInfo.keySeed,
          accAddress: accInfo.owner,
          hasUnknownCollection: undefined,
        }
      : {
          readyState: AccountStatus.LOCKED,
          apiKey: '',
          eddsaKey: '',
          publicKey: '',
          nonce: undefined,
          hasUnknownCollection: undefined,
        }
    store.dispatch(updateAccountStatus(updateInfo))
    store.dispatch(setShowTransfer({ isShow: false }))
    store.dispatch(setShowNFTTransfer({ isShow: false }))
    store.dispatch(setShowWithdraw({ isShow: false }))
    store.dispatch(setShowNFTWithdraw({ isShow: false }))
    store.dispatch(setShowDeposit({ isShow: false }))
    store.dispatch(setShowNFTDeposit({ isShow: false }))
    store.dispatch(setShowNFTDeploy({ isShow: false }))
    store.dispatch(setShowNFTMintAdvance({ isShow: false }))
    store.dispatch(setShowActiveAccount({ isShow: false }))
    store.dispatch(setShowResetAccount({ isShow: false }))
    store.dispatch(setShowExportAccount({ isShow: false }))
    store.dispatch(setShowRedPacket({ isShow: false }))
    store.dispatch(setShowClaimWithdraw({ isShow: false }))
    banxaService.banxaEnd({
      reason: OrderENDReason.UserCancel,
      data: { resource: 'Account Locked' },
    })

    resetLayer2Data()
    // await sleep(50)

    _.delay(() => {
      subject.next({
        status: AccountCommands.LockAccount,
        data: undefined,
      })
    }, 10)
  },
  sendActiveAccountDeposit: () => {},
  sendAccountSigned: ({
    // accountId,
    apiKey,
    // frozen,
    eddsaKey,
    // isReset,
    // keySeed,
    // nonce,
    isInCounterFactualStatus,
    isContract,
  }: {
    apiKey?: string
    eddsaKey?: any
    isInCounterFactualStatus?: boolean
    isContract?: boolean
  }) => {
    const updateInfo =
      apiKey && eddsaKey
        ? {
            // accountId,
            apiKey,
            eddsaKey,
            // nonce,
            // frozen,
            // keySeed,
            publicKey: {
              x: sdk.toHex(sdk.toBig(eddsaKey.keyPair.publicKeyX)),
              y: sdk.toHex(sdk.toBig(eddsaKey.keyPair.publicKeyY)),
            },
            readyState: AccountStatus.ACTIVATED,
            _accountIdNotActive: -1,
            isInCounterFactualStatus,
            isContract,
          }
        : { readyState: AccountStatus.ACTIVATED }

    store.dispatch(updateAccountStatus(updateInfo))
    subject.next({
      status: AccountCommands.AccountUnlocked,
      data: undefined,
    })
  },
  sendNoAccount: (ethAddress: string) => {
    store.dispatch(
      updateAccountStatus({
        readyState: AccountStatus.NO_ACCOUNT,
        accAddress: ethAddress,
        hasUnknownCollection: undefined,
        _accountIdNotActive: -1,
      }),
    )
    subject.next({
      status: AccountCommands.NoAccount,
      data: undefined,
    })
  },
  sendNeedUpdateAccount: async (accInfo: sdk.AccountInfo) => {
    myLog('sendNeedUpdateAccount accInfo:', accInfo)
    store.dispatch(
      updateAccountStatus({
        readyState: AccountStatus.NOT_ACTIVE,
        accAddress: accInfo.owner,
        _accountIdNotActive: accInfo.accountId,
        tags: accInfo.tags,
        nonce: accInfo.nonce,
        keySeed: accInfo.keySeed,
        hasUnknownCollection: undefined,
      }),
    )
    subject.next({
      status: AccountCommands.SignAccount,
      data: accInfo,
    })
  },
  sendCheckAccount: async (ethAddress: string, _chainId?: sdk.ChainId | undefined) => {
    myLog('After connect >>,sendCheckAccount: step3 processAccountCheck', ethAddress)
    const account = store.getState().account
    subject.next({
      status: AccountCommands.ProcessAccountCheck,
      data: undefined,
    })

    if (
      ethAddress &&
      LoopringAPI.exchangeAPI &&
      ((_chainId && LoopringAPI?.__chainId__?.toString() == _chainId.toString()) || !_chainId)
    ) {
      const { accInfo } = await LoopringAPI.exchangeAPI.getAccount({
        owner: ethAddress,
      })
      if (accInfo === undefined) {
        if (
          account.readyState !== AccountStatus.NO_ACCOUNT ||
          account.accountId !== -1 ||
          account.accAddress.toLowerCase() !== ethAddress.toLowerCase()
        ) {
          myLog('-------sendCheckAccount sendNoAccount!')
          accountServices.sendNoAccount(ethAddress)
        }
      } else {
        if (account.accountId == accInfo.accountId && account.publicKey.x) {
          myLog('-------sendCheckAccount already Unlock!')
          accountServices.sendAccountSigned({
            ...account,
          })
        } else if (accInfo.accountId) {
          if (!accInfo.publicKey.x || !accInfo.publicKey.y) {
            myLog('-------sendCheckAccount need update account!')
            accountServices.sendNeedUpdateAccount({
              ...accInfo,
            })
          } else {
            myLog('-------sendCheckAccount need unlockAccount!', accInfo)
            accountServices.sendAccountLock(accInfo)
          }
        } else {
          myLog('-------sendCheckAccount  unexpected accInfo:', accInfo)
          throw Error('unexpected accinfo:' + accInfo)
        }
      }
    } else {
      myLog('-------sendCheckAccount unexpected no ethAddress:' + ethAddress)
      store.dispatch(
        updateAccountStatus({
          accAddress: ethAddress,
          readyState: AccountStatus.UN_CONNECT,
          hasUnknownCollection: undefined,
          _accountIdNotActive: -1,
        }),
      )
    }
  },

  onSocket: () => subject.asObservable(),
}

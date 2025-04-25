import {
  AccountStep,
  setShowAccount,
  setShowConnect,
  setShowWrongNetworkGuide,
  WalletConnectStep,
} from '@loopring-web/component-lib'
import { Account, AccountStatus, fnType, myLog, SPECIAL_ACTIVATION_NETWORKS } from '@loopring-web/common-resources'
import { accountReducer, isCoinbaseSmartWallet, store, unlockAccount, web3Modal } from '../../index'
import _ from 'lodash'
import { connectProvides } from '@loopring-web/web3-provider'
import { ChainId } from '@loopring-web/loopring-sdk'

export const accountStaticCallBack = (
  onclickMap: { [key: number]: [fn: (props: any) => any, args?: any[]] },
  deps?: any[],
) => {
  const { readyState } = store.getState().account

  let fn, args
  ;[fn, args] = onclickMap[readyState] ? onclickMap[readyState] : []
  if (typeof fn === 'function') {
    args = [...(args ?? []), ...(deps ?? [])] as [props: any]
    return fn.apply(this, args)
  }
}
const activeBtnLabelFn = function (options?: {chainId: ChainId, isEarn: boolean, readyState: AccountStatus}) {
  const isSpecialActivation = options?.isEarn && SPECIAL_ACTIVATION_NETWORKS.includes(options.chainId)
  if (isSpecialActivation) {
    return options?.readyState === AccountStatus.NOT_ACTIVE ? 'Complete Sign in' : 'labelDeposit'
  } else {
    return 'labelDepositAndActiveBtn'
  }
}

export const btnLabel = {
  [fnType.UN_CONNECT]: [
    function () {
      return `labelConnectWallet`
    },
  ],
  [fnType.ERROR_NETWORK]: [
    function () {
      return `labelWrongNetwork`
    },
  ],
  [fnType.NO_ACCOUNT]: [activeBtnLabelFn],
  [fnType.DEFAULT]: [activeBtnLabelFn],
  [fnType.DEPOSITING]: [activeBtnLabelFn],
  [fnType.NOT_ACTIVE]: [activeBtnLabelFn],
  [fnType.ACTIVATED]: [
    function () {
      return undefined
    },
  ],
  [fnType.LOCKED]: [
    function () {
      return `labelUnLockLayer2`
    },
  ],
}
export const goActiveAccount = async (options?: {
  chainId: ChainId
  isEarn: boolean
  readyState: AccountStatus
  specialActivation: () => Promise<void>
  specialActivationDeposit: () => Promise<void>
}) => {
  const isSpecialActivation = options?.isEarn && SPECIAL_ACTIVATION_NETWORKS.includes(options.chainId)
  if (isSpecialActivation) {
    if (options.readyState === AccountStatus.NOT_ACTIVE) {
      return options.specialActivation()
    } else {
      return options.specialActivationDeposit()
    }
  } else {
    store.dispatch(accountReducer.changeShowModel({ _userOnModel: false }))
    store.dispatch(setShowAccount({ isShow: true, step: AccountStep.CheckingActive }))
  }
}
export const geDepositingActive = () => {
  // const { system, localStore, account } = store.getState();
  // const isDepositing =
  //   localStore.chainHashInfos[system?.chainId].depositHashes[
  //     account?.accAddress
  //     ];
  // if(isDepositing){
  //
  // }else{
  //
  // }
}

export const btnClickMap: {
  [key: string]: [fn: (props: any) => any, args?: any[]]
} = {
  [fnType.ERROR_NETWORK]: [
    function () {
      store.dispatch(accountReducer.changeShowModel({ _userOnModel: false }))
      store.dispatch(setShowWrongNetworkGuide({ isShow: true }))
    },
  ],
  [fnType.UN_CONNECT]: [
    function () {
      myLog('UN_CONNECT!')
      web3Modal.open()
    },
  ],
  [fnType.NO_ACCOUNT]: [goActiveAccount],
  [fnType.DEPOSITING]: [goActiveAccount],
  [fnType.NOT_ACTIVE]: [goActiveAccount],
  [fnType.LOCKED]: [
    async function (info) {
      const { account: { accAddress }, settings: { defaultNetwork } } = store.getState()
      const coinbaseSmartWallet = await isCoinbaseSmartWallet(accAddress, defaultNetwork)
      if (coinbaseSmartWallet) {
        store.dispatch(setShowAccount({ isShow: true, step: AccountStep.Coinbase_Smart_Wallet_Password_Input }))
        return
      }

      if (!info?.exchangeInfoLoaded) {
        return
      }
      unlockAccount()
      store.dispatch(accountReducer.changeShowModel({ _userOnModel: true }))
      store.dispatch(
        setShowAccount({
          isShow: true,
          step: AccountStep.UpdateAccount_Approve_WaitForAuth,
        }),
      )
    },
  ],
}

export const btnConnectL1kMap = Object.assign(_.cloneDeep(btnClickMap), {
  [fnType.ACTIVATED]: [
    function () {
      web3Modal.open()
    },
  ],
  [fnType.NO_ACCOUNT]: [
    function () {
      web3Modal.open()
    },
  ],
  [fnType.DEPOSITING]: [
    function () {
      web3Modal.open()
    },
  ],
  [fnType.NOT_ACTIVE]: [
    function () {
      web3Modal.open()
      
    },
  ],
  [fnType.LOCKED]: [
    function () {
      web3Modal.open()
    },
  ],
})

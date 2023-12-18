import React from 'react'

import { ButtonComponentsMap, fnType, myLog } from '@loopring-web/common-resources'

import {
  accountReducer,
  accountStaticCallBack,
  btnClickMap,
  store,
  useAccount,
  useNotify,
  useSelectNetwork,
} from '@loopring-web/core'

import { AccountStep, useOpenModals } from '@loopring-web/component-lib'

import _ from 'lodash'
export enum RouterPath {
  dashboard = '/dashboard',
  record = '/record',
  //404? loading
  loading = '/loading',
}
export const useHeader = () => {
  const accountTotal = useAccount()
  const { account, setShouldShow, status: accountStatus } = accountTotal
  const { setShowAccount } = useOpenModals()
  const { NetWorkItems } = useSelectNetwork({ className: 'header' })

  const _btnClickMap = Object.assign(_.cloneDeep(btnClickMap), {
    [fnType.ACTIVATED]: [
      function () {
        store.dispatch(accountReducer.changeShowModel({ _userOnModel: true }))
        store.dispatch(setShowAccount({ isShow: true, step: AccountStep.HadAccount }))
      },
    ],
    [fnType.LOCKED]: [
      function () {
        store.dispatch(accountReducer.changeShowModel({ _userOnModel: true }))
        store.dispatch(setShowAccount({ isShow: true, step: AccountStep.HadAccount }))
      },
    ],
  })

  const onWalletBtnConnect = React.useCallback(async () => {
    myLog(`onWalletBtnConnect click: ${account.readyState}`)
    accountStaticCallBack(_btnClickMap, [])
  }, [account, setShouldShow, _btnClickMap])
  const [headerToolBarData, setHeaderToolBarData] = React.useState({
    [ButtonComponentsMap.WalletConnect as string]: {
      buttonComponent: ButtonComponentsMap.WalletConnect,
      label: 'labelConnectWallet',
      handleClick: onWalletBtnConnect,
      accountState: undefined,
      isLayer1Only: true,
    },
  })
  React.useEffect(() => {
    if (accountStatus && accountStatus === 'UNSET') {
      const account = store.getState().account
      setHeaderToolBarData((headerToolBarData) => {
        headerToolBarData[ButtonComponentsMap.WalletConnect as string] = {
          ...headerToolBarData[ButtonComponentsMap.WalletConnect],
          NetWorkItems,
          isLayer1Only: true,
          accountState: { account },
        }
        return headerToolBarData
      })
    }
    // forceUpdate()
  }, [accountStatus, account.readyState])
  const { notifyMap } = useNotify()

  return {
    headerToolBarData,
    headerMenuLandingData: [
      {
        label: {
          id: 'dashboard',
          i18nKey: 'labelDashBoard',
        },
        router: { path: '/' },
      },
      {
        label: {
          id: 'record',
          i18nKey: 'labelRecord',
        },
        router: { path: RouterPath.record },
      },
    ],
    account,
    notifyMap,
  }
}

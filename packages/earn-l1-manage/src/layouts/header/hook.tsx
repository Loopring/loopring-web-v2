import React from 'react'

import {
  ButtonComponentsMap,
  fnType,
  headerMenuLandingData,
  headerToolBarData as _initHeaderToolBarData,
  myLog,
} from '@loopring-web/common-resources'

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

export const useHeader = () => {
  const accountTotal = useAccount()
  const { account, setShouldShow, status: accountStatus } = accountTotal
  const { setShowAccount } = useOpenModals()
  const { NetWorkItems } = useSelectNetwork({ className: 'header' })
  const [headerToolBarData, setHeaderToolBarData] = React.useState<typeof _initHeaderToolBarData>([
    {},
    {},
    {},
    {},
    {
      buttonComponent: ButtonComponentsMap.WalletConnect,
      label: 'labelConnectWallet',
      accountState: undefined,
      handleClick: undefined,
      isLayer1Only: true,
    },
  ])
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

  React.useEffect(() => {
    if (accountStatus && accountStatus === 'UNSET') {
      const account = store.getState().account
      setHeaderToolBarData((headerToolBarData) => {
        headerToolBarData[ButtonComponentsMap.WalletConnect] = {
          ...headerToolBarData[ButtonComponentsMap.WalletConnect],
          handleClick: onWalletBtnConnect,
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
    headerMenuLandingData: [],
    account,
    notifyMap,
  }
}

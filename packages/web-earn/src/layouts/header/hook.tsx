import React from 'react'

import {
  fnType,
  headerMenuDataMap,
  headerMenuLandingData,
  MapChainId,
  ProfileIndex,
  SagaStatus,
} from '@loopring-web/common-resources'

import {
  accountReducer,
  useAccount,
  store,
  useNotify,
  accountStaticCallBack,
  btnClickMap,
  useSelectNetwork,
} from '@loopring-web/core'

import { AccountStep, useOpenModals, useSettings } from '@loopring-web/component-lib'
import { myLog, ButtonComponentsMap } from '@loopring-web/common-resources'

import _ from 'lodash'
import {
  headerMenuDataEarnMap,
  headerToolBarEarnData,
  toolBarAvailableEarnItem,
} from '../../constant/router'

export const useHeader = () => {
  const accountTotal = useAccount()
  const { defaultNetwork } = useSettings()
  const { account, setShouldShow, status: accountStatus } = accountTotal
  const { setShowAccount } = useOpenModals()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  const _btnClickMap = Object.assign(_.cloneDeep(btnClickMap), {
    [fnType.NO_ACCOUNT]: [
      function () {
        store.dispatch(accountReducer.changeShowModel({ _userOnModel: true }))
        setShowAccount({ isShow: true, step: AccountStep.NoAccount })
      },
    ],
    [fnType.DEPOSITING]: [
      function () {
        store.dispatch(accountReducer.changeShowModel({ _userOnModel: true }))
        setShowAccount({ isShow: true, step: AccountStep.NoAccount })
      },
    ],
    [fnType.NOT_ACTIVE]: [
      function () {
        store.dispatch(accountReducer.changeShowModel({ _userOnModel: true }))
        setShowAccount({ isShow: true, step: AccountStep.NoAccount })
      },
    ],
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

  const { NetWorkItems } = useSelectNetwork({ className: 'header' })

  const [headerToolBarData, setHeaderToolBarData] = React.useState<typeof headerToolBarEarnData>({
    ...headerToolBarEarnData,
  })

  React.useEffect(() => {
    if ([SagaStatus.UNSET, SagaStatus.DONE].includes(accountStatus)) {
      const account = store.getState().account
      setHeaderToolBarData((headerToolBarData) => {
        headerToolBarData[ButtonComponentsMap.WalletConnect] = {
          ...headerToolBarData[ButtonComponentsMap.WalletConnect],
          handleClick: onWalletBtnConnect,
          NetWorkItems,
          accountState: { account },
        }
        return headerToolBarData
      })
    }
  }, [accountStatus, account?.readyState])
  const { notifyMap } = useNotify()
  return {
    headerToolBarData,
    headerMenuData: headerMenuDataEarnMap[network],
    account,
    notifyMap,
  }
}

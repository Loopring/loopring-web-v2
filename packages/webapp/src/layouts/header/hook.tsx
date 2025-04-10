import React from 'react'

import {
  ButtonComponentsMap,
  fnType,
  headerMenuDataMap,
  headerMenuLandingData,
  headerToolBarData as _initHeaderToolBarData,
  headerToolBarDataMobile as _initHeaderToolBarDataMobile,
  MapChainId,
  Profile,
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
  useNotificationFunc,
  unlockAccount,
} from '@loopring-web/core'

import { AccountStep, useOpenModals, useSettings, useToggle } from '@loopring-web/component-lib'
import { myLog } from '@loopring-web/common-resources'

import _ from 'lodash'
import { useAppKit } from '@reown/appkit/react'

export const useHeader = () => {
  const accountTotal = useAccount()
  const { defaultNetwork, isMobile } = useSettings()
  const { account, setShouldShow, status: accountStatus } = accountTotal
  const { setShowAccount } = useOpenModals()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const profile = ProfileIndex[network]
  const modal = useAppKit()

  const _btnClickMap = Object.assign(_.cloneDeep(btnClickMap), {
    [fnType.NO_ACCOUNT]: [
      function () {
        modal.open()
      },
    ],
    [fnType.DEPOSITING]: [
      function () {
        modal.open()
      },
    ],
    [fnType.NOT_ACTIVE]: [
      function () {
        modal.open()
      },
    ],
    [fnType.ACTIVATED]: [
      function () {
        modal.open()
      },
    ],

    [fnType.LOCKED]: [
      function () {
        modal.open()
      },
    ],
  })

  const onWalletBtnConnect = React.useCallback(async () => {
    myLog(`onWalletBtnConnect click: ${account.readyState}`)
    accountStaticCallBack(_btnClickMap, [])
  }, [account, setShouldShow, _btnClickMap])
  const { NetWorkItems } = useSelectNetwork({ className: 'header' })

  const headerToolBarData = React.useMemo(() => {
    const toolBarData = isMobile ? _initHeaderToolBarDataMobile : _initHeaderToolBarData
    return [SagaStatus.UNSET, SagaStatus.DONE].includes(accountStatus)
      ? {
          ...toolBarData,
          [ButtonComponentsMap.WalletConnect]: {
            ...toolBarData[ButtonComponentsMap.WalletConnect],
            handleClick: onWalletBtnConnect,
            handleClickUnlock: () => {
              unlockAccount()
              setShowAccount({
                isShow: true,
                step: AccountStep.UpdateAccount_Approve_WaitForAuth,
              })
            },
            NetWorkItems,
            accountState: { account },
            handleClickSignIn: async () => {
              setShowAccount({ isShow: true, step: AccountStep.CheckingActive })
            },
          },
          [ButtonComponentsMap.ProfileMenu]: {
            ...toolBarData[ButtonComponentsMap.ProfileMenu],
            subMenu: profile.map((item: string) => Profile[item]),
            readyState: account.readyState,
          },
        }
      : toolBarData
  }, [accountStatus, account?.readyState, account, isMobile])

  const { notifyMap, myNotifyMap } = useNotify()
  const toggle = useToggle()
  const showVault = toggle.toggle.VaultInvest.enable || toggle.toggle.isSupperUser
  const headerMenuData = headerMenuDataMap[network].filter((menu) =>
    showVault ? true : menu.label.id !== 'vault',
  )
  return {
    headerToolBarData,
    headerMenuData,
    headerMenuLandingData,
    account,
    notifyMap,
    myNotifyMap,
  }
}

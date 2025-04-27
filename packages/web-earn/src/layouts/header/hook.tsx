import React, { useMemo } from 'react'

import {
  ButtonComponentsMap,
  fnType,
  headerMenuLandingData,
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
  unlockAccount,
  useUpdateAccount,
  LoopringAPI,
  isCoinbaseSmartWallet,
} from '@loopring-web/core'

import { AccountStep, useOpenModals, useSettings, useToggle } from '@loopring-web/component-lib'
import { myLog } from '@loopring-web/common-resources'

import _ from 'lodash'
import { earnHeaderToolBarData, earnHeaderToolBarDataMobile, headerMenuDataEarnMap } from '../../constant/router'
import { useAppKit } from '@reown/appkit/react'
import { useCoinbaseSmartWalletPersist } from '@loopring-web/core/src/stores/localStore/coinbaseSmartWalletPersist'

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
  const { goUpdateAccountCoinbaseWalletUpdateAccountOnly } = useUpdateAccount() 
  const { data } = useCoinbaseSmartWalletPersist()
  const headerToolBarData = React.useMemo(() => {
    const toolBarData = isMobile ? earnHeaderToolBarDataMobile : earnHeaderToolBarData
    return [SagaStatus.UNSET, SagaStatus.DONE].includes(accountStatus)
      ? {
          ...toolBarData,
          [ButtonComponentsMap.WalletConnect]: {
            ...toolBarData[ButtonComponentsMap.WalletConnect],
            handleClick: onWalletBtnConnect,
            handleClickUnlock: async () => {              

              unlockAccount()
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
  
  const { notifyMap } = useNotify()
  const { toggle: {
    taikoFarming
  } } = useToggle()
  // const taikoFarming={enable: true}

  return {
    headerToolBarData,
    headerMenuData: headerMenuDataEarnMap[network].filter(data => {
      return data.label.id === 'taikoFarming' 
        ? taikoFarming.enable
        : true
    }),
    headerMenuLandingData,
    account,
    notifyMap,
  }
}

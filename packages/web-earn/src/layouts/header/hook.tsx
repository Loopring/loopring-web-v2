import React from 'react'

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
} from '@loopring-web/core'

import { AccountStep, useOpenModals, useSettings } from '@loopring-web/component-lib'
import { myLog } from '@loopring-web/common-resources'

import _ from 'lodash'
import { earnHeaderToolBarData, EarnProfile, headerMenuDataEarnMap } from '../../constant/router'
import { useWeb3Modal } from '@web3modal/scaffold-react'

export const useHeader = () => {
  const accountTotal = useAccount()
  const { defaultNetwork } = useSettings()
  const { account, setShouldShow, status: accountStatus } = accountTotal
  const { setShowAccount } = useOpenModals()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const profile = ProfileIndex[network]
  const modal = useWeb3Modal()

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

  const [headerToolBarData, setHeaderToolBarData] = React.useState<typeof earnHeaderToolBarData>({
    ...earnHeaderToolBarData,
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
        headerToolBarData[ButtonComponentsMap.ProfileMenu] = {
          ...headerToolBarData[ButtonComponentsMap.ProfileMenu],
          subMenu: profile.map((item: string) => Profile[item]),
          readyState: account.readyState,
        }
        return headerToolBarData
      })
    }
  }, [accountStatus, account?.readyState])
  const { notifyMap } = useNotify()

  return {
    headerToolBarData,
    headerMenuData: headerMenuDataEarnMap[network],
    headerMenuLandingData,
    account,
    notifyMap,
  }
}

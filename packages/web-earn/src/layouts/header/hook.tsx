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
} from '@loopring-web/core'

import { AccountStep, useOpenModals, useSettings, useToggle } from '@loopring-web/component-lib'
import { myLog } from '@loopring-web/common-resources'

import _ from 'lodash'
import { earnHeaderToolBarData, EarnProfile, headerMenuDataEarnMap } from '../../constant/router'
import { useWeb3Modal } from '@web3modal/scaffold-react'
import { toBig } from '@loopring-web/loopring-sdk'

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
  const { goUpdateAccount } = useUpdateAccount() 
  const headerToolBarData = React.useMemo(() => {
    return [SagaStatus.UNSET, SagaStatus.DONE].includes(accountStatus)
      ? {
          ...earnHeaderToolBarData,
          [ButtonComponentsMap.WalletConnect]: {
            ...earnHeaderToolBarData[ButtonComponentsMap.WalletConnect],
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
              const feeInfo = await LoopringAPI?.globalAPI?.getActiveFeeInfo({
                accountId: account._accountIdNotActive,
              })
              const { userBalances } = await LoopringAPI?.globalAPI?.getUserBalanceForFee({
                accountId: account._accountIdNotActive!,
                tokens: '',
              })
              const found = Object.keys(feeInfo.fees).find((key) => {
                const fee = feeInfo.fees[key].fee
                const foundBalance = userBalances[feeInfo.fees[key].tokenId]
                return (foundBalance && toBig(foundBalance.total).gte(fee)) || toBig(fee).eq('0')
              })
              await goUpdateAccount({
                isFirstTime: true,
                isReset: false,
                // @ts-ignore
                feeInfo: {
                  token: feeInfo.fees[found!].fee,
                  belong: found!,
                  fee: feeInfo.fees[found!].fee,
                  feeRaw: feeInfo.fees[found!].fee,
                },
              })
              
            },
          },
          [ButtonComponentsMap.ProfileMenu]: {
            ...earnHeaderToolBarData[ButtonComponentsMap.ProfileMenu],
            subMenu: profile.map((item: string) => Profile[item]),
            readyState: account.readyState,
          },
        }
      : earnHeaderToolBarData
  }, [accountStatus, account?.readyState, account])
  
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

import { AccountStep, ResetProps, useOpenModals } from '@loopring-web/component-lib'

import {
  useBtnStatus,
  useUpdateAccount,
  useChargeFees,
  useModalData,
  makeWalletLayer2,
  useWalletLayer2,
  store,
} from '../../index'
import { updateActiveAccountData as updateActiveAccountDataRedux } from '@loopring-web/core'

import { LIVE_FEE_TIMES, myLog, SagaStatus, WalletMap } from '@loopring-web/common-resources'
import React from 'react'

export const useActiveAccount = <T>(): {
  activeAccountProps: ResetProps<T>
  activeAccountCheckFeeIsEnough: (props?: { isRequiredAPI: true; intervalTime?: number }) => void
} => {
  const { btnStatus, enableBtn, disableBtn } = useBtnStatus()
  const {
    setShowActiveAccount,
    setShowAccount,
    modals: {
      isShowActiveAccount: { isShow, info },
    },
  } = useOpenModals()
  const { status: walletLayer2Status } = useWalletLayer2()
  const [walletMap, setWalletMap] = React.useState(
    makeWalletLayer2({ needFilterZero: true, isActive: true }).walletMap ?? ({} as WalletMap<any>),
  )
  const { goUpdateAccount } = useUpdateAccount()
  const { activeAccountValue } = useModalData()
  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    checkFeeIsEnough,
    resetIntervalTime,
  } = useChargeFees({
    isActiveAccount: true,
    requestType: 'UPDATE_ACCOUNT_BY_NEW' as any,
    updateData: ({ fee, chargeFeeTokenList, isFeeNotEnough }) => {
      const { activeAccountValue } = store.getState()._router_modalData
      // const { tags } = store.getState().account;
      myLog('activeAccountValue feeInfo', fee, isFeeNotEnough)

      store.dispatch(
        updateActiveAccountDataRedux({
          ...activeAccountValue,
          fee,
          isFeeNotEnough,
          chargeFeeList:
            chargeFeeTokenList && chargeFeeTokenList.length
              ? chargeFeeTokenList
              : activeAccountValue?.chargeFeeList && activeAccountValue?.chargeFeeList.length
              ? activeAccountValue?.chargeFeeList
              : [],
        }),
      )
    },
  })
  const walletLayer2Callback = React.useCallback(() => {
    const walletMap = makeWalletLayer2({ needFilterZero: true, isActive: true }).walletMap ?? {}
    setWalletMap(walletMap)
    checkFeeIsEnough()
  }, [])
  React.useEffect(() => {
    if (walletLayer2Callback && walletLayer2Status === SagaStatus.UNSET) {
      walletLayer2Callback()
    }
  }, [walletLayer2Status])
  React.useEffect(() => {
    if (isFeeNotEnough.isFeeNotEnough) {
      disableBtn()
    } else {
      enableBtn()
    }
  }, [isFeeNotEnough.isFeeNotEnough])
  React.useEffect(() => {
    if (isShow) {
      checkFeeIsEnough({ isRequiredAPI: true, intervalTime: LIVE_FEE_TIMES })
    } else {
      resetIntervalTime()
    }
    return () => {
      resetIntervalTime()
    }
  }, [isShow])

  const activeAccountProps: ResetProps<any> = {
    onResetClick: ({
      isFirstTime = false,
      isReset = false,
    }: {
      isFirstTime?: boolean
      isReset?: boolean
    }) => {
      if (activeAccountValue?.fee?.belong && activeAccountValue?.fee?.__raw__) {
        setShowActiveAccount({ isShow: false })
        goUpdateAccount({
          isFirstTime,
          isReset,
          feeInfo: activeAccountValue.fee,
        })
      }
    },
    isReset: info?.isReset,
    isNewAccount: true,
    resetBtnStatus: btnStatus,
    goToDeposit: () => {
      setShowActiveAccount({ isShow: false })
      setShowAccount({ isShow: true, step: AccountStep.AddAssetGateway })
      // setShowDeposit({ isShow: true });
    },
    walletMap,
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo: activeAccountValue.fee,
  }

  return {
    activeAccountProps,
    activeAccountCheckFeeIsEnough: checkFeeIsEnough,
  }
}

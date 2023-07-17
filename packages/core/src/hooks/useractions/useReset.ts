import React from 'react'

import { ResetProps, useOpenModals } from '@loopring-web/component-lib'
import { FeeInfo, LIVE_FEE_TIMES } from '@loopring-web/common-resources'
import { useBtnStatus, useChargeFees } from '../../index'
import * as sdk from '@loopring-web/loopring-sdk'
import { useUpdateAccount } from './useUpdateAccount'

export const useReset = <T extends FeeInfo>(): {
  resetProps: ResetProps<T>
} => {
  const { btnStatus, enableBtn, disableBtn } = useBtnStatus()
  const {
    setShowResetAccount,
    modals: {
      isShowResetAccount: { isShow },
    },
  } = useOpenModals()

  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
    resetIntervalTime,
  } = useChargeFees({
    requestType: sdk.OffchainFeeReqType.UPDATE_ACCOUNT,
    updateData: () => {},
  })
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
      return
    } else {
      resetIntervalTime()
    }
    return () => {
      resetIntervalTime()
    }
  }, [isShow])

  const { goUpdateAccount } = useUpdateAccount()

  const onResetClick = React.useCallback(() => {
    setShowResetAccount({ isShow: false })
    goUpdateAccount({ isReset: true, feeInfo: feeInfo })
  }, [goUpdateAccount, feeInfo])

  const resetProps: ResetProps<any> = {
    isFeeNotEnough,
    onResetClick,
    resetBtnStatus: btnStatus,
    feeInfo,
    chargeFeeTokenList,
    handleFeeChange,
  }

  return {
    resetProps: resetProps as ResetProps<T>,
  }
}

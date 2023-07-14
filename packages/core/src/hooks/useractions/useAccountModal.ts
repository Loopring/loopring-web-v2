import { store, useAccount } from '../../index'
import { AccountStep, useOpenModals } from '@loopring-web/component-lib'
import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'
import { sleep, WalletType } from '@loopring-web/loopring-sdk'
import { useAccountHook } from '../../services/account/useAccountHook'
import { SUBMIT_PANEL_DOUBLE_QUICK_AUTO_CLOSE } from '@loopring-web/common-resources'

export function useAccountModal() {
  const { shouldShow, setShouldShow, statusUnset: statusAccountUnset } = useAccount()
  const { setShowAccount } = useOpenModals()
  const handleErrorAccount = React.useCallback(() => {
    statusAccountUnset()
  }, [statusAccountUnset])
  const handleLockAccount = React.useCallback(() => {
    statusAccountUnset()
    setShowAccount({
      isShow: shouldShow ?? false,
      step: AccountStep.HadAccount,
    })
  }, [setShowAccount, shouldShow, statusAccountUnset])
  const handleNoAccount = React.useCallback(
    (_data: any) => {
      statusAccountUnset()
      setShowAccount({
        isShow: shouldShow ?? false,
        step: AccountStep.NoAccount,
      })
    },
    [setShowAccount, shouldShow, statusAccountUnset],
  )
  const handleDepositingAccount = React.useCallback(async () => {
    setShowAccount({
      isShow: shouldShow ?? false,
      step: AccountStep.Deposit_Submit,
    })
    await sleep(3000)
    setShouldShow(false)
    setShowAccount({ isShow: false })
    statusAccountUnset()
  }, [setShouldShow, setShowAccount, shouldShow, statusAccountUnset])
  const handleErrorApproveToken = React.useCallback(() => {
    setShowAccount({
      isShow: shouldShow ?? false,
      step: AccountStep.Deposit_WaitForAuth,
    })
  }, [setShowAccount, shouldShow])
  const handleErrorDepositSign = React.useCallback(() => {
    setShowAccount({
      isShow: shouldShow ?? false,
      step: AccountStep.Deposit_Failed,
    })
  }, [setShowAccount, shouldShow])
  const handleProcessDeposit = React.useCallback(() => {
    setShowAccount({
      isShow: shouldShow ?? false,
      step: AccountStep.Deposit_Approve_WaitForAuth,
    })
  }, [setShowAccount, shouldShow])
  const handleSignAccount = React.useCallback(() => {
    statusAccountUnset()
    setShowAccount({
      isShow: shouldShow ?? false,
      step: AccountStep.UpdateAccount,
    })
  }, [setShowAccount, shouldShow, statusAccountUnset])
  const handleSignDeniedByUser = React.useCallback(() => {
    setShowAccount({
      isShow: shouldShow ?? false,
      step: AccountStep.UnlockAccount_User_Denied,
    })
  }, [setShowAccount, shouldShow])
  const handleSignError = React.useCallback(
    ({ error, walletType }: { error?: sdk.RESULT_INFO; walletType?: WalletType }) => {
      setShowAccount({
        isShow: shouldShow ?? false,
        step: AccountStep.UnlockAccount_Failed,
        error,
        info: { walletType },
      })
    },
    [setShowAccount, shouldShow],
  )
  const handleProcessSign = React.useCallback(() => {
    setShowAccount({
      isShow: shouldShow ?? false,
      step: AccountStep.UnlockAccount_WaitForAuth,
    })
  }, [setShowAccount, shouldShow])
  const handleAccountActive = React.useCallback(async () => {
    setShouldShow(false)
    statusAccountUnset()
    await sdk.sleep(SUBMIT_PANEL_DOUBLE_QUICK_AUTO_CLOSE)
    if (store.getState().modals.isShowAccount.isShow) {
      setShowAccount({ isShow: false })
    }
  }, [setShouldShow, setShowAccount, statusAccountUnset])
  useAccountHook({
    handleErrorAccount,
    handleLockAccount, // clear private data
    handleNoAccount, //
    handleDepositingAccount,
    handleErrorApproveToken,
    handleErrorDepositSign,
    handleProcessDeposit, // two or one step
    handleSignAccount, //unlock or update account  sgin
    handleProcessSign,
    handleSignError,
    handleSignDeniedByUser,
    // handleProcessAccountCheck,
    handleAccountActive,
  })
}

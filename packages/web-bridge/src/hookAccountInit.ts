import React from 'react'
import { AccountStatus, myLog, SagaStatus } from '@loopring-web/common-resources'
import { useAccount, useConnect, useWalletLayer1 } from '@loopring-web/core'
import * as sdk from '@loopring-web/loopring-sdk'

export function useAccountInit({ state }: { state: keyof typeof SagaStatus }) {
  useConnect({ state })
  const {
    updateWalletLayer1,
    status: walletLayer1Status,
    statusUnset: wallet1statusUnset,
  } = useWalletLayer1()
  const { account, status: accountStatus, updateAccount } = useAccount()

  const callBack = React.useCallback(async () => {
    switch (account.readyState) {
      case AccountStatus.DEPOSITING:
      case AccountStatus.NOT_ACTIVE:
      case AccountStatus.LOCKED:
      case AccountStatus.NO_ACCOUNT:
      case AccountStatus.ACTIVATED:
        if (walletLayer1Status !== SagaStatus.PENDING) {
          updateWalletLayer1()
          myLog('updateWalletLayer1')
        } else {
          wallet1statusUnset()
          sdk.sleep(10)
          updateWalletLayer1()
        }
        break
      case AccountStatus.UN_CONNECT:
      case AccountStatus.ERROR_NETWORK:
        break
    }
  }, [account.readyState, accountStatus, updateAccount, updateWalletLayer1, walletLayer1Status])
  React.useEffect(() => {
    if (accountStatus === SagaStatus.UNSET && state === SagaStatus.DONE) {
      callBack()
    }
  }, [accountStatus, state])
  React.useEffect(() => {
    switch (walletLayer1Status) {
      case SagaStatus.ERROR:
        wallet1statusUnset()
        break
      case SagaStatus.DONE:
        wallet1statusUnset()
        break
      default:
        break
    }
  }, [walletLayer1Status])
}

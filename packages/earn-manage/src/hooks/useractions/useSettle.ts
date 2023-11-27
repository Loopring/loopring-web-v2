import { store, useAccount, useSubmitBtn, useWalletLayer1 } from '@loopring-web/core'

import { useOpenModals } from '@loopring-web/component-lib'
import React from 'react'

import { SagaStatus, TradeBtnStatus, AccountStatus } from '@loopring-web/common-resources'
import { AccountStepExtends } from '../../modal/AccountL1Modal/interface'

type SettleProps<T> = any
export const useSettle = <T extends any>({ setShowSettle, isShowSettle }: any): SettleProps<T> => {
  const { account } = useAccount()
  const [isLoading, setIsLoading] = React.useState(false)
  const { setShowAccount } = useOpenModals()
  const {
    updateWalletLayer1,
    status: walletLayer1Status,
    statusUnset: wallet1statusUnset,
  } = useWalletLayer1()
  //TODO SelletInfo
  const [info, setInfo] = React.useState<{}>({})
  React.useEffect(() => {
    const { account } = store.getState()
    if (
      account.status === SagaStatus.UNSET
      // &&
      // vaultAccountInfo?.accountStatus == sdk.VaultAccountStatus.IN_STAKING
    ) {
      //TODO
      setInfo({})
    }
  }, [account.readyState])
  const availableTradeCheck = React.useCallback(() => {
    if (account.readyState == AccountStatus.UN_CONNECT) {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: 'Please Connect wallet' }
    } else {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: 'Settle' }
    }
  }, [])

  const submitCallback = async () => {
    try {
      //TODO settle Contract
      setShowAccount({
        isShow: true,
        step: AccountStepExtends.settle_Processing,
        info: {
          ...info,
        },
      })
      setIsLoading(false)
      updateWalletLayer1()
      if (
        store.getState().modals.isShowAccount.isShow &&
        store.getState().modals.isShowAccount.step == AccountStepExtends.settle_Processing
      ) {
        setShowAccount({ isShow: false })
      }
    } catch (e) {
      setIsLoading(false)
      setShowAccount({
        isShow: true,
        step: AccountStepExtends.settle_failed,
        error: {
          ...(e as any),
        },
      })
    }
  }

  const {
    btnStatus,
    onBtnClick,
    btnLabel,
    // btnStyle: tradeLimitBtnStyle,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading,
    submitCallback,
  })
  return {
    btnStatus,
    onClose: () => {
      setShowSettle({ isShow: false })
    },
    btnLabel,
    onSubmitClick: () => onBtnClick(),
  }
}

import { AccountStep, useOpenModals } from '@loopring-web/component-lib'
import { TradeBtnStatus } from '@loopring-web/common-resources'
import React from 'react'
import {
  LoopringAPI,
  store,
  useSubmitBtn,
  useVaultLayer2,
  walletLayer2Service,
} from '@loopring-web/core'
import * as sdk from '@loopring-web/loopring-sdk'

export const useVaultRedeem = () => {
  const { status: vaultAccountInfoStatus, vaultAccountInfo, updateVaultLayer2 } = useVaultLayer2()
  const [isLoading, setIsLoading] = React.useState(false)
  const { setShowVaultExit, setShowAccount } = useOpenModals()
  const availableTradeCheck = React.useCallback(() => {
    if (
      vaultAccountInfo?.accountStatus == sdk.VaultAccountStatus.IN_STAKING &&
      vaultAccountInfo?.collateralInfo?.orderHash
    ) {
      return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: 'labelVaultConfirm' }
    } else {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: 'labelVaultConfirm' }
    }
  }, [vaultAccountInfoStatus, vaultAccountInfo?.collateralInfo?.orderHash])
  const processRequest = async (request: sdk.VaultExitRequest) => {
    try {
      const { apiKey, eddsaKey } = store.getState().account

      if (request) {
        let response = await LoopringAPI.vaultAPI?.submitVaultExit({
          // @ts-ignore
          request: request,
          privateKey: eddsaKey.sk,
          apiKey,
        })
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw response
        }
        walletLayer2Service.sendUserUpdate()
        updateVaultLayer2({})
        setShowAccount({
          isShow: true,
          step: AccountStep.VaultRedeem_Success,
          info: {},
        })
      } else {
        throw 'no data'
      }
    } catch (e) {
      setShowAccount({
        isShow: true,
        step: AccountStep.VaultRedeem_Failed,
      })
    }
    setIsLoading(false)
  }

  const submitCallback = async () => {
    try {
      const { accountId } = store.getState().account
      if (
        vaultAccountInfo?.accountStatus == sdk.VaultAccountStatus.IN_STAKING &&
        vaultAccountInfo?.collateralInfo?.orderHash
      ) {
        setIsLoading(true)
        setShowAccount({
          isShow: true,
          step: AccountStep.VaultRedeem_In_Progress,
        })
        processRequest({
          accountId,
          joinHash: vaultAccountInfo?.collateralInfo?.orderHash,
          timestamp: Date.now(),
        })
      } else {
      }
    } catch (e) {
      setShowAccount({
        isShow: true,
        step: AccountStep.VaultRedeem_Failed,
        error: {
          ...(e as any),
        },
      })
      //TODO: catch
    }
  }

  const {
    btnStatus,
    onBtnClick,
    btnLabel,
    // btnStyle: tradeLimitBtnStyle,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading: isLoading,
    submitCallback,
  })
  return {
    btnStatus,
    onClose: () => {
      setShowVaultExit({ isShow: false })
    },
    confirmLabel: btnLabel,
    onSubmitClick: () => onBtnClick(),
  }
}

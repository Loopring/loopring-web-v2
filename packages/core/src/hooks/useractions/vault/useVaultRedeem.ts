import { AccountStep, useOpenModals, useSettings } from '@loopring-web/component-lib'
import {
  CustomErrorWithCode,
  EmptyValueTag,
  getValuePrecisionThousand,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
  SUBMIT_PANEL_AUTO_CLOSE,
  SUBMIT_PANEL_CHECK,
  TradeBtnStatus,
  UIERROR_CODE,
} from '@loopring-web/common-resources'
import React from 'react'
import {
  LoopringAPI,
  store,
  useSubmitBtn,
  useSystem,
  useVaultLayer2,
  walletLayer2Service,
} from '@loopring-web/core'
import * as sdk from '@loopring-web/loopring-sdk'
import { useTranslation } from 'react-i18next'

export const useVaultRedeem = () => {
  const { t } = useTranslation('common')
  const { status: vaultAccountInfoStatus, vaultAccountInfo, updateVaultLayer2 } = useVaultLayer2()
  const [isLoading, setIsLoading] = React.useState(false)
  const { setShowVaultExit, setShowAccount } = useOpenModals()
  const { forexMap } = useSystem()
  const { currency } = useSettings()
  const [info, setInfo] = React.useState<
    | {
        usdValue: any
        usdDebt: any
        usdEquity: any
        forexMap: any
      }
    | undefined
  >(undefined)
  React.useEffect(() => {
    const {
      vaultLayer2: { vaultAccountInfo },
    } = store.getState()
    if (
      vaultAccountInfoStatus === SagaStatus.UNSET &&
      vaultAccountInfo?.accountStatus == sdk.VaultAccountStatus.IN_STAKING
    ) {
      setInfo(() => {
        return {
          usdValue: vaultAccountInfo?.totalBalanceOfUsdt
            ? getValuePrecisionThousand(
                sdk.toBig(vaultAccountInfo?.totalBalanceOfUsdt ?? 0).times(forexMap[currency] ?? 0),
                2,
                2,
                2,
                true,
                { floor: true },
              )
            : EmptyValueTag,
          usdDebt: vaultAccountInfo?.totalDebtOfUsdt
            ? getValuePrecisionThousand(
                sdk.toBig(vaultAccountInfo?.totalDebtOfUsdt ?? 0).times(forexMap[currency] ?? 0),
                2,
                2,
                2,
                true,
                { floor: true },
              )
            : EmptyValueTag,
          usdEquity: vaultAccountInfo?.totalEquityOfUsdt
            ? getValuePrecisionThousand(
                sdk.toBig(vaultAccountInfo?.totalEquityOfUsdt ?? 0).times(forexMap[currency] ?? 0),
                2,
                2,
                2,
                true,
                { floor: true },
              )
            : EmptyValueTag,
          forexMap,
        }
      })
    }
  }, [vaultAccountInfoStatus])
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
      const {
        account: { apiKey, eddsaKey, accountId },
      } = store.getState()
      if (request && LoopringAPI.vaultAPI) {
        let response = await LoopringAPI.vaultAPI.submitVaultExit({
          // @ts-ignore
          request: request,
          privateKey: eddsaKey.sk,
          apiKey,
        })
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw response
        }
        // submit success
        setShowVaultExit({ isShow: false })
        updateVaultLayer2({})
        await sdk.sleep(SUBMIT_PANEL_CHECK)
        const response2 = await LoopringAPI.vaultAPI.getVaultGetOperationByHash(
          {
            accountId: accountId?.toString(),
            hash: (response as any).hash,
          },
          apiKey,
        )
        let status = ''
        if (
          response2?.raw_data?.operation?.status == sdk.VaultOperationStatus.VAULT_STATUS_FAILED
        ) {
          throw sdk.VaultOperationStatus.VAULT_STATUS_FAILED
        } else if (
          response2?.raw_data?.operation?.status !== sdk.VaultOperationStatus.VAULT_STATUS_PENDING
        ) {
          status = 'labelPending'
        } else {
          status = 'labelSuccess'
        }
        setShowAccount({
          isShow: true,
          step: [
            sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED,
            // sdk.VaultOperationStatus.VAULT_STATUS_PENDING,
          ].includes(response2?.raw_data?.operation?.status)
            ? AccountStep.VaultRedeem_Success
            : AccountStep.VaultRedeem_In_Progress,
          info: {
            ...info,
            status: t(status),
          },
        })
        setIsLoading(false)
        await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
        walletLayer2Service.sendUserUpdate()
        updateVaultLayer2({})
        if (
          store.getState().modals.isShowAccount.isShow &&
          [AccountStep.VaultRedeem_Success, AccountStep.VaultRedeem_In_Progress].includes(
            store.getState().modals.isShowAccount.step,
          )
        ) {
          setShowAccount({ isShow: false })
        }
      } else {
        throw new Error('api not ready')
      }
    } catch (e) {
      const code =
        (e as any)?.message === sdk.VaultOperationStatus.VAULT_STATUS_FAILED
          ? UIERROR_CODE.ERROR_ORDER_FAILED
          : (e as sdk.RESULT_INFO)?.code ?? UIERROR_CODE.UNKNOWN
      const error = new CustomErrorWithCode({
        code,
        message: (e as sdk.RESULT_INFO)?.message,
        ...SDK_ERROR_MAP_TO_UI[code],
      })
      setShowAccount({
        isShow: true,
        step: AccountStep.VaultRedeem_Failed,
        info: {
          ...info,
          status: t('labelFailed'),
        },
        error,
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
        throw 'accountStatus is not in staking'
      }
    } catch (e) {
      if (e as any) {
        setIsLoading(false)
        setShowAccount({
          isShow: true,
          step: AccountStep.VaultRedeem_Failed,
          info: {
            status: t('labelFailed'),
            usdValue: vaultAccountInfo?.totalBalanceOfUsdt
              ? getValuePrecisionThousand(
                  sdk
                    .toBig(vaultAccountInfo?.totalBalanceOfUsdt ?? 0)
                    .times(forexMap[currency] ?? 0),
                  2,
                  2,
                  2,
                  true,
                  { floor: true },
                )
              : EmptyValueTag,
            usdDebt: vaultAccountInfo?.totalDebtOfUsdt
              ? getValuePrecisionThousand(
                  sdk.toBig(vaultAccountInfo?.totalDebtOfUsdt ?? 0).times(forexMap[currency] ?? 0),
                  2,
                  2,
                  2,
                  true,
                  { floor: true },
                )
              : EmptyValueTag,
            usdEquity: vaultAccountInfo?.totalEquityOfUsdt
              ? getValuePrecisionThousand(
                  sdk
                    .toBig(vaultAccountInfo?.totalEquityOfUsdt ?? 0)
                    .times(forexMap[currency] ?? 0),
                  2,
                  2,
                  2,
                  true,
                  { floor: true },
                )
              : EmptyValueTag,
            forexMap,
          },
          error: {
            ...(e as any),
          },
        })
      }
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
      setShowVaultExit({ isShow: false })
    },
    confirmLabel: btnLabel,
    onSubmitClick: () => onBtnClick(),
  }
}

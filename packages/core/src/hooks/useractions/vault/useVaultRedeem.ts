import { AccountStep, useOpenModals, useSettings } from '@loopring-web/component-lib'
import {
  CurrencyToTag,
  CustomErrorWithCode,
  EmptyValueTag,
  getValuePrecisionThousand,
  PriceTag,
  SDK_ERROR_MAP_TO_UI,
  SUBMIT_PANEL_AUTO_CLOSE,
  SUBMIT_PANEL_CHECK,
  TradeBtnStatus,
  UIERROR_CODE,
} from '@loopring-web/common-resources'
import React from 'react'
import {
  l2CommonService,
  LoopringAPI,
  store,
  useL2CommonSocket,
  useSubmitBtn,
  useSystem,
  useVaultLayer2,
} from '@loopring-web/core'
import * as sdk from '@loopring-web/loopring-sdk'
import { useTranslation } from 'react-i18next'

export const useVaultRedeem = () => {
  const { t } = useTranslation('common')
  const { status: vaultAccountInfoStatus, vaultAccountInfo } = useVaultLayer2()
  const [isLoading, setIsLoading] = React.useState(false)
  const { setShowVaultExit, setShowAccount, setShowNoVaultAccount } = useOpenModals()
  const { forexMap } = useSystem()
  const { currency } = useSettings()
  const [info, setInfo] = React.useState<
    | {
        profit: any
        usdValue: any
        usdDebt: any
        usdEquity: any
        forexMap: any
        profitPercent: any
      }
    | undefined
  >(undefined)

  const vaultLayer2Callback = React.useCallback(() => {
    const {
      vaultLayer2: { vaultAccountInfo },
    } = store.getState()
    if (vaultAccountInfo?.accountStatus == sdk.VaultAccountStatus.IN_STAKING) {
      setInfo(() => {
        const profit =
          (vaultAccountInfo as any)?.accountType === 0
            ? vaultAccountInfo?.totalCollateralOfUsdt && vaultAccountInfo?.totalCollateralOfUsdt
              ? sdk
                  .toBig(vaultAccountInfo?.totalEquityOfUsdt ?? 0)
                  .minus(vaultAccountInfo?.totalCollateralOfUsdt ?? 0)
              : undefined
            : vaultAccountInfo?.totalCollateralOfUsdt && vaultAccountInfo?.totalCollateralOfUsdt
            ? sdk
                .toBig(vaultAccountInfo?.totalBalanceOfUsdt ?? 0)
                .minus(vaultAccountInfo?.totalDebtOfUsdt ?? 0)
            : undefined
        return {
          profit: profit
            ? PriceTag[CurrencyToTag[currency]] +
              getValuePrecisionThousand(
                sdk.toBig(profit).times(forexMap[currency] ?? 0),
                2,
                2,
                2,
                true,
                { floor: true },
              )
            : EmptyValueTag,
          profitPercent:
            profit && Number(vaultAccountInfo?.totalCollateralOfUsdt ?? 0)
              ? getValuePrecisionThousand(
                  profit.div(vaultAccountInfo?.totalCollateralOfUsdt).times(100) ?? 0,
                  2,
                  2,
                  undefined,
                  false,
                  {
                    isFait: false,
                    floor: true,
                  },
                ) + '%'
              : EmptyValueTag,
          usdValue: vaultAccountInfo?.totalBalanceOfUsdt
            ? PriceTag[CurrencyToTag[currency]] +
              getValuePrecisionThousand(
                sdk.toBig(vaultAccountInfo?.totalBalanceOfUsdt ?? 0).times(forexMap[currency] ?? 0),
                2,
                2,
                2,
                true,
                { floor: true },
              )
            : EmptyValueTag,
          usdDebt: vaultAccountInfo?.totalDebtOfUsdt
            ? PriceTag[CurrencyToTag[currency]] +
              getValuePrecisionThousand(
                sdk.toBig(vaultAccountInfo?.totalDebtOfUsdt ?? 0).times(forexMap[currency] ?? 0),
                2,
                2,
                2,
                true,
                { floor: true },
              )
            : EmptyValueTag,
          usdEquity: vaultAccountInfo?.totalEquityOfUsdt
            ? PriceTag[CurrencyToTag[currency]] +
              getValuePrecisionThousand(
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
  }, [currency])
  React.useEffect(() => {
    vaultLayer2Callback()
  }, [currency])
  useL2CommonSocket({ vaultLayer2Callback })

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
        }, '1')
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw response
        }
        // submit success
        setShowVaultExit({ isShow: false })
        await sdk.sleep(SUBMIT_PANEL_CHECK)
        const response2 = await LoopringAPI.vaultAPI.getVaultGetOperationByHash(
          {
            accountId: accountId?.toString(),
            hash: (response as any).hash,
          },
          apiKey,
          '1'
        )
        let status = ''
        if (
          response2?.raw_data?.operation?.status == sdk.VaultOperationStatus.VAULT_STATUS_FAILED
        ) {
          throw sdk.VaultOperationStatus.VAULT_STATUS_FAILED
        } else if (
          [sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED].includes(
            response2?.raw_data?.operation?.status,
          )
        ) {
          status = 'labelSuccessfully'
        } else {
          status = 'labelPending'
        }
        setShowAccount({
          isShow: store.getState().modals.isShowAccount.isShow,
          step:
            status == 'labelSuccessfully'
              ? AccountStep.VaultRedeem_Success
              : AccountStep.VaultRedeem_In_Progress,
          info: {
            ...info,
            status: t(status),
          },
        })
        setIsLoading(false)
        await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
        l2CommonService.sendUserUpdate()
        if (
          store.getState().modals.isShowAccount.isShow &&
          [AccountStep.VaultRedeem_Success, AccountStep.VaultRedeem_In_Progress].includes(
            store.getState().modals.isShowAccount.step,
          )
        ) {
          setShowAccount({ isShow: false })
        }
        var timer = setInterval(() => {
          LoopringAPI.vaultAPI?.getVaultGetOperationByHash(
            {
              accountId: accountId?.toString(),
              hash: (response as any).hash,
            },
            apiKey,
            '1'
          ).then(x => {
            if (x.operation.status === sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED) {
              setShowNoVaultAccount({ isShow: false })
              clearInterval(timer)
            }
          })
        }, 2000)
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
            ...info,
            status: t('labelFailed'),
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

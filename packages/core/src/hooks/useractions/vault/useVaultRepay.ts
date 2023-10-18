import {
  AccountStatus,
  getValuePrecisionThousand,
  IBData,
  SagaStatus,
  TradeBtnStatus,
  VaultBorrowData,
} from '@loopring-web/common-resources'
import { AccountStep, useOpenModals, VaultRepayWrapProps } from '@loopring-web/component-lib'
import {
  store,
  useAccount,
  useSystem,
  useTradeVault,
  useVaultLayer2,
  useVaultMap,
} from '../../../stores'
import { useTranslation } from 'react-i18next'
import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'
import { makeVaultLayer2 } from '../../help'
import { LoopringAPI } from '../../../api_wrapper'
import { walletLayer2Service } from '../../../services'
import { useSubmitBtn } from '../../common'

export const useVaultRepay = <T extends IBData<I>, V extends VaultBorrowData<I>, I>(): Partial<
  VaultRepayWrapProps<T, V, I>
> => {
  // const { setShowAccount } = useOpenModals()
  const {
    modals: { istShowVaultLoad },
    setShowAccount,
    setShowVaultLoad,
  } = useOpenModals()
  const { vaultAccountInfo, status: vaultAccountInfoStatus, updateVaultLayer2 } = useVaultLayer2()
  const { account } = useAccount()
  const { tokenMap: vaultTokenMap, idIndex: vaultIdIndex, coinMap: vaultCoinMap } = useVaultMap()
  const { t } = useTranslation()
  const { vaultRepayData, updateVaultRepay, resetVaultRepay } = useTradeVault()
  const { exchangeInfo, forexMap } = useSystem()
  const [isLoading, setIsLoading] = React.useState(false)

  const [tradeData, setTradeData] = React.useState<T | undefined>(undefined)

  const calcSupportData = (tradeData: T) => {
    let supportData = {}
    // const vaultJoinData = store.getState()._router_tradeVault.vaultJoinData
    if (tradeData.belong) {
      const vaultToken = vaultTokenMap[tradeData.belong as any]
      // const vaultTokenSymbol = walletAllowMap[tradeData.belong as any].vaultToken
      // const vaultTokenInfo = vaultTokenMap[vaultTokenSymbol]
      // const ercToken = tokenMap[tradeData.belong]
      // tradeData.belong
      supportData = {
        //TODO:
        maxShowVal: getValuePrecisionThousand(
          sdk.toBig(vaultToken.btradeAmount).div('1e' + vaultToken.decimals),
          vaultToken.precision,
          vaultToken.precision,
          undefined,
        ),

        minShowVal: getValuePrecisionThousand(
          //TODO:
          sdk.toBig(vaultToken.vaultTokenAmounts.minAmount).div('1e' + vaultToken.decimals),
          vaultToken.precision,
          vaultToken.precision,
          undefined,
        ),
        maxAmount: vaultToken.btradeAmount,
        minAmount: vaultToken.vaultTokenAmounts.minAmount,
        vaultSymbol: vaultToken.symbol,
        vaultTokenInfo: vaultToken,
      }
    }
    return {
      ...supportData,
    }
  }
  // useVaultSocket()
  const initData = () => {
    let vaultRepayData: any = {}
    let initSymbol = vaultIdIndex[vaultAccountInfo?.collateralInfo?.collateralTokenId ?? ''] ?? ''
    const walletMap = makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map ?? {}

    let walletInfo
    walletInfo = {
      belong: initSymbol,
      balance: walletMap[initSymbol.toString()]?.count ?? 0,
      tradeValue: undefined,
    }
    vaultRepayData = {
      ...vaultRepayData,
      walletMap,
      coinMap: vaultCoinMap,
    }

    setTradeData({
      ...walletInfo,
    })

    updateVaultRepay({
      ...walletInfo,
      ...vaultRepayData,
      ...calcSupportData(walletInfo),
    })
  }
  React.useEffect(() => {
    if (istShowVaultLoad.isShow) {
      initData()
    } else {
      resetVaultRepay()
    }
  }, [istShowVaultLoad.isShow])
  const availableTradeCheck = React.useCallback(() => {
    const vaultRepayData = store.getState()._router_tradeVault.vaultRepayData
    if (!vaultRepayData?.amount && sdk.toBig(vaultRepayData?.amount ?? 0).lte(0)) {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: '' }
    } else if (sdk.toBig(vaultRepayData.amount).lte(vaultRepayData.minAmount)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultRepayMini|${vaultRepayData.minShowVal} ${vaultRepayData.belong}`,
      }
    } else if (sdk.toBig(vaultRepayData.tradeValue ?? 0).gte(vaultRepayData.balance ?? 0)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultRepayNotEnough ${vaultRepayData.belong}`,
      }
    } else if (sdk.toBig(vaultRepayData.amount ?? 0).gte(vaultRepayData.maxAmount ?? 0)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultRepayMax|${vaultRepayData.maxShowVal} ${vaultRepayData.belong}`,
      }
    } else if (sdk.toBig(vaultRepayData.amount ?? 0).gte(vaultRepayData.maxAmount ?? 0)) {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: 'labelVaultRepayMax' }
    } else {
      return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
    }
  }, [
    vaultAccountInfoStatus,
    vaultTokenMap,
    vaultRepayData,
    vaultRepayData.tradeValue,
    vaultRepayData.balance,
    vaultRepayData.amount,
    vaultRepayData.maxAmount,
    vaultRepayData.minAmount,
    vaultRepayData.belong,
  ])
  const vaultLayer2Callback = React.useCallback(async () => {
    if (account.readyState === AccountStatus.ACTIVATED) {
      //TODO:
      const walletMap = makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map ?? {}
      let walletInfo
      setTradeData((state) => {
        walletInfo = {
          ...state,
          balance: walletMap[state?.belong ?? '']?.count ?? 0,
        }
        return walletInfo
        // ...walletInfo,
      })
      updateVaultRepay({
        ...walletInfo,
        ...calcSupportData(walletInfo),
      })
    } else {
    }
  }, [tradeData, account.readyState])

  React.useEffect(() => {
    if (vaultLayer2Callback && vaultAccountInfoStatus === SagaStatus.UNSET) {
      vaultLayer2Callback()
    }
  }, [vaultAccountInfoStatus])
  React.useEffect(() => {
    if (vaultLayer2Callback && vaultAccountInfoStatus === SagaStatus.UNSET) {
      vaultLayer2Callback()
    }
  }, [vaultAccountInfoStatus])
  const processRequest = async (request?: sdk.VaultRepayRequest) => {
    const account = store.getState().account
    const vaultRepayData = store.getState()._router_tradeVault.vaultRepayData
    try {
      if (request || vaultRepayData.request) {
        let response = LoopringAPI.vaultAPI?.submitVaultRepay({
          // @ts-ignore
          request: request ?? vaultRepayData.request,
          // @ts-ignore
          privateKey: account?.eddsaKey?.sk,
          apiKey: account.apiKey,
        })
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw response
        }
        walletLayer2Service.sendUserUpdate()
        setShowAccount({
          isShow: true,
          step: AccountStep.VaultRepay_In_Progress,
          info: {
            title: t('labelVaultRepayTitle'),
          },
        })
        sdk.sleep(1000).then(() => updateVaultLayer2({}))
        //TODO c
        setShowAccount({
          isShow: true,
          step: AccountStep.VaultRepay_Success,
          // TODO:
          info: {
            usdValue: 0,
            usdDebt: 0,
            usdEquity: 0,
            forexMap,
            title: t('labelVaultRepayTitle'),
          },
        })
        setShowVaultLoad({
          isShow: false,
        })
      } else {
        throw 'no data'
      }
    } catch (e) {
      setShowAccount({
        isShow: true,
        step: AccountStep.VaultRedeem_Failed,
        info: {
          title: t('labelVaultRepayTitle'),
        },
      })
    }
  }

  const submitCallback = async () => {
    const vaultRepayData = store.getState()._router_tradeVault.vaultRepayData

    try {
      if (
        vaultRepayData &&
        exchangeInfo &&
        vaultRepayData.belong &&
        LoopringAPI.vaultAPI &&
        LoopringAPI.userAPI &&
        vaultAccountInfo &&
        sdk.toBig(vaultRepayData.amount).gte(vaultRepayData.minAmount ?? 0) &&
        sdk.toBig(vaultRepayData.amount).lte(vaultRepayData.maxAmount ?? 0)
      ) {
        setIsLoading(true)
        const vaultRepayRequest: sdk.VaultRepayRequest = {
          accountId: account.accountId,
          token: {
            tokenId: vaultTokenMap[vaultRepayData.belong].vaultTokenId as unknown as number,
            volume: vaultRepayData.volume,
          },
          timestamp: Date.now(),
        }
        updateVaultRepay({
          ...vaultRepayData,
          __request__: vaultRepayRequest,
          request: vaultRepayRequest,
        })
        processRequest(vaultRepayRequest)
      }
    } catch (e) {
      setIsLoading(false)
      setShowAccount({
        isShow: true,
        step: AccountStep.VaultRepay_Failed,
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
    isLoading,
    submitCallback,
  })
  return {
    vaultRepayBtnStatus: btnStatus,
    vaultRepayBtnI18nKey: btnLabel,
    onVaultRepayClick: onBtnClick,
    tradeData,
    vaultRepayData,
  }
}

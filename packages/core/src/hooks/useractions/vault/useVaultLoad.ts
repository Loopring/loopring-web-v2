import {
  AccountStep,
  useOpenModals,
  VaultBorrowWrapProps,
  VaultLoadType,
  VaultRepayWrapProps,
} from '@loopring-web/component-lib'
import {
  store,
  useAccount,
  useSystem,
  useTradeVault,
  useVaultLayer2,
  useVaultMap,
} from '../../../stores'
import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  AccountStatus,
  getValuePrecisionThousand,
  IBData,
  SagaStatus,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import { LoopringAPI } from '../../../api_wrapper'
import { walletLayer2Service } from '../../../services'

import { useSubmitBtn } from '../../common'
import { useTranslation } from 'react-i18next'
import { makeVaultAvaiable2, makeVaultLayer2 } from '../../help'

export const useVaultBorrow = <T extends IBData<any>, I, B, C>(): Partial<
  VaultBorrowWrapProps<T, I, B, C>
> => {
  const { t } = useTranslation()
  const {
    modals: { istShowVaultLoad },
    setShowAccount,
    setShowVaultLoad,
  } = useOpenModals()
  const { exchangeInfo } = useSystem()
  const { tokenMap: vaultTokenMap, coinMap: vaultCoinMap } = useVaultMap()

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
  const { vaultAccountInfo, status: vaultAccountInfoStatus, updateVaultLayer2 } = useVaultLayer2()
  const { vaultBorrowData, updateVaultBorrow, resetVaultBorrow } = useTradeVault()
  const [tradeData, setTradeData] = React.useState<T | undefined>(undefined)
  const initData = () => {
    let vaultBorrowData: any = {}
    let initSymbol = 'LRC'
    if (istShowVaultLoad.info?.symbol) {
      initSymbol = istShowVaultLoad.info?.symbol
    }
    let { vaultAvaiable2Map } = makeVaultAvaiable2({ needFilterZero: false })
    vaultBorrowData = {
      ...vaultBorrowData,
      vaultAvaiable2Map,
      coinMap: vaultCoinMap,
    }
    let walletInfo
    walletInfo = {
      belong: initSymbol,
      balance: (vaultAvaiable2Map && vaultAvaiable2Map[initSymbol.toString()]?.count) ?? 0,
      tradeValue: undefined,
    }
    vaultBorrowData = {
      ...vaultBorrowData,
      walletInfo,
    }

    setTradeData({
      ...walletInfo,
    })

    updateVaultBorrow({
      ...walletInfo,
      ...vaultBorrowData,
      ...calcSupportData(walletInfo),
    })
  }
  React.useEffect(() => {
    if (istShowVaultLoad.isShow) {
      initData()
    } else {
      resetVaultBorrow()
    }
  }, [istShowVaultLoad.isShow])

  const availableTradeCheck = React.useCallback(() => {
    // const vaultAccountInfoSymbol =
    //     vaultIdIndex[vaultAccountInfo?.collateralInfo?.collateralTokenId ?? ''] ?? ''
    const vaultBorrowData = store.getState()._router_tradeVault.vaultBorrowData
    if (!vaultBorrowData?.amount && sdk.toBig(vaultBorrowData?.amount ?? 0).lte(0)) {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: '' }
    } else if (sdk.toBig(vaultBorrowData.amount).lte(vaultBorrowData.minAmount)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultBorrowMini|${vaultBorrowData.minShowVal} ${vaultBorrowData.belong}`,
      }
    } else if (sdk.toBig(vaultBorrowData.tradeValue ?? 0).gte(vaultBorrowData.balance ?? 0)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultBorrowNotEnough ${vaultBorrowData.belong}`,
      }
    } else if (sdk.toBig(vaultBorrowData.amount ?? 0).gte(vaultBorrowData.maxAmount ?? 0)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultBorrowMax|${vaultBorrowData.maxShowVal} ${vaultBorrowData.belong}`,
      }
    } else if (sdk.toBig(vaultBorrowData.amount ?? 0).gte(vaultBorrowData.maxAmount ?? 0)) {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: 'labelVaultBorrowMax' }
    } else {
      return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
    }
  }, [
    vaultAccountInfoStatus,
    vaultTokenMap,
    vaultBorrowData,
    vaultBorrowData.tradeValue,
    vaultBorrowData.balance,
    vaultBorrowData.amount,
    vaultBorrowData.maxAmount,
    vaultBorrowData.minAmount,
    vaultBorrowData.belong,
  ])
  const processRequest = async (request?: sdk.VaultLoadRequest) => {
    const vaultBorrowData = store.getState()._router_tradeVault.vaultBorrowData
    const account = store.getState().account
    try {
      if (request || (vaultBorrowData.request && account)) {
        let response = LoopringAPI.vaultAPI?.submitVaultLoad({
          // @ts-ignore
          request: request ?? vaultBorrowData.request,
          privateKey: account?.eddsaKey?.sk,
          apiKey: account.apiKey,
        })
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw response
        }
        walletLayer2Service.sendUserUpdate()
        sdk.sleep(1000).then(() => updateVaultLayer2())

        setShowAccount({
          isShow: true,
          step: AccountStep.VaultBorrow_Success,
          info: {
            title: t('labelVaultBorrowTitle'),
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
          title: t('labelVaultBorrowTitle'),
        },
      })
    }
  }

  const submitCallback = async () => {
    const vaultBorrowData = store.getState()._router_tradeVault.vaultBorrowData
    const account = store.getState().account
    try {
      if (
        vaultBorrowData &&
        exchangeInfo &&
        vaultBorrowData.belong &&
        LoopringAPI.vaultAPI &&
        LoopringAPI.userAPI &&
        vaultAccountInfo &&
        sdk.toBig(vaultBorrowData.amount).gte(vaultBorrowData.minAmount ?? 0) &&
        sdk.toBig(vaultBorrowData.amount).lte(vaultBorrowData.maxAmount ?? 0)
      ) {
        setShowAccount({
          isShow: true,
          step: AccountStep.VaultBorrow_In_Progress,
          info: {
            title: t('labelVaultBorrowTitle'),
          },
        })

        const vaultBorrowRequest: sdk.VaultLoadRequest = {
          accountId: account.accountId,
          token: {
            tokenId: vaultTokenMap[vaultBorrowData.belong].vaultTokenId as unknown as number,
            volume: vaultBorrowData.volume,
          },
          timestamp: Date.now(),
        }

        updateVaultBorrow({
          ...vaultBorrowData,
          __request__: vaultBorrowRequest,
          request: vaultBorrowRequest,
        })
        processRequest(vaultBorrowRequest)
      }
    } catch (e) {
      setShowAccount({
        isShow: true,
        step: AccountStep.VaultBorrow_Failed,
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
    isLoading: false,
    submitCallback,
  })

  return {
    vaultBorrowBtnStatus: btnStatus,
    vaultBorrowBtnI18nKey: btnLabel,
    onVaultBorrowClick: onBtnClick,
    tradeData,
    vaultBorrowData,
  }
}

export const useVaultRepay = <T extends IBData<any>, I, B, C>(): Partial<
  VaultRepayWrapProps<T, I, B, C>
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
  const { exchangeInfo } = useSystem()
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
        sdk.sleep(1000).then(() => updateVaultLayer2())

        setShowAccount({
          isShow: true,
          step: AccountStep.VaultRepay_Success,
          info: {
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
        setShowAccount({
          isShow: true,
          step: AccountStep.VaultRepay_In_Progress,
          info: {
            title: t('labelVaultRepayTitle'),
          },
        })

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
    isLoading: false,
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

export const useVaultLoad = () => {
  const {
    modals: {
      istShowVaultLoad: { type, isShow },
    },
  } = useOpenModals()
  const [vaultLoadType, setVaultLoadType] = React.useState(type ?? VaultLoadType.Borrow)
  const handleTabChange = (index: VaultLoadType) => {
    setVaultLoadType(index)
  }
  React.useEffect(() => {
    if (isShow) {
      setVaultLoadType(() => {
        return store.getState().modals?.istShowVaultLoad?.type ?? VaultLoadType.Borrow
      })
      // const withdrawValue =
    }
  }, [isShow])
  return {
    vaultRepayProps: useVaultRepay(),
    vaultBorrowProps: useVaultBorrow(),
    vaultLoadType,
    handleTabChange,
  }
}

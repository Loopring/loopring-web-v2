import {
  CustomErrorWithCode,
  EmptyValueTag,
  getValuePrecisionThousand,
  IBData,
  SDK_ERROR_MAP_TO_UI,
  SUBMIT_PANEL_AUTO_CLOSE,
  SUBMIT_PANEL_CHECK,
  TradeBtnStatus,
  UIERROR_CODE,
  VaultBorrowData,
} from '@loopring-web/common-resources'
import {
  AccountStep,
  SwitchData,
  useOpenModals,
  VaultBorrowProps,
} from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import {
  store,
  useSystem,
  useTokenMap,
  useTradeVault,
  useVaultLayer2,
  useVaultMap,
} from '../../../stores'
import React from 'react'
import { makeVaultAvaiable2 } from '../../help'
import * as sdk from '@loopring-web/loopring-sdk'
import { LoopringAPI } from '../../../api_wrapper'
import { useSubmitBtn } from '../../common'
import BigNumber from 'bignumber.js'

export const useVaultBorrow = <
  T extends IBData<I> & { erc20Symbol: string; borrowed: string },
  V extends VaultBorrowData<T>,
  I,
>(): Partial<VaultBorrowProps<T, I, V>> => {
  const { t } = useTranslation()
  const {
    modals: { isShowVaultLoan },
    setShowAccount,
    setShowVaultLoan,
  } = useOpenModals()
  const [isLoading, setIsLoading] = React.useState(false)

  const { exchangeInfo, forexMap } = useSystem()
  const { idIndex } = useTokenMap()
  const { tokenMap: vaultTokenMap, coinMap: vaultCoinMap, marketCoins } = useVaultMap()
  const [walletMap, setWalletMap] = React.useState(() => {
    const { vaultAvaiable2Map } = makeVaultAvaiable2({})
    return vaultAvaiable2Map
  })
  const calcSupportData = (tradeData: Omit<T, 'balance'> & { count: string }) => {
    let supportData: any = {
      maxBorrowAmount: undefined,
      maxBorrowStr: undefined,
      minBorrowAmount: undefined,
      minBorrowStr: undefined,
      maxBorrowVol: undefined,
      minBorrowVol: undefined,
      maxQuote: undefined,
      borrowVol: undefined,
      borrowAmt: undefined,
      totalQuote: undefined,
    }
    if (tradeData?.belong) {
      const borrowToken = vaultTokenMap[tradeData.belong]
      const orderAmounts = borrowToken.orderAmounts
      const minBorrowVol = BigNumber.max(orderAmounts.dust, orderAmounts?.minimum)
      const minBorrowAmt = minBorrowVol.div('1e' + borrowToken.decimals)
      const totalQuote = sdk.toBig(orderAmounts.maximum ?? 0).div('1e' + borrowToken.decimals)
      const maxBorrowAmt = sdk
        .toBig(BigNumber.min(totalQuote, tradeData.count))
        .toFixed(borrowToken?.vaultTokenAmount?.qtyStepScale, BigNumber.ROUND_DOWN)
      const maxBorrowVol = sdk.toBig(maxBorrowAmt).times('1e' + borrowToken.decimals)
      const tradeValue = tradeData.tradeValue
      // const = tradeData ? tradeData.count : 0
      supportData = {
        maxBorrowAmount: maxBorrowAmt?.toString(),
        maxBorrowStr: getValuePrecisionThousand(
          maxBorrowAmt ?? 0,
          borrowToken.precision,
          borrowToken.precision,
          undefined,
        ),
        minBorrowAmount: minBorrowAmt?.toString(),
        minBorrowStr: getValuePrecisionThousand(
          minBorrowAmt ?? 0,
          borrowToken.precision,
          borrowToken.precision,
          undefined,
        ),
        maxBorrowVol: maxBorrowVol.toString(),
        minBorrowVol: minBorrowVol.toString(),
        maxQuote: orderAmounts.maximum,
        borrowVol: sdk
          .toBig(tradeValue ?? 0)
          .times('1e' + borrowToken.decimals)
          .toString(),
        borrowAmtStr: getValuePrecisionThousand(
          tradeValue ?? 0,
          borrowToken.precision,
          borrowToken.precision,
          undefined,
        ),
        borrowedStr: getValuePrecisionThousand(
          tradeData.borrowed ?? 0,
          borrowToken.precision,
          borrowToken.precision,
          undefined,
        ),
        balance: maxBorrowAmt,
        borrowAmt: tradeValue ?? 0,
        totalQuote: totalQuote.toString(),
        coinInfoMap: vaultCoinMap,
      }
    }
    return {
      ...supportData,
    }
  }
  const { vaultAccountInfo, status: vaultAccountInfoStatus, updateVaultLayer2 } = useVaultLayer2()
  const { vaultBorrowData, updateVaultBorrow, resetVaultBorrow } = useTradeVault()
  // const [tradeData, setTradeData] = React.useState<T | undefined>(undefined)
  const initData = () => {
    let vaultBorrowData: any = {}
    let initSymbol = marketCoins[0]
    if (isShowVaultLoan.info?.symbol) {
      initSymbol = isShowVaultLoan.info?.symbol
    }
    let { vaultAvaiable2Map } = makeVaultAvaiable2({})
    setWalletMap(vaultAvaiable2Map)
    vaultBorrowData = {
      ...vaultBorrowData,
      vaultAvaiable2Map,
      coinMap: vaultCoinMap,
      walletMap: vaultAvaiable2Map,
    }
    let walletInfo
    walletInfo = {
      belong: initSymbol,
      ...((vaultAvaiable2Map && vaultAvaiable2Map[initSymbol.toString()]) ?? {}),
      // balance: (vaultAvaiable2Map && vaultAvaiable2Map[initSymbol.toString()]?.count) ?? 0,
      tradeValue: undefined,
      erc20Symbol: idIndex[vaultTokenMap[initSymbol].tokenId],
    }
    const supportdata = calcSupportData(walletInfo)
    walletInfo = {
      ...walletInfo,
      balance: supportdata.balance,
      borrowedAmt: walletInfo.borrowed,
    }
    vaultBorrowData = {
      ...vaultBorrowData,
      ...walletInfo,
      ...supportdata,
      walletMap: vaultAvaiable2Map,
      tradeData: walletInfo,
    }

    updateVaultBorrow({
      ...walletInfo,
      ...vaultBorrowData,
      ...calcSupportData(walletInfo),
    })
  }
  React.useEffect(() => {
    if (isShowVaultLoan.isShow) {
      initData()
    } else {
      resetVaultBorrow()
    }
  }, [isShowVaultLoan.isShow])

  const handlePanelEvent = React.useCallback(async (data: SwitchData<T>) => {
    let vaultBorrowData = store.getState()._router_tradeVault.vaultBorrowData
    return new Promise<void>((res: any) => {
      if (data.to === 'button') {
        let { vaultAvaiable2Map } = makeVaultAvaiable2({})
        setWalletMap(vaultAvaiable2Map)
        if (vaultAvaiable2Map && data?.tradeData?.belong) {
          let walletInfo: any = vaultAvaiable2Map[data?.tradeData?.belong as string]
          walletInfo = {
            ...walletInfo,
            tradeValue: data.tradeData?.tradeValue
              ? sdk
                  .toBig(data.tradeData?.tradeValue)
                  .toFixed(
                    vaultTokenMap[data?.tradeData?.belong]?.vaultTokenAmounts?.qtyStepScale,
                    BigNumber.ROUND_DOWN,
                  )
              : data.tradeData?.tradeValue,
            borrowedAmt: walletInfo.borrowed,
          }
          const supportdata = calcSupportData(walletInfo)
          walletInfo = {
            ...walletInfo,
            balance: supportdata.balance,
          }
          vaultBorrowData = {
            ...vaultBorrowData,
            ...walletInfo,
            ...supportdata,
            walletMap: vaultAvaiable2Map,
            tradeData: walletInfo,
          }

          updateVaultBorrow({
            ...vaultBorrowData,
          })
        } else {
          updateVaultBorrow({
            belong: undefined,
            tradeValue: undefined,
            balance: undefined,
          })
        }
      }
      res()
    })
  }, [])

  const availableTradeCheck = React.useCallback(() => {
    const vaultBorrowData = store.getState()._router_tradeVault.vaultBorrowData
    if (
      !vaultBorrowData?.tradeValue ||
      !vaultBorrowData?.belong ||
      sdk.toBig(vaultBorrowData?.tradeValue ?? 0).lte(0)
    ) {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: '' }
    } else if (sdk.toBig(vaultBorrowData?.tradeValue ?? 0).lt(vaultBorrowData.minBorrowAmount)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultBorrowMini|${vaultBorrowData.minBorrowStr} ${vaultBorrowData.belong}`,
      }
    } else if (sdk.toBig(vaultBorrowData.tradeValue ?? 0).gt(vaultBorrowData.balance ?? 0)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultBorrowNotEnough|${vaultBorrowData.belong}`,
      }
    } else if (
      sdk.toBig(vaultBorrowData.tradeValue ?? 0).gt(vaultBorrowData.maxBorrowAmount ?? 0)
    ) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultBorrowMax|${vaultBorrowData.maxBorrowStr} ${vaultBorrowData.belong}`,
      }
    } else {
      return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
    }
  }, [
    vaultAccountInfoStatus,
    vaultTokenMap,
    vaultBorrowData,
    vaultBorrowData.belong,
    vaultBorrowData.tradeValue,
    vaultBorrowData.balance,
    vaultBorrowData.maxBorrowAmount,
    vaultBorrowData.minBorrowAmount,
  ])
  const processRequest = async (request?: sdk.VaultBorrowRequest) => {
    const vaultBorrowData = store.getState()._router_tradeVault.vaultBorrowData
    const vaultToken = vaultTokenMap[vaultBorrowData.belong]
    const {
      account: { eddsaKey, apiKey, accountId },
    } = store.getState()
    try {
      if ((LoopringAPI.vaultAPI && request) || (vaultBorrowData.request && accountId)) {
        let response = await LoopringAPI.vaultAPI.submitVaultBorrow({
          request: request ?? vaultBorrowData.request,
          privateKey: eddsaKey?.sk,
          apiKey: apiKey,
        })
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw response
        }
        setShowVaultLoan({
          isShow: false,
        })
        setIsLoading(false)
        updateVaultLayer2({})
        await sdk.sleep(SUBMIT_PANEL_CHECK)
        const response2 = await LoopringAPI?.vaultAPI.getVaultGetOperationByHash(
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
          status = 'labelSuccessfully'
        }

        setShowAccount({
          isShow: true,
          step: [
            sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED,
            // sdk.VaultOperationStatus.VAULT_STATUS_PENDING,
          ].includes(response2?.raw_data?.operation?.status)
            ? AccountStep.VaultBorrow_Success
            : AccountStep.VaultBorrow_In_Progress,
          info: {
            amount: sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED
              ? vaultBorrowData.borrowAmtStr
              : 0,
            sum: vaultBorrowData.borrowAmtStr,
            status: t(status),
            forexMap,
            symbol: vaultToken.symbol,
            time: response2?.raw_data?.order?.createdAt,
          },
        })

        await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
        updateVaultLayer2({})
        if (
          store.getState().modals.isShowAccount.isShow &&
          [AccountStep.VaultBorrow_Success, AccountStep.VaultBorrow_In_Progress].includes(
            store.getState().modals.isShowAccount.step,
          )
        ) {
          setShowAccount({ isShow: false })
        }
      } else {
        throw new Error('api not ready')
      }
    } catch (e) {
      setIsLoading(false)
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
        step: AccountStep.VaultBorrow_Failed,
        info: {
          amount: EmptyValueTag,
          sum: vaultBorrowData.borrowAmtStr,
          status: t('labelFailed'),
          forexMap,
          symbol: vaultBorrowData.belong,
          time: Date.now(),
          title: t('labelVaultBorrowTitle'),
        },
        error,
      })
    }
  }

  const submitCallback = async () => {
    const vaultBorrowData = store.getState()._router_tradeVault.vaultBorrowData
    const account = store.getState().account
    setIsLoading(true)
    try {
      if (
        vaultBorrowData &&
        exchangeInfo &&
        vaultBorrowData.belong &&
        LoopringAPI.vaultAPI &&
        LoopringAPI.userAPI &&
        vaultAccountInfo &&
        sdk.toBig(vaultBorrowData.borrowVol).gte(vaultBorrowData.minBorrowVol ?? 0) &&
        sdk.toBig(vaultBorrowData.borrowVol).lte(vaultBorrowData.maxBorrowVol ?? 0)
      ) {
        setShowAccount({
          isShow: true,
          step: AccountStep.VaultBorrow_In_Progress,
          info: {
            amount: EmptyValueTag,
            sum: vaultBorrowData.borrowAmtStr,
            status: t('labelPending'),
            forexMap,
            symbol: vaultBorrowData.belong,
            time: Date.now(),
            title: t('labelVaultBorrowTitle'),
          },
        })

        const vaultBorrowRequest: sdk.VaultBorrowRequest = {
          accountId: account.accountId,
          token: {
            tokenId: vaultTokenMap[vaultBorrowData.belong].vaultTokenId as unknown as number,
            volume: vaultBorrowData.borrowVol,
          },
          timestamp: Date.now(),
        }

        updateVaultBorrow({
          ...vaultBorrowData,
          request: vaultBorrowRequest,
        })
        processRequest(vaultBorrowRequest)
      }
    } catch (e) {
      setIsLoading(false)
      setShowAccount({
        isShow: true,
        step: AccountStep.VaultBorrow_Failed,
        info: {
          amount: EmptyValueTag,
          sum: vaultBorrowData.borrowAmtStr,
          status: t('labelFailed'),
          forexMap,
          symbol: vaultBorrowData.belong,
          time: Date.now(),
          title: t('labelVaultBorrowTitle'),
        },
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
    handlePanelEvent,
    vaultBorrowBtnStatus: btnStatus,
    vaultBorrowBtnI18nKey: btnLabel,
    onVaultBorrowClick: onBtnClick,
    walletMap: walletMap as unknown as any,
    coinMap: vaultCoinMap,
    tradeData: vaultBorrowData.tradeData as any,
    vaultBorrowData: vaultBorrowData as V,
    tokenProps: {
      tokenNotEnough: 'labelVaultBorrowNotEnough',
      decimalsLimit:
        vaultTokenMap[vaultBorrowData?.tradeData?.belong]?.vaultTokenAmounts?.qtyStepScale,
      allowDecimals: vaultTokenMap[vaultBorrowData?.tradeData?.belong]?.vaultTokenAmounts
        ?.qtyStepScale
        ? true
        : false,
    },
  }
}

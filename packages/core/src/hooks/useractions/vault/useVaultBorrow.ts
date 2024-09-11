import {
  CustomErrorWithCode,
  EmptyValueTag,
  getValuePrecisionThousand,
  IBData,
  myLog,
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
  onchainHashInfo,
  store,
  useSystem,
  useTokenMap,
  useTokenPrices,
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
import { l2CommonService } from '../../../services'
import { keys } from 'lodash'
import Decimal from 'decimal.js'
import { calcMarinLevel, marginLevelType } from './utils'
export type VaultBorrowTradeData = IBData<any> & {
  erc20Symbol: string
  borrowed: string
  count: string
}

export const calcSupportBorrowData = <T extends VaultBorrowTradeData>(
  tradeData: T, // Omit<T, 'balance'> & { count: string },
) => {
  const {
    invest: {
      vaultMap: { tokenMap: vaultTokenMap, coinMap: vaultCoinMap },
    },
  } = store.getState()
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
    const minBorrowVol = BigNumber.max(
      // orderAmounts.dust,
      //@ts-ignore
      borrowToken?.vaultTokenAmounts?.minLoanAmount,
    )
    const minBorrowAmt = minBorrowVol.div('1e' + borrowToken.decimals)
    const totalQuote = sdk.toBig(orderAmounts.maximum ?? 0).div('1e' + borrowToken.decimals)
    const maxBorrowAmt = sdk
      .toBig(BigNumber.min(totalQuote, tradeData.count))
      .toFixed(borrowToken?.vaultTokenAmounts?.qtyStepScale, BigNumber.ROUND_DOWN)
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
      hourlyRateInPercent: sdk.toFixed(sdk.toNumber(borrowToken.interestRate) * 100, 6, false),
      yearlyRateInPercent: sdk.toFixed(sdk.toNumber(borrowToken.interestRate) * 100 * 24 * 365, 2, false)
    }
  }
  return {
    ...supportData,
  }
}
export const useVaultBorrow = <
  T extends VaultBorrowTradeData,
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
  const { idIndex: erc20IdIndex } = useTokenMap()
  const { tokenPrices } = useTokenPrices()
  const { tokenMap: vaultTokenMap, coinMap: vaultCoinMap, marketCoins, getVaultMap } = useVaultMap()
  const [walletMap, setWalletMap] = React.useState(() => {
    const { vaultAvaiable2Map } = makeVaultAvaiable2({})
    return vaultAvaiable2Map
  })

  const { updateVaultBorrowHash } = onchainHashInfo.useOnChainInfo()
  // chainInfos[defaultNetwork].vaultBorrowHashes

  const { vaultAccountInfo, status: vaultAccountInfoStatus } = useVaultLayer2()
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
      erc20Symbol: initSymbol.slice(2)
    }
    const supportdata = calcSupportBorrowData(walletInfo)
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
      ...calcSupportBorrowData(walletInfo),
    })
  }
  React.useEffect(() => {
    if (isShowVaultLoan.isShow) {
      initData()
    } else {
      resetVaultBorrow()
    }
  }, [isShowVaultLoan.isShow])
  const refreshRef = React.createRef()
  const onRefreshData = React.useCallback(() => {
    myLog('useVaultSwap: onRefreshData')
    l2CommonService.sendUserUpdate()
    getVaultMap()
  }, [])

  React.useEffect(() => {
    let time: any = -1
    if (isShowVaultLoan.isShow) {
      onRefreshData()
      initData()
      time = setTimeout(() => {
        if (refreshRef.current) {
          // @ts-ignore
          refreshRef.current.firstElementChild.click()
        }
      }, 500)
    } else {
      resetVaultBorrow()
    }
    return () => {
      clearTimeout(time)
    }
    // @ts-ignore
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
            tradeValue: data.tradeData?.tradeValue,
            borrowedAmt: walletInfo.borrowed,
          }
          const supportdata = calcSupportBorrowData(walletInfo)
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
        label: `labelVaultBorrowMini|${vaultBorrowData.minBorrowStr} ${vaultBorrowData.belong.slice(2)}`,
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
      account: { eddsaKey, apiKey, accountId, accAddress },
    } = store.getState()
    const erc20Symbol = vaultBorrowData.erc20Symbol

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
        l2CommonService.sendUserUpdate()
        updateVaultBorrowHash((response as any).hash, accAddress)

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
          updateVaultBorrowHash((response as any).hash, accAddress, 'failed')
          throw sdk.VaultOperationStatus.VAULT_STATUS_FAILED
        } else if (
          [sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED].includes(
            response2?.raw_data?.operation?.status,
          )
        ) {
          updateVaultBorrowHash((response as any).hash, accAddress, 'success')
          status = 'labelSuccessfully'
        } else {
          status = 'labelPending'
        }
        setShowAccount({
          isShow: store.getState().modals.isShowAccount.isShow,
          step:
            status == 'labelSuccessfully'
              ? AccountStep.VaultBorrow_Success
              : AccountStep.VaultBorrow_In_Progress,
          info: {
            amount: sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED
              ? vaultBorrowData.borrowAmtStr
              : 0,
            sum: vaultBorrowData.borrowAmtStr,
            status: t(status),
            forexMap,
            symbol: erc20Symbol,
            vSymbol: vaultToken.symbol,
            time: response2?.raw_data?.order?.createdAt,
          },
        })

        await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
        l2CommonService.sendUserUpdate()

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
          symbol: erc20Symbol,
          vSymbol: vaultBorrowData.belong,
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
    const erc20Symbol = vaultBorrowData.erc20Symbol
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
            symbol: erc20Symbol,
            vSymbol: vaultBorrowData.belong,
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
          symbol: erc20Symbol,
          vSymbol: vaultBorrowData.belong,
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

  
  const moreToBorrowInUSD = (vaultBorrowData.tradeData && tokenPrices[vaultBorrowData.tradeData.erc20Symbol])
    ? new Decimal(vaultBorrowData.tradeData.tradeValue ?? '0')
        .mul(tokenPrices[vaultBorrowData.tradeData.erc20Symbol])
        .toString()
    : undefined
  const nextMarginLevel =
    vaultAccountInfo && moreToBorrowInUSD
      ? calcMarinLevel(
        vaultAccountInfo.totalCollateralOfUsdt,
        vaultAccountInfo.totalEquityOfUsdt,
        vaultAccountInfo.totalDebtOfUsdt,
        moreToBorrowInUSD,
        '0'
        )
      : vaultAccountInfo?.marginLevel
  
  console.log('asjdkasjdk', tokenPrices,vaultBorrowData.tradeData&&tokenPrices[vaultBorrowData.tradeData.erc20Symbol],vaultAccountInfo?.marginLevel,vaultAccountInfo?.totalBorrowedOfUsdt,moreToBorrowInUSD, vaultAccountInfo, {
    handlePanelEvent,
    vaultBorrowBtnStatus: btnStatus,
    vaultBorrowBtnI18nKey: btnLabel,
    onVaultBorrowClick: onBtnClick,
    walletMap: walletMap as unknown as any,
    coinMap: keys(walletMap ?? {}).reduce((prev, key) => {
      return {
        ...prev,
        [key]: {
          ...vaultCoinMap[key?.toString() ?? ''],
          erc20Symbol: vaultCoinMap[key?.toString() ?? '']?.simpleName.slice(2),
          belongAlice: vaultCoinMap[key?.toString() ?? '']?.simpleName.slice(2),
        },
      }
    }, {}),
    tradeData: vaultBorrowData.tradeData as any,
    vaultBorrowData: vaultBorrowData as V,
    onRefreshData,
    refreshRef,
    tokenProps: {
      decimalsLimit:
        vaultTokenMap[vaultBorrowData?.tradeData?.belong]?.vaultTokenAmounts?.qtyStepScale,
      allowDecimals: vaultTokenMap[vaultBorrowData?.tradeData?.belong]?.vaultTokenAmounts
        ?.qtyStepScale
        ? true
        : false,
    },
    marginLevelChange:
      vaultAccountInfo && nextMarginLevel
        ? {
            from: {
              marginLevel: vaultAccountInfo.marginLevel,
              type: marginLevelType(vaultAccountInfo.marginLevel),
            },
            to: {
              marginLevel: nextMarginLevel,
              type: marginLevelType(nextMarginLevel),
            },
          }
        : undefined,
  })

  return {
    handlePanelEvent,
    vaultBorrowBtnStatus: btnStatus,
    vaultBorrowBtnI18nKey: btnLabel,
    onVaultBorrowClick: onBtnClick,
    walletMap: walletMap as unknown as any,
    coinMap: keys(walletMap ?? {}).reduce((prev, key) => {
      return {
        ...prev,
        [key]: {
          ...vaultCoinMap[key?.toString() ?? ''],
          erc20Symbol: vaultCoinMap[key?.toString() ?? '']?.simpleName.slice(2),
          belongAlice: vaultCoinMap[key?.toString() ?? '']?.simpleName.slice(2),
        },
      }
    }, {}),
    tradeData: vaultBorrowData.tradeData as any,
    vaultBorrowData: vaultBorrowData as V,
    onRefreshData,
    refreshRef,
    tokenProps: {
      decimalsLimit:
        vaultTokenMap[vaultBorrowData?.tradeData?.belong]?.vaultTokenAmounts?.qtyStepScale,
      allowDecimals: vaultTokenMap[vaultBorrowData?.tradeData?.belong]?.vaultTokenAmounts
        ?.qtyStepScale
        ? true
        : false,
    },
    marginLevelChange:
      (vaultAccountInfo && nextMarginLevel && vaultBorrowData.tradeValue)
        ? {
            from: {
              marginLevel: vaultAccountInfo.marginLevel,
              type: marginLevelType(vaultAccountInfo.marginLevel),
            },
            to: {
              marginLevel: nextMarginLevel,
              type: marginLevelType(nextMarginLevel),
            },
          }
        : undefined,
  }
}

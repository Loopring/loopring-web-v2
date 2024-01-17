import * as sdk from '@loopring-web/loopring-sdk'
import React from 'react'

import {
  AccountStatus,
  CoinMap,
  CustomErrorWithCode,
  defaultBlockTradeSlipage,
  EmptyValueTag,
  getValuePrecisionThousand,
  IBData,
  MarketType,
  myLog,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
  SUBMIT_PANEL_AUTO_CLOSE,
  SUBMIT_PANEL_CHECK,
  TradeBtnStatus,
  UIERROR_CODE,
  VaultTradeCalcData,
  WalletMap,
} from '@loopring-web/common-resources'
import {
  AccountStep,
  SwapData,
  SwapTradeData,
  SwapType,
  ToastType,
  useOpenModals,
  useSettings,
  useToggle,
} from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'

import BigNumber from 'bignumber.js'
import {
  btradeOrderbookService,
  DAYS,
  getTimestampDaysLater,
  LoopringAPI,
  makeVaultLayer2,
  MAPFEEBIPS,
  marketInitCheck,
  reCalcStoB,
  store,
  useAccount,
  usePairMatch,
  useSocket,
  useSubmitBtn,
  useSystem,
  useToast,
  useTokenPrices,
  useTradeVault,
  useVaultLayer2,
  useVaultMap,
  vaultSwapDependAsync,
} from '@loopring-web/core'
import { merge } from 'rxjs'

const useVaultSocket = () => {
  const { tradeVault, updateTradeVault } = useTradeVault()
  const { sendSocketTopic, socketEnd } = useSocket()
  // const { account } = useAccount()
  const { marketMap } = useVaultMap()

  const subjectBtradeOrderbook = React.useMemo(() => btradeOrderbookService.onSocket(), [])
  // const _debonceCall = _.debounce(() => upateAPICall(), globalSetup.wait)
  React.useEffect(() => {
    const { tradeVault } = store.getState()._router_tradeVault
    const item = marketMap[tradeVault?.market]
    if (tradeVault?.depth?.symbol && item?.wsMarket) {
      sendSocketTopic({
        [sdk.WsTopicType.btradedepth]: {
          showOverlap: false,
          markets: [item.wsMarket],
          level: 0,
          count: 50,
          snapshot: false,
        },
      })
    } else {
      socketEnd()
    }
    return () => {
      socketEnd()
    }
  }, [tradeVault?.depth?.symbol])
  React.useEffect(() => {
    const subscription = merge(subjectBtradeOrderbook).subscribe(({ btradeOrderbookMap }) => {
      const { tradeVault } = store.getState()._router_tradeVault
      const item = marketMap[tradeVault.market]
      if (
        item &&
        btradeOrderbookMap &&
        item?.wsMarket &&
        btradeOrderbookMap[item.wsMarket] &&
        tradeVault?.depth?.symbol &&
        item.wsMarket === btradeOrderbookMap[item.wsMarket]?.symbol
      ) {
        updateTradeVault({
          market: item.market,
          depth: { ...btradeOrderbookMap[item.wsMarket], symbol: tradeVault.depth.symbol },
          ...item,
        })
        myLog('useVaultSwap: depth', btradeOrderbookMap[item.wsMarket])
        // debonceCall()
      }
    })
    return () => subscription.unsubscribe()
  }, [tradeVault.market])
}
export const useVaultSwap = <
  T extends SwapTradeData<IBData<C>>,
  C extends { [key: string]: any },
  CAD extends VaultTradeCalcData<T>,
>({
  path,
}: {
  path: string
}) => {
  const { tokenMap, marketMap, coinMap, marketArray, marketCoins, getVaultMap } = useVaultMap()
  const { tokenPrices } = useTokenPrices()
  const {
    setShowSupport,
    setShowTradeIsFrozen,
    modals: { isShowVaultSwap },
    setShowAccount,
    setShowVaultSwap,
  } = useOpenModals()
  const { vaultAccountInfo, status: vaultAccountInfoStatus, updateVaultLayer2 } = useVaultLayer2()
  // //High: No not Move!!!!!!
  //@ts-ignore
  const { realMarket } = usePairMatch({
    path,
    //@ts-ignore
    coinA: isShowVaultSwap?.symbol ?? marketArray[0]?.match(/(\w+)-(\w+)/i)[1] ?? '#null',
    coinB: '#null',
    marketArray,
    tokenMap,
  })
  const { t } = useTranslation(['common', 'error'])
  const [isSwapLoading, setIsSwapLoading] = React.useState(false)

  const refreshRef = React.createRef()
  const { toastOpen, setToastOpen, closeToast } = useToast()
  const { isMobile } = useSettings()

  const { account } = useAccount()
  const {
    toggle: { VaultInvest },
  } = useToggle()

  /** loaded from loading **/
  const { exchangeInfo, allowTrade } = useSystem()

  const { status: vaultLayerStatus } = useVaultLayer2()
  const [tradeData, setTradeData] = React.useState<T | undefined>(undefined)
  const [tradeCalcData, setTradeCalcData] = React.useState<Partial<CAD>>({
    lockedNotification: true,
    isVault: true,
    coinInfoMap: marketCoins?.reduce((prev: any, item: string | number) => {
      return { ...prev, [item]: coinMap ? coinMap[item] : {} }
    }, {} as CoinMap<C>),
  } as any)

  /** redux storage **/
  const {
    tradeVault,
    updateTradeVault,
    __SUBMIT_LOCK_TIMER__,
    __TOAST_AUTO_CLOSE_TIMER__,
    __DAYS__,
    resetTradeVault,
  } = useTradeVault()
  const result = marketArray && marketArray[0] && marketArray[0].match(/([\w,#]+)-([\w,#]+)/i)

  const resetMarket = (_market: MarketType, type: 'sell' | 'buy') => {
    const { tradePair } = marketInitCheck({
      market: _market,
      type,
      defaultValue: marketArray[0],
      marketArray,
      marketMap,
      tokenMap,
      coinMap,
      defaultA: result && result[1],
      defaultB: result && result[2],
    })
    // @ts-ignore
    const [_, sellToken, buyToken] = (tradePair ?? '').match(/(\w+)-(\w+)/i)
    let { market } = sdk.getExistedMarket(marketArray, sellToken, buyToken)
    setIsMarketStatus((state) => {
      return {
        tradePair,
        market,
        isMarketInit: state?.market !== market,
      }
    })
    if (coinMap && tokenMap && marketMap && tokenMap && marketArray) {
      // @ts-ignore
      const [, coinA, coinB] = tradePair.match(/([\w,#]+)-([\w,#]+)/i)
      let walletMap: WalletMap<any> | undefined
      if (account.readyState === AccountStatus.ACTIVATED && vaultLayerStatus === SagaStatus.UNSET) {
        if (!Object.keys(tradeCalcData?.walletMap ?? {}).length) {
          walletMap = makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map
        }
        walletMap = tradeCalcData?.walletMap as WalletMap<any>
      }
      const tradeDataTmp: any = {
        sell: {
          belong: coinA,
          tradeValue: undefined,
          balance: walletMap ? walletMap[coinA]?.count : 0,
        },
        buy: {
          belong: coinB,
          tradeValue: undefined,
          balance: walletMap ? walletMap[coinB]?.count : 0,
        },
      }

      const sellCoinInfoMap = tokenMap[coinB]?.tradePairs?.reduce(
        (prev: any, item: string | number) => {
          return { ...prev, [item]: coinMap[item] }
        },
        {} as CoinMap<C>,
      )

      const buyCoinInfoMap = tokenMap[coinA]?.tradePairs?.reduce(
        (prev: any, item: string | number) => {
          return { ...prev, [item]: coinMap[item] }
        },
        {} as CoinMap<C>,
      )
      let _tradeCalcData = {}
      setTradeCalcData((state) => {
        _tradeCalcData = {
          ...state,
          walletMap,
          coinSell: coinA,
          coinBuy: coinB,
          sellPrecision: tokenMap[coinA as string]?.precision,
          buyPrecision: tokenMap[coinB as string]?.precision,
          sellCoinInfoMap,
          buyCoinInfoMap,
          StoB: undefined,
          BtoS: undefined,
          fee: undefined,
          tradeCost: undefined,
          lockedNotification: true,
          volumeSell: undefined,
          volumeBuy: undefined,
          sellMinAmtStr: undefined,
          sellMaxL2AmtStr: undefined,
          sellMaxAmtStr: undefined,
          totalQuota: undefined,
          l1Pool: undefined,
          l2Pool: undefined,
        }
        return _tradeCalcData
      })
      setTradeData((state) => {
        return {
          ...state,
          ...tradeDataTmp,
        }
      })
      // searchParams.set('market', _market)
      // history.replace(pathname + '?' + searchParams.toString())
      updateTradeVault({
        market,
        tradePair,
        tradeCalcData: _tradeCalcData,
      })
    }
  }
  const [{ market, isMarketInit }, setIsMarketStatus] = React.useState<{
    market: MarketType | undefined
    tradePair?: MarketType
    isMarketInit?: boolean
  }>({ market: undefined })
  React.useEffect(() => {
    if (isShowVaultSwap.isShow) {
      resetMarket(`${isShowVaultSwap?.symbol ?? '#null'}-#null`, 'sell')
    } else {
      resetTradeVault()
      setIsMarketStatus({ market: undefined })
    }
  }, [isShowVaultSwap?.isShow])

  const clearData = () => {
    let _tradeCalcData: any = {}
    setTradeData((state) => {
      return {
        ...state,
        sell: { ...state?.sell, tradeValue: undefined },
        buy: { ...state?.buy, tradeValue: undefined },
      } as T
    })

    setTradeCalcData((state) => {
      _tradeCalcData = {
        ...(state ?? {}),
        maxFeeBips: undefined,
        lockedNotification: true,
        volumeSell: undefined,
        volumeBuy: undefined,
      }
      return _tradeCalcData
    })
    updateTradeVault({
      market,
      maxFeeBips: 0,
      tradeCalcData: {
        ..._tradeCalcData,
      },
    })
  }

  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string | undefined
  } => {
    if (!tokenMap && !tokenPrices) {
      // setSwapBtnStatus();
      // return {tradeBtnStatus:TradeBtnStatus.DISABLED};
      return {
        label: undefined,
        tradeBtnStatus: TradeBtnStatus.DISABLED,
      }
    }
    // const account = store.getState().account;
    const sellToken = tokenMap[tradeData?.sell.belong as string]
    const buyToken = tokenMap[tradeData?.buy.belong as string]
    const account = store.getState().account
    const { tradeCalcData, sellMinAmtInfo, sellMaxAmtInfo } = tradeVault

    if (!sellToken || !buyToken || !tradeCalcData) {
      return {
        label: undefined,
        tradeBtnStatus: TradeBtnStatus.DISABLED,
      }
    }
    const walletMap = makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map ?? {}
    let validAmt = !!(
      tradeCalcData?.volumeSell &&
      sellMinAmtInfo &&
      sdk
        .toBig(tradeCalcData?.volumeSell)
        .gte(sdk.toBig(sellMinAmtInfo).times('1e' + sellToken.decimals))
    )
    const sellExceed = sellMaxAmtInfo
      ? sdk
          .toBig(sellMaxAmtInfo.toString())
          .times('1e' + sellToken.decimals)
          .lt(tradeCalcData.volumeSell ?? 0)
      : false

    if (sellExceed) {
      validAmt = false
    }

    const notEnough = sdk
      .toBig(walletMap[sellToken.symbol]?.count ?? 0)
      .lt(tradeData?.sell?.tradeValue ?? 0)
    if (isSwapLoading || !!isMarketInit) {
      return {
        label: undefined,
        tradeBtnStatus: TradeBtnStatus.LOADING,
      }
    } else {
      if (account.readyState === AccountStatus.ACTIVATED) {
        if (!tradeCalcData || !tradeCalcData.volumeSell || !tradeCalcData.volumeBuy) {
          return {
            label: 'labelEnterAmount',
            tradeBtnStatus: TradeBtnStatus.DISABLED,
          }
        } else if (notEnough) {
          const sellSymbol = tradeData?.sell.belong
          return {
            label: `labelArgNoEnough| ${sellSymbol}`,
            tradeBtnStatus: TradeBtnStatus.DISABLED,
          }
        } else if (sellExceed) {
          const maxOrderSize = tradeCalcData.sellMaxAmtStr + ' ' + tradeData?.sell.belong
          return {
            label: `labelLimitMax| ${maxOrderSize}`,
            tradeBtnStatus: TradeBtnStatus.DISABLED,
          }
        } else if (!validAmt) {
          const sellSymbol = tradeData?.sell.belong
          if (sellMinAmtInfo === undefined || !sellSymbol || sellMinAmtInfo === 'NaN') {
            return {
              label: 'labelEnterAmount',
              tradeBtnStatus: TradeBtnStatus.DISABLED,
            }
          } else {
            const sellToken = tokenMap[sellSymbol]
            const minOrderSize = getValuePrecisionThousand(
              sdk.toBig(sellMinAmtInfo ?? 0), //.div("1e" + sellToken.decimals),
              sellToken.precision,
              sellToken.precision,
              sellToken.precision,
              false,
              { floor: false, isAbbreviate: true },
            )
            if (isNaN(Number(minOrderSize))) {
              return {
                label: `labelLimitMin| ${EmptyValueTag + ' ' + sellSymbol}`,
                tradeBtnStatus: TradeBtnStatus.DISABLED,
              }
            } else {
              return {
                label: `labelLimitMin| ${minOrderSize + ' ' + sellSymbol}`,
                tradeBtnStatus: TradeBtnStatus.DISABLED,
              }
            }
          }
        } else {
          return {
            label: undefined,
            tradeBtnStatus: TradeBtnStatus.AVAILABLE,
          }
        }
      } else {
        return {
          label: undefined,
          tradeBtnStatus: TradeBtnStatus.AVAILABLE,
        }
      }
    }
  }, [
    account,
    tokenMap,
    tradeData?.sell.belong,
    tradeData?.buy.belong,
    tradeVault.maxFeeBips,
    tradeData?.sell.tradeValue,
    tradeData?.buy.tradeValue,
    isSwapLoading,
    isMarketInit,
  ])
  const sendRequest = React.useCallback(async () => {
    setIsSwapLoading(true)
    const {
      tradeCalcData,
      sellToken: _sellToken,
      buyToken: _buyToken,
      depth,
    } = store.getState()._router_tradeVault.tradeVault
    const account = store.getState().account

    try {
      if (
        account.readyState == AccountStatus.ACTIVATED &&
        _sellToken &&
        _buyToken &&
        tokenMap &&
        exchangeInfo &&
        tradeCalcData &&
        tradeCalcData?.volumeSell &&
        tradeCalcData?.volumeBuy &&
        tradeCalcData.maxFeeBips &&
        LoopringAPI.userAPI &&
        LoopringAPI.vaultAPI
      ) {
        const sellToken = tokenMap[_sellToken]
        const buyToken = tokenMap[_buyToken]
        const storageId = await LoopringAPI.userAPI.getNextStorageId(
          {
            accountId: account.accountId,
            sellTokenId: sellToken?.vaultTokenId ?? 0,
          },
          account.apiKey,
        )
        const request: sdk.VaultOrderRequest = {
          exchange: exchangeInfo.exchangeAddress,
          storageId: storageId.orderId,
          accountId: account.accountId,
          sellToken: {
            tokenId: sellToken?.vaultTokenId ?? 0,
            volume: sdk.toBig(tradeCalcData.volumeSell).toFixed(0),
          },
          buyToken: {
            tokenId: buyToken?.vaultTokenId ?? 0,
            volume: sdk.toBig(tradeCalcData.volumeBuy).toFixed(0),
          },
          validUntil: getTimestampDaysLater(DAYS),
          maxFeeBips: tradeCalcData.maxFeeBips,
          fillAmountBOrS: false,
          allOrNone: false,
          eddsaSignature: '',
          clientOrderId: '',
          orderType: sdk.OrderTypeResp.TakerOnly,
          fastMode: false,
        }
        myLog('useVaultSwap: submitOrder request', request)
        const priceToken = tradeCalcData.isReverse ? sellToken : buyToken
        let info: any = {
          sellToken: sellToken.symbol,
          buyToken: buyToken.symbol,
          sellStr: getValuePrecisionThousand(
            sdk.toBig(tradeCalcData.volumeSell).div('1e' + sellToken.decimals),
            sellToken.precision,
            sellToken.precision,
            sellToken.precision,
            false,
            { floor: false },
          ),
          buyStr: getValuePrecisionThousand(
            sdk.toBig(tradeCalcData.volumeBuy).div('1e' + buyToken.decimals),
            buyToken.precision,
            buyToken.precision,
            buyToken.precision,
            false,
            { floor: false },
          ),
          price: getValuePrecisionThousand(
            depth?.mid_price,
            priceToken.precision,
            priceToken.precision,
            priceToken.precision,
            false,
            { floor: false },
          ),
          sellFStr: undefined,
          buyFStr: undefined,
          convertStr: tradeCalcData.isReverse ? tradeCalcData.BtoS : tradeCalcData.StoB,
          feeStr: tradeCalcData?.fee,
          time: Date.now(),
        }

        setShowAccount({
          isShow: true,
          step: AccountStep.VaultTrade_In_Progress,
          info: {
            percentage: undefined,
            status: t('labelPending'),
            ...info,
          },
        })
        const response = await LoopringAPI.vaultAPI.submitVaultOrder({
          request,
          privateKey: account.eddsaKey.sk,
          apiKey: account.apiKey,
        })
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw new CustomErrorWithCode({
            code: (response as sdk.RESULT_INFO).code,
            message: (response as sdk.RESULT_INFO).message,
            ...SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? UIERROR_CODE.UNKNOWN],
          })
        } else {
          clearData()
          setShowVaultSwap({ isShow: false })
          updateVaultLayer2({})
          await sdk.sleep(SUBMIT_PANEL_CHECK)
          if (refreshRef.current) {
            // @ts-ignore
            refreshRef.current.firstElementChild.click()
          }
          const response2: { hash: string } | any =
            await LoopringAPI.vaultAPI.getVaultGetOperationByHash(
              {
                accountId: account.accountId as any,
                // @ts-ignore
                hash: response.hash,
              },
              account.apiKey,
            )
          let status = '',
            sellFStr = undefined,
            buyFStr = undefined
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
            sellFStr = getValuePrecisionThousand(
              sdk.toBig(response2?.raw_data.order.fillAmountS).div('1e' + sellToken.decimals),
              sellToken.precision,
              sellToken.precision,
              sellToken.precision,
              false,
              { floor: false },
            )
            buyFStr = getValuePrecisionThousand(
              sdk.toBig(response2?.raw_data.order.fillAmountB).div('1e' + buyToken.decimals),
              buyToken.precision,
              buyToken.precision,
              buyToken.precision,
              false,
              { floor: false },
            )
          } else {
            status = 'labelPending'
          }

          setShowAccount({
            isShow: true,
            step:
              status == 'labelSuccessfully'
                ? AccountStep.VaultTrade_Success
                : AccountStep.VaultTrade_In_Progress,
            info: {
              ...info,
              sellFStr,
              buyFStr,
              price: response2?.raw_data.order.price,
              percentage: sdk
                .toBig(response2?.raw_data?.order?.fillAmountS ?? 0)
                .div(response2?.raw_data?.order?.amountS ?? 1)
                .times(100)
                .toFixed(2),
              status: t(status),
            },
          })
          await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
          updateVaultLayer2({})
          if (
            store.getState().modals.isShowAccount.isShow &&
            [AccountStep.VaultTrade_Success, AccountStep.VaultTrade_In_Progress].includes(
              store.getState().modals.isShowAccount.step,
            )
          ) {
            setShowAccount({ isShow: false })
          }
        }
      } else {
        throw new Error('api not ready')
      }
    } catch (error: any) {
      let content: string = ''
      if ([102024, 102025, 114001, 114002].includes(error?.code || 0)) {
        content =
          t('labelVaultTradeFailed') +
          ' error: ' +
          (error && error.messageKey
            ? t(error.messageKey, { ns: 'error' })
            : (error as sdk.RESULT_INFO).message)
      } else {
        sdk.dumpError400(error)
        content =
          t('labelVaultTradeFailed') +
          ' error: ' +
          (error && error.messageKey
            ? t(error.messageKey, { ns: 'error' })
            : (error as sdk.RESULT_INFO).message)
      }
      setShowAccount({
        isShow: false,
      })
      setToastOpen({
        open: true,
        type: ToastType.error,
        content,
        // info:{
        //   ...info,
        //   status: t('labelFailed'),
        // }
      })
    }
    setIsSwapLoading(false)
  }, [
    tradeVault,
    tradeData,
    tokenMap,
    exchangeInfo,
    __SUBMIT_LOCK_TIMER__,
    setToastOpen,
    t,
    __DAYS__,
    market,
    __TOAST_AUTO_CLOSE_TIMER__,
    updateTradeVault,
  ])

  /*** Btn related function ***/
  const vaultSwapSubmit = React.useCallback(async () => {
    if (!allowTrade?.order?.enable) {
      setShowSupport({ isShow: true })
      setIsSwapLoading(false)
      return
    } else if ((market && !marketMap[market]?.enabled) || !VaultInvest.enable) {
      setShowTradeIsFrozen({
        isShow: true,
        type: 'Vault',
      })
      setIsSwapLoading(false)
      return
    } else {
      sendRequest()
    }
  }, [market, marketMap, VaultInvest])

  const {
    btnStatus,
    onBtnClick: onSwapClick,
    btnLabel: swapBtnI18nKey,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading: !!isMarketInit,
    submitCallback: vaultSwapSubmit,
  })

  const should15sRefresh = React.useCallback(() => {
    myLog('useVaultSwap: should15sRefresh', market)
    if (market) {
      getVaultMap()
      callPairDetailInfoAPIs()
    }
  }, [market])

  React.useEffect(() => {
    const {
      depth,
      // tradeCalcData,
      sellToken: _sellToken,
      buyToken: _buyToken,
    } = store.getState()._router_tradeVault.tradeVault
    if (depth && new RegExp(market ?? '').test(depth?.symbol)) {
      refreshWhenDepthUp()
      setIsMarketStatus((state) => {
        return {
          ...state,
          isMarketInit: false,
        }
      })
    }
  }, [tradeVault.depth, account.readyState, market])

  const vaultLayer2Callback = React.useCallback(async () => {
    if (account.readyState === AccountStatus.ACTIVATED) {
      refreshWhenDepthUp()
    } else {
      if (tradeCalcData.coinSell && tradeCalcData.coinBuy) {
        setTradeData((state) => {
          return {
            ...state,
            sell: { belong: tradeCalcData.coinSell },
            buy: { belong: tradeCalcData.coinBuy },
          } as T
        })
      }
      updateTradeVault({
        market: market as MarketType,
        maxFeeBips: 0,
        totalFee: 0,
        tradeCalcData: {},
      })

      setTradeCalcData((state) => {
        return {
          ...state,
          walletMap: {},
          minimumReceived: undefined,
          priceImpact: undefined,
          fee: undefined,
        }
      })
    }
  }, [tradeData, market, tradeCalcData, marketArray, account.readyState])
  useVaultSocket()
  React.useEffect(() => {
    if (vaultLayer2Callback && vaultAccountInfoStatus === SagaStatus.UNSET) {
      vaultLayer2Callback()
    }
  }, [vaultAccountInfoStatus])

  /*** user Action function ***/
  //High: effect by wallet state update
  const handleSwapPanelEvent = async (
    swapData: SwapData<SwapTradeData<IBData<C>>>,
    swapType: any,
  ): Promise<void> => {
    const { tradeData: _tradeData } = swapData
    myLog('useVaultSwap: resetSwap', swapType, _tradeData)
    const depth = store.getState()._router_tradeVault.tradeVault.depth
    switch (swapType) {
      case SwapType.SEll_CLICK:
      case SwapType.BUY_CLICK:
        return
      case SwapType.SELL_SELECTED:
        myLog(_tradeData)
        if (_tradeData?.sell.belong !== tradeData?.sell.belong) {
          resetMarket(
            `${_tradeData?.sell?.belong ?? `#null`}-${_tradeData?.buy?.belong ?? `#null`}`,
            'sell',
          )
        } else {
          reCalculateDataWhenValueChange(
            _tradeData,
            `${_tradeData?.sell.belong}-${_tradeData?.buy.belong}`,
            'sell',
          )
        }
        break
      case SwapType.BUY_SELECTED:
        if (_tradeData?.buy.belong !== tradeData?.buy.belong) {
          resetMarket(
            `${_tradeData?.sell?.belong ?? `#null`}-${_tradeData?.buy?.belong ?? `#null`}`,
            'buy',
          )
        } else {
          reCalculateDataWhenValueChange(
            _tradeData,
            `${_tradeData?.sell.belong}-${_tradeData?.buy.belong}`,
            'buy',
          )
        }
        break
      case SwapType.EXCHANGE_CLICK:
        let StoB, BtoS
        if (depth && depth.mid_price) {
          const pr1 = sdk.toBig(1).div(depth.mid_price).toString()
          const pr2 = depth.mid_price
          ;[StoB, BtoS] =
            market === `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}`
              ? [pr1, pr2]
              : [pr2, pr1]
        }
        const sellPrecision = tokenMap[tradeCalcData.coinBuy as string].precision
        const buyPrecision = tokenMap[tradeCalcData.coinSell as string].precision
        const _tradeCalcData = {
          ...tradeCalcData,
          coinSell: tradeCalcData.coinBuy,
          coinBuy: tradeCalcData.coinSell,
          sellPrecision,
          buyPrecision,
          sellCoinInfoMap: tradeCalcData.buyCoinInfoMap,
          buyCoinInfoMap: tradeCalcData.sellCoinInfoMap,
          StoB: getValuePrecisionThousand(StoB, buyPrecision, buyPrecision, undefined, false),
          BtoS: getValuePrecisionThousand(BtoS, sellPrecision, sellPrecision, undefined, false),
        }

        myLog(
          'useVaultSwap:Exchange,tradeCalcData,_tradeCalcData',
          tradeData,
          tradeCalcData,
          _tradeCalcData,
        )
        callPairDetailInfoAPIs()
        updateTradeVault({
          market,
          tradePair: `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}`,
          tradeCalcData: _tradeCalcData,
        })
        setTradeCalcData(_tradeCalcData)
        // @ts-ignore
        setTradeData((state) => {
          const walletMap = makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map

          return {
            ...(state ?? {}),
            sell: {
              belong: _tradeCalcData.coinSell,
              tradeValue: undefined,
              balance: walletMap ? walletMap[_tradeCalcData.coinSell as string]?.count : 0,
            },
            buy: {
              belong: _tradeCalcData.coinBuy,
              tradeValue: undefined,
              balance: walletMap ? walletMap[_tradeCalcData.coinBuy as string]?.count : 0,
            },
          }
        })
        break
      default:
        // resetTradeCalcData(undefined, market);
        break
    }
  }

  React.useEffect(() => {
    if (market) {
      //@ts-ignore
      if (refreshRef.current) {
        // @ts-ignore
        refreshRef.current.firstElementChild.click()
        should15sRefresh()
      }
    }
  }, [market])

  const callPairDetailInfoAPIs = React.useCallback(async () => {
    if (market && LoopringAPI.defiAPI && marketMap && marketMap[market]) {
      try {
        const { depth } = await vaultSwapDependAsync({
          market: marketMap[market]?.vaultMarket as MarketType,
          tokenMap,
        })
        updateTradeVault({
          // @ts-ignore
          market,
          depth,
          ...marketMap[market],
        })
        myLog('useVaultSwap:', market, depth?.symbol)
      } catch (error: any) {
        myLog('useVaultSwap:', error, 'go to LRC-ETH')
        setToastOpen({
          open: true,
          content: 'error: resetMarket',
          type: ToastType.error,
        })
        resetMarket(market, 'sell')
      }
    }
  }, [market, marketMap])
  const reCalculateDataWhenValueChange = React.useCallback(
    (_tradeData, _tradePair?, type?) => {
      const { depth, tradePair } = store.getState()._router_tradeVault.tradeVault

      const walletMap = makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map
      myLog('useVaultSwap:reCalculateDataWhenValueChange', tradeData, _tradePair, type)
      if (
        depth &&
        market &&
        marketMap[market] &&
        marketMap[market]?.enabled !== 'isFormLocal' &&
        market &&
        _tradePair === tradePair &&
        _tradeData?.sell
      ) {
        const coinA = _tradeData?.sell.belong
        const coinB = _tradeData?.buy.belong
        _tradeData.sell.balance = walletMap ? walletMap[coinA]?.count : 0
        const sellToken = tokenMap[coinA as string]
        const buyToken = tokenMap[coinB as string]
        const sellBuyStr = `${sellToken.symbol}-${buyToken.symbol}`
        const isAtoB = type === 'sell'

        let input: any = isAtoB ? _tradeData.sell.tradeValue : _tradeData.buy.tradeValue
        input = input === undefined || isNaN(Number(input)) ? 0 : Number(input)
        let totalFee: any = undefined
        let stob: string | undefined = undefined
        let btos: string | undefined = undefined
        let minimumReceived: any
        let minimumConverted: string | undefined = undefined
        let sellMinAmtInfo: any = undefined
        let sellMaxAmtInfo: any = undefined
        let sellMaxL2AmtInfo: any = undefined
        let totalFeeRaw: any = undefined
        let totalQuote: any = undefined
        const info = marketMap[market] as sdk.VaultMarket
        let maxFeeBips = info.feeBips ?? MAPFEEBIPS

        let slippage = sdk
          .toBig(
            _tradeData.slippage && !isNaN(_tradeData.slippage)
              ? _tradeData.slippage
              : defaultBlockTradeSlipage,
          )
          .times(100)
          .toString()
        const { minAmount, l2Amount } = info

        const calcDexOutput = sdk.calcDex<sdk.VaultMarket>({
          info,
          input: input.toString(),
          sell: sellToken.symbol,
          buy: buyToken.symbol,
          isAtoB,
          marketArr: marketArray,
          tokenMap,
          marketMap: marketMap as any,
          depth,
          feeBips: maxFeeBips.toString(),
          slipBips: slippage,
        })
        const amountVol = tokenMap[sellToken?.symbol]?.vaultTokenAmounts?.maxAmount
        if (amountVol && l2Amount) {
          const sellDeepStr =
            sdk
              .toBig(sellBuyStr == market ? depth.bids_amtTotal : depth.asks_volTotal)
              .div('1e' + sellToken.decimals)
              .times(0.99)
              .toString() ?? '0'

          totalQuote = sellDeepStr
            ? getValuePrecisionThousand(
                BigNumber.min(sellDeepStr),
                sellToken.precision,
                sellToken.precision,
                undefined,
                false,
                { isAbbreviate: true },
              )
            : EmptyValueTag
          sellMaxAmtInfo = BigNumber.min(sellDeepStr, _tradeData.sell.balance ?? 0)
        }
        sellMinAmtInfo = BigNumber.max(
          sellToken.orderAmounts.dust,
          sellBuyStr == market ? minAmount.base : minAmount.quote,
        )
          .div('1e' + sellToken.decimals)
          .toString()

        if (calcDexOutput) {
          totalFeeRaw = sdk
            .toBig(calcDexOutput?.amountBSlipped?.minReceived ?? 0)
            .div(10000)
            .times(maxFeeBips)
          totalFee = totalFeeRaw.gt(0)
            ? getValuePrecisionThousand(
                sdk
                  .toBig(totalFeeRaw)
                  .div('1e' + buyToken.decimals)
                  .toString(),
                buyToken.precision,
                buyToken.precision,
                undefined,
              )
            : 0
          minimumReceived = sdk.toBig(calcDexOutput?.amountBSlipped?.minReceived ?? 0).gt(0)
            ? getValuePrecisionThousand(
                sdk
                  .toBig(calcDexOutput?.amountBSlipped?.minReceived ?? 0)
                  .minus(totalFeeRaw ?? 0)
                  .div('1e' + buyToken.decimals)
                  .toString(),
                buyToken.precision,
                buyToken.precision,
                undefined,
              )
            : 0
          minimumConverted = calcDexOutput?.amountB
            ? getValuePrecisionThousand(
                sdk
                  .toBig(calcDexOutput?.amountB)
                  .times(sdk.toBig(1).minus(sdk.toBig(slippage).div('10000')))
                  .toString(),
                buyToken.precision,
                buyToken.precision,
                undefined,
              )
            : undefined
          _tradeData[isAtoB ? 'buy' : 'sell'].tradeValue =
            !_tradeData[isAtoB ? 'sell' : 'buy'].tradeValue &&
            _tradeData[isAtoB ? 'sell' : 'buy'].tradeValue != '0'
              ? (undefined as any)
              : getValuePrecisionThousand(
                  calcDexOutput[`amount${isAtoB ? 'B' : 'S'}`],
                  isAtoB ? buyToken.precision : sellToken.precision,
                  isAtoB ? buyToken.precision : sellToken.precision,
                  isAtoB ? buyToken.precision : sellToken.precision,
                ).replaceAll(sdk.SEP, '')
          let result = reCalcStoB({
            market,
            tradeData: _tradeData as SwapTradeData<IBData<unknown>>,
            tradePair: tradePair as any,
            marketMap,
            tokenMap,
          })
          stob = result?.stob
          btos = result?.btos
        } else {
          minimumReceived = undefined
        }

        let _tradeCalcData: any = {
          minimumReceived,
          maxFeeBips,
          volumeSell: calcDexOutput?.sellVol as any,
          volumeBuy: calcDexOutput?.amountBSlipped?.minReceived,
          fee: totalFee,
          slippage: sdk.toBig(slippage).div(100).toString(),
          isReverse: calcDexOutput?.isReverse,
          lastStepAt: type,
          sellMinAmtStr: getValuePrecisionThousand(
            sdk.toBig(sellMinAmtInfo ?? 0),
            sellToken.precision,
            sellToken.precision,
            sellToken.precision,
            false,
          ),
          sellMaxL2AmtStr: getValuePrecisionThousand(
            sdk.toBig(sellMaxL2AmtInfo ?? 0),
            sellToken.precision,
            sellToken.precision,
            sellToken.precision,
            false,
            { isAbbreviate: true },
          ),
          sellMaxAmtStr: undefined,
          // sellMaxAmtInfo !== undefined
          //   ? getValuePrecisionThousand(
          //       sdk.toBig(sellMaxAmtInfo ?? 0),
          //       sellToken.precision,
          //       sellToken.precision,
          //       undefined,
          //       false,
          //       { isAbbreviate: true },
          //     )
          //   : undefined,
          totalQuota: totalQuote,
          // l1Pool: poolToVol,
          l2Pool: getValuePrecisionThousand(
            sdk
              .toBig((sellBuyStr == market ? l2Amount.quote : l2Amount.base) ?? 0)
              .div('1e' + buyToken.decimals),
            buyToken.precision,
            buyToken.precision,
            undefined,
            false,
          ),
          minimumConverted,
        }

        setTradeCalcData((state) => {
          const [mid_price, _mid_price_convert] = calcDexOutput
            ? [
                depth.mid_price,
                getValuePrecisionThousand(
                  1 / depth.mid_price,
                  buyToken.precision,
                  buyToken.precision,
                  buyToken.precision,
                ),
              ]
            : [undefined, undefined]

          stob = stob
            ? stob
            : state?.StoB
            ? state.StoB
            : !calcDexOutput?.isReverse
            ? mid_price
            : _mid_price_convert
          btos = btos
            ? btos
            : state?.BtoS
            ? state.BtoS
            : calcDexOutput?.isReverse
            ? mid_price
            : _mid_price_convert
          _tradeCalcData = {
            ...state,
            ..._tradeCalcData,
            StoB: getValuePrecisionThousand(
              stob?.replaceAll(sdk.SEP, '') ?? 0,
              buyToken.precision,
              buyToken.precision,
              undefined,
            ),
            BtoS: getValuePrecisionThousand(
              btos?.replaceAll(sdk.SEP, '') ?? 0,
              sellToken.precision,
              sellToken.precision,
              undefined,
            ),
            lastStepAt: type,
          }
          return _tradeCalcData
        })

        setTradeData((state) => ({
          ...state,
          ..._tradeData,
          sell: {
            ...state?.sell,
            ..._tradeData?.sell,
            balance: walletMap ? walletMap[_tradeData?.sell?.belong ?? '']?.count : 0,
          },
        }))

        updateTradeVault({
          info: info,
          market: market as any,
          totalFee: totalFee,
          totalFeeRaw: totalFeeRaw?.toString(),
          lastStepAt: type,
          sellMinAmtInfo: sellMinAmtInfo as any,
          sellMaxL2AmtInfo: sellMaxL2AmtInfo as any,
          sellMaxAmtInfo: sellMaxAmtInfo as any,
          tradeCalcData: _tradeCalcData,
          maxFeeBips,
        })
      }
    },
    [account.readyState, tradeVault, tradeCalcData, tradeData, coinMap, tokenMap, marketArray],
  )
  const refreshWhenDepthUp = React.useCallback(() => {
    const { depth, lastStepAt, tradePair, market } = tradeVault

    if (
      (depth && depth.symbol === market) ||
      (tradeData &&
        lastStepAt &&
        tradeCalcData.coinSell === tradeData['sell'].belong &&
        tradeCalcData.coinBuy === tradeData['buy'].belong &&
        tradeData[lastStepAt].tradeValue &&
        tradeData[lastStepAt].tradeValue !== 0)
    ) {
      reCalculateDataWhenValueChange(tradeData, tradePair, lastStepAt)
    } else if (
      depth &&
      tradeCalcData.coinSell &&
      tradeCalcData.coinBuy &&
      (`${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}` === market ||
        `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}` === market)
    ) {
      const walletMap = makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map

      const result = reCalcStoB({
        market,
        tradeData: tradeData as SwapTradeData<IBData<unknown>>,
        tradePair: tradePair as any,

        marketMap,
        tokenMap,
      })
      const buyToken = tokenMap[tradeCalcData.coinBuy]
      const sellToken = tokenMap[tradeCalcData.coinSell]

      let _tradeCalcData: any = {}
      setTradeCalcData((state) => {
        const pr1 = sdk.toBig(1).div(depth.mid_price).toString()
        const pr2 = depth.mid_price
        const [StoB, BtoS] =
          market === `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}` ? [pr1, pr2] : [pr2, pr1]
        _tradeCalcData = {
          ...state,
          ...tradeCalcData,
          StoB: getValuePrecisionThousand(
            (result ? result?.stob : StoB.toString())?.replaceAll(sdk.SEP, ''),
            buyToken.precision,
            buyToken.precision,
            undefined,
          ),
          BtoS: getValuePrecisionThousand(
            (result ? result?.btos : BtoS.toString())?.replaceAll(sdk.SEP, ''),
            sellToken.precision,
            sellToken.precision,
            undefined,
          ),
        }
        return {
          ..._tradeCalcData,
          walletMap,
        }
      })
      reCalculateDataWhenValueChange(
        {
          sell: {
            belong: tradeCalcData.coinSell,
            balance: walletMap ? walletMap[tradeCalcData.coinSell]?.count : 0,
          },
          buy: { belong: tradeCalcData.coinBuy },
        },
        `${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}`,
        'sell',
      )

      updateTradeVault({ market, tradeCalcData: _tradeCalcData })
    }
  }, [market, tradeVault, tradeData, tradeCalcData, setTradeCalcData])
  // myLog('vaultLayer2 swapBtnStatus', btnStatus)
  return {
    isMarketInit,
    toastOpen,
    closeToast,
    tradeCalcData,
    tradeData,
    onSwapClick,
    swapBtnI18nKey,
    swapBtnStatus: btnStatus,
    handleSwapPanelEvent,
    should15sRefresh,
    refreshRef,
    vaultSwapSubmit,
    tradeVault,
    vaultAccountInfo,
    isSwapLoading,
    market,
    isMobile,
    setToastOpen,
  }
}

import * as sdk from '@loopring-web/loopring-sdk'
import React from 'react'
import {
  BIGO,
  calcPriceByAmmTickMapDepth,
  DefaultFeeBips,
  getPriceImpactInfo,
  getTimestampDaysLater,
  isTradePairMarket,
  LoopringAPI,
  makeWalletLayer2,
  MAPFEEBIPS,
  MarketCalcParams,
  marketInitCheck,
  PriceLevel,
  reCalcStoB,
  store,
  swapDependAsync,
  useAccount,
  useAmmMap,
  useAmount,
  useBtradeMap,
  usePageTradeLite,
  usePairMatch,
  useSocket,
  useSubmitBtn,
  useSystem,
  useTicker,
  useToast,
  useTokenMap,
  useTokenPrices,
  useWalletLayer2,
  useWalletLayer2Socket,
  walletLayer2Service,
} from '../../index'

import {
  AccountStatus,
  CoinMap,
  defaultSlipage,
  EmptyValueTag,
  getShowStr,
  getValuePrecisionThousand,
  IBData,
  MarketType,
  myLog,
  RouterPath,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
  SwapTradeCalcData,
  TradeBtnStatus,
  WalletMap,
} from '@loopring-web/common-resources'
import {
  SwapData,
  SwapTradeData,
  SwapType,
  ToastType,
  useOpenModals,
  useSettings,
  useToggle,
} from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import BigNumber from 'bignumber.js'

export enum ShowWitchAle3t1 {
  AlertImpact = 'AlertImpact',
  SwapSecondConfirmation = 'SwapSecondConfirmation',
  ConfirmImpact = 'ConfirmImpact',
  SmallPrice = 'SmallPrice',
}

export const useAlert = () => {
  const [confirmed, setConfirmed] = React.useState<[boolean, boolean]>([false, false])
  const [showAlert, setShowWhich] = React.useState<{
    isShow: boolean
    step: 1 | 2
    showWitch: '' | ShowWitchAle3t1
  }>({
    isShow: false,
    step: 1,
    showWitch: '',
  })
  return {
    showAlert,
    confirmed,
    setShowWhich,
    setConfirmed,
  }
}

const useSwapSocket = () => {
  const { sendSocketTopic, socketEnd } = useSocket()
  const { ammMap } = useAmmMap()
  const { pageTradeLite } = usePageTradeLite()
  React.useEffect(() => {
    if (pageTradeLite.market) {
      sendSocketTopic({
        [sdk.WsTopicType.ammpool]: ammMap['AMM-' + pageTradeLite.market]
          ? [ammMap['AMM-' + pageTradeLite.market].address]
          : [],
        [sdk.WsTopicType.mixorder]: {
          markets: [pageTradeLite.market],
          level: 0,
          count: 50,
          snapshot: true,
        },
      })
    } else {
      socketEnd()
    }
    return () => {
      socketEnd()
    }
  }, [pageTradeLite?.market])
}

export const useSwap = <
  T extends SwapTradeData<IBData<C>>,
  C extends { [key: string]: any },
  CAD extends SwapTradeCalcData<T>,
>({
  path,
}: {
  path: string
}) => {
  //High: No not Move!!!!!!
  const { realMarket } = usePairMatch({ path })
  const { t } = useTranslation(['common', 'error'])
  const history = useHistory()
  const refreshRef = React.createRef()
  const { toastOpen, setToastOpen, closeToast } = useToast()
  const { isMobile, swapSecondConfirmation } = useSettings()
  const { setShowSupport, setShowTradeIsFrozen } = useOpenModals()
  const { account, status: accountStatus } = useAccount()
  const { marketArray: bTradeMarketArray } = useBtradeMap()
  const {
    toggle: { order },
  } = useToggle()
  /** loaded from loading **/
  const { exchangeInfo, allowTrade } = useSystem()
  const { coinMap, tokenMap, marketArray, marketCoins, marketMap } = useTokenMap()
  const { ammMap } = useAmmMap()
  /** init Ticker ready from ui-backend load**/
  const { tickerMap } = useTicker()
  /** get store value **/
  /** after unlock **/
  const { amountMap, getAmount, status: amountStatus } = useAmount()
  const { status: walletLayer2Status } = useWalletLayer2()
  const [sellMinAmt, setSellMinAmt] = React.useState<string>()
  const [tradeData, setTradeData] = React.useState<T | undefined>(undefined)
  const [tradeCalcData, setTradeCalcData] = React.useState<CAD & { [key: string]: any }>({
    coinInfoMap: marketCoins?.reduce((prev: any, item: string | number) => {
      return { ...prev, [item]: coinMap ? coinMap[item] : {} }
    }, {} as CoinMap<C>),
  } as CAD)
  /** redux storage **/
  const {
    pageTradeLite,
    updatePageTradeLite,
    __SUBMIT_LOCK_TIMER__,
    __TOAST_AUTO_CLOSE_TIMER__,
    __DAYS__,
  } = usePageTradeLite()
  /*** api prepare ***/
  // const [pair, setPair] = React.useState(realPair);
  const [isSwapLoading, setIsSwapLoading] = React.useState(false)
  /***confirm  ***/
  const [storageId, setStorageId] = React.useState<{
    orderId: number
    offchainId: number
  }>({} as any)
  const { tokenPrices } = useTokenPrices()

  const showSwapSecondConfirmation = swapSecondConfirmation !== false
  const isSmallOrder =
    tradeData && tradeData.buy.tradeValue
      ? tokenPrices[tradeData.buy.belong] * tradeData.buy.tradeValue < 100
      : false
  const resetMarket = (_market: MarketType, type: 'sell' | 'buy') => {
    const { tradePair } = marketInitCheck({ market: _market, type })
    const [_, sellToken, buyToken] = (tradePair ?? '').match(/(\w+)-(\w+)/i)
    let { market } = sdk.getExistedMarket(marketArray, sellToken, buyToken)
    setIsMarketStatus((state) => {
      return {
        tradePair,
        market,
        isMarketInit: state.market !== market,
      }
    })
    if (coinMap && tokenMap && marketMap && marketArray) {
      // const { tradePair } = marketInitCheck({ market: _market, type });
      // @ts-ignore
      const [, coinA, coinB] = tradePair.match(/([\w,#]+)-([\w,#]+)/i)
      let walletMap: WalletMap<any> | undefined
      if (
        account.readyState === AccountStatus.ACTIVATED &&
        walletLayer2Status === SagaStatus.UNSET
      ) {
        if (!Object.keys(tradeCalcData.walletMap ?? {}).length) {
          walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap as WalletMap<any>
        }
        walletMap = tradeCalcData.walletMap as WalletMap<any>
      }
      const tradeDataTmp: any = {
        sell: {
          belong: coinA,
          tradeValue: 0,
          balance: walletMap ? walletMap[coinA]?.count : 0,
        },
        buy: {
          belong: coinB,
          tradeValue: 0,
          balance: walletMap ? walletMap[coinB]?.count : 0,
        },
      }

      const sellCoinInfoMap = tokenMap[coinB]?.tradePairs?.reduce(
        (prev: any, item: string | number) => {
          return { ...prev, [item]: coinMap[item] }
        },
        {} as CoinMap<C>,
      )

      const buyCoinInfoMap = tokenMap[coinA].tradePairs?.reduce(
        (prev: any, item: string | number) => {
          return { ...prev, [item]: coinMap[item] }
        },
        {} as CoinMap<C>,
      )

      setTradeCalcData((state) => {
        return {
          ...state,
          walletMap,
          coinSell: coinA,
          coinBuy: coinB,
          sellPrecision: tokenMap[coinA as string]?.precision,
          buyPrecision: tokenMap[coinB as string]?.precision,
          sellCoinInfoMap,
          buyCoinInfoMap,
          priceImpact: '',
          priceImpactColor: 'inherit',
          minimumReceived: undefined,
          StoB: undefined,
          BtoS: undefined,
          fee: undefined,
          feeTakerRate: undefined,
          tradeCost: undefined,
          isShowBtradeAllow: false,
        }
      })
      setTradeData({ ...tradeDataTmp })
      history.push(`${RouterPath.lite}/${_market}`)
      updatePageTradeLite({ market, tradePair })
      myLog('hookSwap: Market change getAmount', market)
    }
  }
  const [{ market, isMarketInit }, setIsMarketStatus] = React.useState<{
    market: MarketType
    tradePair?: MarketType
    isMarketInit?: boolean
  }>({} as any)
  React.useEffect(() => {
    resetMarket(realMarket ?? '#null-#null', 'sell')
  }, [])

  const clearData = (calcTradeParams: Partial<MarketCalcParams> | null | undefined) => {
    setTradeData((state) => {
      return {
        ...state,
        sell: { ...state?.sell, tradeValue: undefined },
        buy: { ...state?.buy, tradeValue: undefined },
        isChecked: undefined,
      } as T
    })
    setTradeCalcData((state) => {
      return {
        ...state,
        minimumReceived: undefined,
        priceImpact: undefined,
        fee: undefined,
        isNotMatchMarketPrice: undefined,
        marketPrice: undefined,
        marketRatePrice: undefined,
        isChecked: undefined,
        isShowBtradeAllow: false,
      }
    })
    updatePageTradeLite({
      market,
      maxFeeBips: MAPFEEBIPS,
      calcTradeParams: {
        ...calcTradeParams,
        // takerRate: undefined,
        // feeBips: undefined,
        output: undefined,
        sellAmt: undefined,
        buyAmt: undefined,
        amountS: undefined,
        amountBOut: undefined,
        amountBOutWithoutFee: undefined,
        amountBOutSlip: undefined,
        priceImpact: undefined,
      },
    })
  }
  // @ts-ignore
  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string | undefined
  } => {
    if (!tokenMap && !tokenPrices) {
      return {
        label: undefined,
        tradeBtnStatus: TradeBtnStatus.DISABLED,
      }
    }
    const account = store.getState().account
    const sellToken = tokenMap[tradeData?.sell.belong as string]
    const buyToken = tokenMap[tradeData?.buy.belong as string]

    const { calcTradeParams } = pageTradeLite

    if (!sellToken || !buyToken || !calcTradeParams || storageId?.orderId == undefined) {
      return {
        label: undefined,
        tradeBtnStatus: TradeBtnStatus.DISABLED,
      }
    }
    const walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap ?? {}

    let validAmt = !!(
      calcTradeParams?.amountS &&
      sellMinAmt &&
      sdk.toBig(calcTradeParams?.amountS).gte(sdk.toBig(sellMinAmt))
    )

    const sellExceed = sdk.toBig(sellToken?.orderAmounts?.maximum).lt(calcTradeParams.amountS ?? 0)

    const buyExceed = sdk
      .toBig(buyToken?.orderAmounts?.maximum)
      .lt(calcTradeParams?.amountBOutSlip?.minReceived ?? 0)

    if (sellExceed || buyExceed) {
      validAmt = false
    }

    const notEnough = sdk
      .toBig(walletMap[sellToken.symbol]?.count ?? 0)
      .lt(calcTradeParams.sellAmt ?? 0)

    const sellMaxVal = sdk.toBig(sellToken?.orderAmounts?.maximum).div('1e' + sellToken.decimals)
    const buyMaxVal = sdk.toBig(buyToken?.orderAmounts?.maximum).div('1e' + buyToken.decimals)

    if (isSwapLoading || isMarketInit) {
      return {
        label: undefined,
        tradeBtnStatus: TradeBtnStatus.LOADING,
      }
    } else {
      if (account.readyState === AccountStatus.ACTIVATED) {
        if (!calcTradeParams || !calcTradeParams.sellAmt || !calcTradeParams.buyAmt) {
          myLog(
            'hookSwap: calcTradeParams.baseAmt:',
            calcTradeParams.sellAmt,
            ' calcTradeParams.quoteAmt:',
            calcTradeParams.buyAmt,
          )

          return {
            label: 'labelEnterAmount',
            tradeBtnStatus: TradeBtnStatus.DISABLED,
          }
        } else if (notEnough) {
          return {
            label: `labelArgNoEnough| ${tradeData?.sell.belong}`,
            tradeBtnStatus: TradeBtnStatus.DISABLED,
          }
        } else if (sellExceed) {
          const maxOrderSize = sellMaxVal + ' ' + tradeData?.sell.belong
          return {
            label: `labelLimitMax| ${maxOrderSize}`,
            tradeBtnStatus: TradeBtnStatus.DISABLED,
          }
        } else if (buyExceed) {
          const maxOrderSize = buyMaxVal + ' ' + tradeData?.buy.belong
          return {
            label: `labelLimitMax| ${maxOrderSize}`,
            tradeBtnStatus: TradeBtnStatus.DISABLED,
          }
        } else if (!validAmt) {
          //!validAmt) {
          const sellSymbol = tradeData?.sell.belong

          if (sellMinAmt === undefined || !sellSymbol || sellMinAmt === 'NaN') {
            return {
              label: 'labelEnterAmount',
              tradeBtnStatus: TradeBtnStatus.DISABLED,
            }
          } else {
            const sellToken = tokenMap[sellSymbol]
            // //VolToNumberWithPrecision(sellMinAmt ?? '', sellSymbol as any)
            const minOrderSize = getValuePrecisionThousand(
              sdk.toBig(sellMinAmt ?? 0).div('1e' + sellToken.decimals),
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
    tokenMap,
    tradeCalcData?.isChecked,
    tradeCalcData?.isNotMatchMarketPrice,
    tradeData?.sell.belong,
    tradeData?.buy.belong,
    pageTradeLite,
    sellMinAmt,
    isMarketInit,
    isSwapLoading,
    storageId.orderId,
  ])
  /*** Btn related function ***/
  const swapFunc = React.useCallback(async () => {
    let { calcTradeParams, tradeChannel, orderType, maxFeeBips } = pageTradeLite
    if (
      !LoopringAPI.userAPI ||
      !tokenMap ||
      !exchangeInfo ||
      !calcTradeParams ||
      account.readyState !== AccountStatus.ACTIVATED
    ) {
      setToastOpen({
        open: true,
        type: ToastType.error,
        content: t('labelSwapFailed'),
      })
      setIsSwapLoading(false)

      return
    }
    const sell = tradeData?.sell.belong as string
    const buy = tradeData?.buy.belong as string
    const sellToken = tokenMap[sell]
    const buyToken = tokenMap[buy]
    try {
      const request: sdk.SubmitOrderRequestV3 = {
        exchange: exchangeInfo.exchangeAddress,
        accountId: account.accountId,
        storageId: storageId.orderId,
        sellToken: {
          tokenId: sellToken.tokenId,
          volume: calcTradeParams.amountS as string,
        },
        buyToken: {
          tokenId: buyToken.tokenId,
          volume: calcTradeParams.amountBOutSlip?.minReceived as string,
        },
        allOrNone: false,
        validUntil: getTimestampDaysLater(__DAYS__),
        // maxFeeBips: parseInt(totalFee as string),
        maxFeeBips: maxFeeBips ?? MAPFEEBIPS,
        fillAmountBOrS: false, // amm only false
        orderType,
        tradeChannel,
        eddsaSignature: '',
      }
      myLog('submitOrder request', request)
      const response: { hash: string } | any = await LoopringAPI.userAPI.submitOrder(
        request,
        account.eddsaKey.sk,
        account.apiKey,
      )
      if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
        const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
        if ((response as sdk.RESULT_INFO).code === 114002) {
          getAmount({ market })
          clearData(calcTradeParams)
        }
        setToastOpen({
          open: true,
          type: ToastType.error,
          content:
            t('labelSwapFailed') +
            ' error: ' +
            (errorItem
              ? t(errorItem.messageKey, { ns: 'error' })
              : (response as sdk.RESULT_INFO).message),
        })
      } else {
        getStorageId()
        await sdk.sleep(__TOAST_AUTO_CLOSE_TIMER__)
        const resp = await LoopringAPI.userAPI.getOrderDetails(
          {
            accountId: account.accountId,
            orderHash: response.hash,
          },
          account.apiKey,
        )
        myLog('hookSwap:-----> resp:', resp)
        if (resp.orderDetail?.status !== undefined) {
          myLog('hookSwap:resp.orderDetail:', resp.orderDetail)
          switch (resp.orderDetail?.status) {
            case sdk.OrderStatus.cancelled:
              const baseAmount = sdk.toBig(resp.orderDetail.volumes.baseAmount)
              const baseFilled = sdk.toBig(resp.orderDetail.volumes.baseFilled)
              const quoteAmount = sdk.toBig(resp.orderDetail.volumes.quoteAmount)
              const quoteFilled = sdk.toBig(resp.orderDetail.volumes.quoteFilled)
              const percentage1 = baseAmount.eq(BIGO) ? 0 : baseFilled.div(baseAmount).toNumber()
              const percentage2 = quoteAmount.eq(BIGO) ? 0 : quoteFilled.div(quoteAmount).toNumber()
              myLog('hookSwap:percentage1:', percentage1, ' percentage2:', percentage2)
              if (percentage1 === 0 || percentage2 === 0) {
                setToastOpen({
                  open: true,
                  type: ToastType.warning,
                  content: t('labelSwapCancelled'),
                })
              } else {
                setToastOpen({
                  open: true,
                  type: ToastType.success,
                  content: t('labelSwapSuccess'),
                })
              }
              break
            case sdk.OrderStatus.processed:
              setToastOpen({
                open: true,
                type: ToastType.success,
                content: t('labelSwapSuccess'),
              })
              break
            default:
              setToastOpen({
                open: true,
                type: ToastType.error,
                content: t('labelSwapFailed'),
              })
          }
        }
        walletLayer2Service.sendUserUpdate()
        clearData(calcTradeParams)
      }
    } catch (reason: any) {
      sdk.dumpError400(reason)
      setToastOpen({
        open: true,
        type: ToastType.error,
        content: t('labelSwapFailed'),
      })
    }
    await sdk.sleep(__SUBMIT_LOCK_TIMER__)
    setIsSwapLoading(false)
  }, [
    pageTradeLite,
    tokenMap,
    exchangeInfo,
    account.readyState,
    account.accountId,
    account.apiKey,
    account.eddsaKey.sk,
    tradeData?.sell?.belong,
    tradeData?.buy?.belong,
    __SUBMIT_LOCK_TIMER__,
    setToastOpen,
    t,
    __DAYS__,
    getAmount,
    market,
    __TOAST_AUTO_CLOSE_TIMER__,
    updatePageTradeLite,
  ])

  const { showAlert, confirmed, setShowWhich, setConfirmed } = useAlert()

  const doShowAlert = () => {
    const { priceLevel } = getPriceImpactInfo(pageTradeLite.calcTradeParams, account.readyState)
    myLog('hookSwap:---- swapCalculatorCallback priceLevel:', priceLevel)
    setConfirmed((state) => {
      if (isSmallOrder) {
        state[1] = false
      } else {
        state[1] = true
      }
      setShowWhich(() => {
        if (tradeCalcData?.isNotMatchMarketPrice) {
          return { isShow: true, step: 1, showWitch: ShowWitchAle3t1.AlertImpact }
        } else if (priceLevel === PriceLevel.Lv1 || priceLevel === PriceLevel.Lv2) {
          return { isShow: true, step: 1, showWitch: ShowWitchAle3t1.ConfirmImpact }
        } else if (isSmallOrder) {
          state[0] = true
          return { isShow: true, step: 2, showWitch: ShowWitchAle3t1.SmallPrice }
        } else if (showSwapSecondConfirmation) {
          return { isShow: true, step: 1, showWitch: ShowWitchAle3t1.SwapSecondConfirmation }
        } else {
          state[0] = true
          return { isShow: false, step: 2, showWitch: '' }
        }
      })
      return state
    })
  }
  React.useEffect(() => {
    if (confirmed[0] === true && confirmed[1] === true) {
      swapFunc()
      setConfirmed([false, false])
    }
  }, [confirmed[0], confirmed[1]])

  const swapCalculatorCallback = React.useCallback(async () => {
    setIsSwapLoading(true)
    if (!allowTrade.order.enable) {
      setShowSupport({ isShow: true })
      setIsSwapLoading(false)
    } else if (!order.enable) {
      setShowTradeIsFrozen({ isShow: true, type: 'Swap' })
      setIsSwapLoading(false)
    } else {
      doShowAlert()
    }
  }, [
    pageTradeLite.calcTradeParams,
    account.readyState,
    allowTrade.order.enable,
    order.enable,
    setShowSupport,
    setShowTradeIsFrozen,
    swapFunc,
    showSwapSecondConfirmation,
    isSmallOrder,
  ])
  const {
    btnStatus: swapBtnStatus,
    onBtnClick: onSwapClick,
    btnLabel: swapBtnI18nKey,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading: isSwapLoading || (isMarketInit ?? false),
    submitCallback: swapCalculatorCallback,
  })

  /*** Btn related end ***/
  const toPro = React.useCallback(() => {
    history.push({
      pathname: `${RouterPath.pro}/${market}`,
    })
  }, [market])

  const should15sRefresh = React.useCallback(() => {
    if (market) {
      // updateDepth()
      callPairDetailInfoAPIs()
      // marketTradeTableCallback();
    }
  }, [market])
  /*** table related end ***/
  const getStorageId = React.useCallback(async () => {
    if (
      tradeCalcData?.coinSell &&
      tokenMap &&
      tokenMap[tradeCalcData.coinSell] &&
      LoopringAPI.userAPI
    ) {
      // setStorageId({} as any)
      const storageId = await LoopringAPI.userAPI.getNextStorageId(
        {
          accountId: account.accountId,
          sellTokenId: tokenMap[tradeCalcData.coinSell].tokenId,
        },
        account.apiKey,
      )
      if ((storageId as sdk.RESULT_INFO).code) {
        setToastOpen({
          open: true,
          content: 'error: getStorageId',
          type: ToastType.error,
        })
      } else {
        setStorageId(storageId)
      }
    } else {
      setStorageId({} as any)
    }
  }, [tradeCalcData?.coinSell, account, tokenMap])
  React.useEffect(() => {
    if (accountStatus === SagaStatus.UNSET) {
      const account = store.getState().account
      // walletLayer2Callback()
      if (account.readyState === AccountStatus.ACTIVATED) {
        getAmount({ market })
      }
    }
  }, [accountStatus, market])
  React.useEffect(() => {
    if (accountStatus === SagaStatus.UNSET) {
      const account = store.getState().account
      if (account.readyState === AccountStatus.ACTIVATED && tradeCalcData?.coinSell) {
        getStorageId()
      }
    }
  }, [accountStatus, tradeCalcData?.coinSell])

  const walletLayer2Callback = React.useCallback(async () => {
    // let walletMap: WalletMap<any> | undefined = undefined
    if (account.readyState === AccountStatus.ACTIVATED) {
      refreshAmmPoolSnapshot()
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
      updatePageTradeLite({
        market: market as MarketType,
        feeBips: 0,
        totalFee: 0,
        takerRate: 0,
        calcTradeParams: {},
        priceImpactObj: undefined,
      })
      setTradeCalcData((state) => {
        return {
          ...state,
          walletMap: {},
          isShowBtradeAllow: false,
          minimumReceived: undefined,
          priceImpact: undefined,
          fee: undefined,
        }
      })
    }
  }, [tradeData, market, tradeCalcData, marketArray, ammMap, account.readyState])

  useSwapSocket()
  useWalletLayer2Socket({ walletLayer2Callback })

  /*** user Action function ***/
  //High: effect by wallet state update
  const handleSwapPanelEvent = async (
    swapData: SwapData<SwapTradeData<IBData<C>>>,
    swapType: any,
  ): Promise<void> => {
    const { tradeData: _tradeData } = swapData
    myLog('hookSwap: handleSwapPanelEvent', swapType, _tradeData)
    switch (swapType) {
      case SwapType.SEll_CLICK:
      case SwapType.BUY_CLICK:
        return
      case SwapType.SELL_SELECTED:
        myLog('hookSwap: handleSwapPanelEvent _tradeData', _tradeData)
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
        // throttleSetValue('sell', _tradeData)
        break
      case SwapType.BUY_SELECTED:
        //type = 'buy'
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
        const { close } = pageTradeLite
        let btos: string = '0'
        if (close) {
          // @ts-ignore
          const [, _coinA] = market.match(/(\w+)-(\w+)/i)
          btos = getValuePrecisionThousand(
            1 / Number(typeof close === 'number' ? close : close.replaceAll(sdk.SEP, '')),
            tokenMap[_coinA].precision,
            tokenMap[_coinA].precision,
            tokenMap[_coinA].precision,
            true,
          ) // .toFixed(tokenMap[idIndex[poolATokenVol.tokenId]].precision))
        }
        const _tradeCalcData: any = {
          ...tradeCalcData,
          coinSell: tradeCalcData.coinBuy,
          sellPrecision: tokenMap[tradeCalcData.coinBuy as string].precision,
          coinBuy: tradeCalcData.coinSell,
          buyPrecision: tokenMap[tradeCalcData.coinSell as string].precision,
          sellCoinInfoMap: tradeCalcData.buyCoinInfoMap,
          buyCoinInfoMap: tradeCalcData.sellCoinInfoMap,
          StoB: market === `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}` ? close : btos,
          BtoS: market === `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}` ? btos : close,
          isShowBtradeAllow: false,
          priceImpact: undefined,
          priceImpactColor: 'inherit',
          minimumReceived: undefined,
          fee: undefined,
          feeTakerRate: undefined,
          tradeCost: undefined,
          isNotMatchMarketPrice: undefined,
          marketPrice: undefined,
          marketRatePrice: undefined,
          isChecked: undefined,
        }

        myLog('hookSwap:Exchange,tradeCalcData,_tradeCalcData', tradeCalcData, _tradeCalcData)
        callPairDetailInfoAPIs()
        updatePageTradeLite({
          market,
          tradePair: `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}`,
          calcTradeParams: {
            ...pageTradeLite.calcTradeParams,
            isReverse: !pageTradeLite.calcTradeParams,
            amountS: undefined,
            output: undefined,
          },
        })
        setSellMinAmt(undefined)
        setTradeCalcData(_tradeCalcData)
        setTradeData((state) => {
          const walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap
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
          } as T
        })

        break
      default:
        break
    }
  }

  React.useEffect(() => {
    myLog(
      'hookSwap: pageTradeLite.deep amountStatus storageId',
      storageId,
      amountStatus,
      pageTradeLite?.depth?.symbol,
      market,
    )
    if (
      amountStatus == SagaStatus.UNSET &&
      pageTradeLite.depth &&
      pageTradeLite.depth.symbol === market
    ) {
      refreshAmmPoolSnapshot()
      setIsMarketStatus((state) => {
        return {
          ...state,
          isMarketInit: false,
        }
      })
    }
  }, [
    pageTradeLite.depth,
    tradeCalcData.coinBuy,
    account.readyState,
    storageId,
    amountStatus,
    market,
  ])

  React.useEffect(() => {
    if (market) {
      //@ts-ignore
      if (refreshRef.current) {
        myLog('hookSwap: pageTradeLite, click', market)
        // @ts-ignore
        refreshRef.current.firstElementChild.click()
        should15sRefresh()
      }
    }
  }, [market])
  const refreshAmmPoolSnapshot = React.useCallback(() => {
    const { ticker, ammPoolSnapshot, depth, lastStepAt, tradePair, market } = pageTradeLite
    if (
      tradeData &&
      lastStepAt &&
      tradeCalcData.coinSell === tradeData['sell'].belong &&
      tradeCalcData.coinBuy === tradeData['buy'].belong &&
      tradeData[lastStepAt].tradeValue &&
      tradeData[lastStepAt].tradeValue !== 0
    ) {
      reCalculateDataWhenValueChange(tradeData, tradePair, lastStepAt)
    } else if (
      tradeCalcData.coinSell &&
      tradeCalcData.coinBuy &&
      (`${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}` === market ||
        `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}` === market)
    ) {
      const walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap
      let { stob, btos, close } = calcPriceByAmmTickMapDepth({
        market: market as any,
        tradePair: `${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}`,
        dependencyData: { ticker, ammPoolSnapshot, depth },
        noGetValuePrecisionThousand: true
      })
      const result = reCalcStoB({
        market,
        tradeData: tradeData as SwapTradeData<IBData<unknown>>,
        tradePair: tradePair as any,
        noGetValuePrecisionThousand: true
      })
      const reserveInfo = sdk.getReserveInfo(tradeCalcData.coinSell as string, tradeCalcData.coinBuy as string, marketArray, tokenMap, marketMap)
      setTradeCalcData((state) => {
        return { 
          ...state, 
          walletMap,
          StoB: getValuePrecisionThousand(
            result ? result.stob : stob,
            undefined,
            reserveInfo?.isReverse ? 6 : marketMap[market].precisionForPrice,
            reserveInfo?.isReverse ? 6 : marketMap[market].precisionForPrice,
            true
          ),
          BtoS: getValuePrecisionThousand(
            result ? result.btos : btos,
            undefined,
            !reserveInfo?.isReverse ? 6 : marketMap[market].precisionForPrice,
            !reserveInfo?.isReverse ? 6 : marketMap[market].precisionForPrice,
            true,
          ),
        }
      })
      setTradeData({
        ...tradeData,
        sell: {
          ...tradeData?.sell,
          belong: tradeCalcData.coinSell,
          balance: walletMap ? walletMap[tradeCalcData.coinSell as string]?.count : 0,
        },
        buy: {
          ...tradeData?.buy,
          belong: tradeCalcData.coinBuy,
        },
      } as T)
      // } as T)

      updatePageTradeLite({ market, close })
    }
  }, [market, pageTradeLite, tradeData, tradeCalcData, setTradeCalcData])

  const callPairDetailInfoAPIs = React.useCallback(async () => {
    if (market && ammMap && LoopringAPI.exchangeAPI) {
      try {
        const { depth, ammPoolSnapshot } = await swapDependAsync(market)
        if (depth) {
          const { tickerMap } = store.getState().tickerMap
          myLog('hookSwap: pageTradeLite', 'depth')
          updatePageTradeLite({
            market,
            depth,
            ammPoolSnapshot,
            ticker: tickerMap[market],
          })
        }
      } catch (error: any) {
        myLog('hookSwap: error:', error, 'go to LRC-ETH')
        setToastOpen({
          open: true,
          content: 'error: resetMarket',
          type: ToastType.error,
        })
      }
    }
  }, [market, ammMap, tickerMap])
  const reCalculateDataWhenValueChange = React.useCallback(
    (_tradeData, _tradePair?, type?) => {
      const walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap
      const { ammPoolSnapshot, depth, tradePair, close } =
        store.getState()._router_pageTradeLite.pageTradeLite
      const { amountMap } = store.getState().amountMap
      let calcForMinAmt, calcForMinCost, calcForPriceImpact
      myLog('hookSwap:reCalculateDataWhenValueChange', tradeData, _tradePair, type)
      if (depth && market && _tradePair && isTradePairMarket(_tradePair, market) && _tradeData) {
        const coinA = _tradeData.sell.belong
        const coinB = _tradeData.buy.belong
        _tradeData.sell.balance = walletMap ? walletMap[coinA]?.count : 0

        const sellToken = tokenMap[coinA as string]
        const buyToken = tokenMap[coinB as string]

        const isAtoB = type === 'sell'

        let input: any = isAtoB ? _tradeData.sell.tradeValue : _tradeData.buy.tradeValue
        input = input === undefined || isNaN(Number(input)) ? 0 : Number(input)
        let slippage = sdk
          .toBig(
            _tradeData.slippage && !isNaN(_tradeData.slippage)
              ? _tradeData.slippage
              : defaultSlipage,
          )
          .times(100)
          .toString()
        let totalFee: any = undefined
        let feeTakerRate: any = undefined
        let feeBips: any = undefined
        let takerRate: any = undefined
        let buyMinAmtInfo: any = undefined
        let sellMinAmtInfo: any = undefined
        let tradeCost: any = undefined
        let basePrice: any = undefined
        let tradePrice: any = undefined
        let maxFeeBips: any = MAPFEEBIPS

        if (amountMap && amountMap[market as string] && ammMap) {
          myLog(`hookSwap: amountMap[${market}]:`, amountMap[market as string])

          const ammMarket = `AMM-${market}`
          // const amount = ammMap[ammMarket]
          //   ? amountMap[ammMarket]
          //   : amountMap[market as string];
          const amountMarket = amountMap[market as string]

          buyMinAmtInfo = amountMarket[_tradeData['buy'].belong as string]
          sellMinAmtInfo = amountMarket[_tradeData['sell'].belong as string]
          // myLog(`buyMinAmtInfo,sellMinAmtInfo: AMM-${market}, ${_tradeData[ 'buy' ].belong}`, buyMinAmtInfo, sellMinAmtInfo)

          takerRate = buyMinAmtInfo ? buyMinAmtInfo.userOrderInfo.takerRate : 0
          feeBips = ammMap[ammMarket] ? ammMap[ammMarket].__rawConfig__.feeBips : DefaultFeeBips

          feeTakerRate =
            amountMarket[_tradeData['buy'].belong as string] &&
            amountMarket[_tradeData['buy'].belong as string].userOrderInfo.takerRate
          tradeCost = amountMarket[_tradeData['buy'].belong as string].tradeCost

          const minAmountInput = BigNumber.max(
            buyMinAmtInfo.userOrderInfo.minAmount,
            tokenMap[buyToken.symbol].orderAmounts.dust,
          )
            .div(sdk.toBig(1).minus(sdk.toBig(slippage).div(10000)))
            .div('1e' + buyToken.decimals)
            .toString()

          calcForMinAmt = sdk.getOutputAmount({
            input: minAmountInput,
            sell: coinA,
            buy: coinB,
            isAtoB: false,
            marketArr: marketArray as string[],
            tokenMap: tokenMap as any,
            marketMap: marketMap as any,
            depth,
            ammPoolSnapshot: ammPoolSnapshot,
            feeBips: feeBips ? feeBips.toString() : DefaultFeeBips,
            takerRate: '0',
            slipBips: slippage,
          })

          myLog(
            'hookSwap:buyMinAmtInfo.userOrderInfo.minAmount:',
            buyMinAmtInfo.userOrderInfo.minAmount,
            `buyMinAmtInfo.userOrderInfo.minAmount, with slippage:${slippage}`,
            sdk
              .toBig(buyMinAmtInfo.userOrderInfo.minAmount)
              .div(sdk.toBig(1).minus(sdk.toBig(slippage).div(10000)))
              .toString(),
          )

          /*** calc for Price Impact ****/
          const sellMinAmtInput = sdk
            .toBig(sellMinAmtInfo.baseOrderInfo.minAmount)
            .div('1e' + sellToken.decimals)
            .toString()

          calcForPriceImpact = sdk.getOutputAmount({
            input: sellMinAmtInput,
            sell: coinA,
            buy: coinB,
            isAtoB: true,
            marketArr: marketArray as string[],
            tokenMap: tokenMap as any,
            marketMap: marketMap as any,
            depth,
            ammPoolSnapshot: ammPoolSnapshot,
            feeBips: feeBips ? feeBips.toString() : DefaultFeeBips,
            takerRate: '0',
            slipBips: '10',
          })

          basePrice = sdk.toBig(calcForPriceImpact?.output).div(sellMinAmtInput)

          myLog(
            'hookSwap:calcForPriceImpact input: ',
            sellMinAmtInput,
            ', output: ',
            sdk.toBig(calcForPriceImpact?.output).div(sellMinAmtInput).toNumber(),
            ', calcForPriceImpact:',
            calcForPriceImpact?.amountBOutSlip?.minReceivedVal,
            ', calcForPriceImpact basePrice: ',
            basePrice.toNumber(),
          )

          /**** calc for min Cost ****/
          const dustToken = buyToken
          let calcForMinCostInput = BigNumber.max(
            sdk.toBig(tradeCost).times(2),
            sdk.toBig(dustToken.orderAmounts.dust),
          )

          const tradeCostInput = calcForMinCostInput
            .div(sdk.toBig(1).minus(sdk.toBig(slippage).div(10000)))
            .div('1e' + dustToken.decimals)
            .toString()

          myLog(
            'hookSwap:tradeCost*2:',
            sdk.toBig(tradeCost).times(2).toString(),
            'buyToken.orderAmounts.dust',
            buyToken.orderAmounts.dust,
            'calcForMinCostInput',
            calcForMinCostInput.toString(),
            `calcForMinCostInput, with slippage:${slippage}`,
            calcForMinCostInput.div(sdk.toBig(1).minus(sdk.toBig(slippage).div(10000))).toString(),
            'calcForMinCost, Input',
            tradeCostInput,
          )

          calcForMinCost = sdk.getOutputAmount({
            input: tradeCostInput,
            sell: coinA,
            buy: coinB,
            isAtoB: false,
            marketArr: marketArray as string[],
            tokenMap: tokenMap as any,
            marketMap: marketMap as any,
            depth,
            ammPoolSnapshot: ammPoolSnapshot,
            feeBips: feeBips ? feeBips.toString() : DefaultFeeBips,
            takerRate: '0',
            slipBips: slippage,
          })
          const minAmt = BigNumber.max(
            sellToken.orderAmounts.dust,
            calcForMinCost?.amountS ?? 0,
          ).times(1.1)
          setSellMinAmt(minAmt.toString())
          myLog(
            `hookSwap:calcForMinAmt.amountS`,
            sdk
              .toBig(calcForMinAmt?.amountS ?? 0)
              .div('1e' + tokenMap[_tradeData['sell'].belong as string].decimals)
              .toString(),
            'calcForMinCost.amountS',
            sdk
              .toBig(calcForMinCost?.amountS ?? 0)
              .div('1e' + tokenMap[_tradeData['sell'].belong as string].decimals)
              .toString(),
          )
        }
        const calcTradeParams = sdk.getOutputAmount({
          input: input.toString(),
          sell: coinA,
          buy: coinB,
          isAtoB,
          marketArr: marketArray as string[],
          tokenMap: tokenMap as any,
          marketMap: marketMap as any,
          depth,
          ammPoolSnapshot: ammPoolSnapshot,
          feeBips: feeBips ? feeBips.toString() : DefaultFeeBips,
          takerRate: '0',
          slipBips: slippage,
        })

        const minSymbol = _tradeData.buy.belong
        tradePrice = sdk
          .toBig(calcTradeParams?.amountBOutSlip?.minReceivedVal ?? 0)
          .div(isAtoB ? input.toString() : calcTradeParams?.output)
        const priceImpact = sdk
          .toBig(1)
          .minus(sdk.toBig(tradePrice).div(basePrice ?? 1))
          .minus(0.001)
        if (calcTradeParams && priceImpact.gte(0)) {
          calcTradeParams.priceImpact = priceImpact.toFixed(4, 1)
        } else {
          calcTradeParams && (calcTradeParams.priceImpact = '0')
        }

        if (
          tradeCost &&
          calcTradeParams &&
          calcTradeParams.amountBOutSlip?.minReceived &&
          feeTakerRate
        ) {
          let value = sdk
            .toBig(calcTradeParams.amountBOutSlip?.minReceived)
            .times(feeTakerRate)
            .div(10000)

          myLog(
            'hookSwap:input Accounts',
            calcTradeParams?.amountS,
            '100 U calcForMinAmt:',
            calcForMinAmt?.amountS,
          )

          let validAmt = !!(
            calcTradeParams?.amountS &&
            calcForMinAmt?.amountS &&
            sdk.toBig(calcTradeParams?.amountS).gte(calcForMinAmt.amountS)
          )
          let totalFeeRaw

          myLog(
            `hookSwap:${minSymbol} tradeCost:`,
            tradeCost,
            'useTakeRate Fee:',
            value.toString(),
            'calcForMinAmt?.amountS:',
            calcForMinAmt?.amountS,
            `is setup minTrade amount, ${calcForMinAmt?.amountS}:`,
            validAmt,
          )

          if (!validAmt) {
            if (sdk.toBig(tradeCost).gte(value)) {
              totalFeeRaw = sdk.toBig(tradeCost)
            } else {
              totalFeeRaw = value
            }
            myLog(
              'hookSwap:maxFeeBips update for tradeCost before value:',
              maxFeeBips,
              'totalFeeRaw',
              totalFeeRaw.toString(),
            )
            maxFeeBips = Math.ceil(
              totalFeeRaw.times(10000).div(calcTradeParams.amountBOutSlip?.minReceived).toNumber(),
            )
            myLog('hookSwap:maxFeeBips update for tradeCost after value:', maxFeeBips)
          } else {
            totalFeeRaw = sdk.toBig(value)
          }

          totalFee = getValuePrecisionThousand(
            totalFeeRaw.div('1e' + tokenMap[minSymbol].decimals).toString(),
            tokenMap[minSymbol].precision,
            tokenMap[minSymbol].precision,
            tokenMap[minSymbol].precision,
            false,
            { floor: true },
          )
          tradeCost = getValuePrecisionThousand(
            sdk
              .toBig(tradeCost)
              .div('1e' + tokenMap[minSymbol].decimals)
              .toString(),
            tokenMap[minSymbol].precision,
            tokenMap[minSymbol].precision,
            tokenMap[minSymbol].precision,
            false,
            { floor: true },
          )

          myLog('hookSwap:totalFee view value:', totalFee, tradeCost)
        }

        const minimumReceived = getValuePrecisionThousand(
          sdk
            .toBig(calcTradeParams?.amountBOutSlip?.minReceivedVal ?? 0)
            .minus(totalFee)
            .toString(),
          tokenMap[minSymbol].precision,
          tokenMap[minSymbol].precision,
          tokenMap[minSymbol].precision,
          false,
          { floor: true },
        )
        const minimumConverted = calcTradeParams?.amountBOut
          ? getValuePrecisionThousand(
              sdk
                .toBig(calcTradeParams.amountBOut)
                .times(sdk.toBig(1).minus(sdk.toBig(slippage).div('10000')))
                .div('1e' + tokenMap[minSymbol].decimals)
                .toString(),
              tokenMap[minSymbol].precision,
              tokenMap[minSymbol].precision,
              tokenMap[minSymbol].precision,
              false,
              { floor: true },
            )
          : undefined

        const priceImpactObj = getPriceImpactInfo(calcTradeParams, account.readyState)
        let _tradeCalcData: CAD & { [key: string]: any } = {
          priceImpact: priceImpactObj.value.toString(),
          priceImpactColor: priceImpactObj.priceImpactColor,
          minimumReceived: !minimumReceived?.toString().startsWith('-')
            ? minimumReceived
            : undefined,
          fee: totalFee,
          feeTakerRate,
          tradeCost,
          minimumConverted,
        } as CAD
        _tradeData[isAtoB ? 'buy' : 'sell'].tradeValue = getShowStr(calcTradeParams?.output)

        const result = reCalcStoB({
          market,
          tradeData: _tradeData as SwapTradeData<IBData<unknown>>,
          tradePair: tradePair as any,
        })
        if (result && result.stob && sdk.toBig(result.stob?.replaceAll(sdk.SEP, '')).gt(0)) {
          _tradeCalcData.StoB = result.stob
          _tradeCalcData.BtoS = result.btos
        } else {
          if (close) {
            // @ts-ignore
            const [, _coinA] = market.match(/(\w+)-(\w+)/i)
            let _btos = getValuePrecisionThousand(
              1 / Number(close.replaceAll(sdk.SEP, '')),
              tokenMap[_coinA].precision,
              tokenMap[_coinA].precision,
              tokenMap[_coinA].precision,
              true,
            ) // .toFixed(tokenMap[idIndex[poolATokenVol.tokenId]].precision))

            if (market === tradePair) {
              _tradeCalcData.StoB = close
              _tradeCalcData.BtoS = _btos
            } else {
              _tradeCalcData.StoB = _btos
              _tradeCalcData.BtoS = close
            }
          }
        }
        if (tokenPrices) {
          const marketPrice = sdk
            .toBig(tokenPrices[_tradeData.sell.belong])
            .div(tokenPrices[_tradeData.buy.belong])
          const marketRatePrice = marketPrice.div(_tradeCalcData.StoB?.replaceAll(sdk.SEP, '') ?? 1)
          const isNotMatchMarketPrice = marketRatePrice.gt(1.05)
          _tradeCalcData.isNotMatchMarketPrice = isNotMatchMarketPrice
          _tradeCalcData.marketPrice = getValuePrecisionThousand(
            marketPrice.toString(),
            tokenMap[_tradeData.buy.belong].precision,
            tokenMap[_tradeData.buy.belong].precision,
            undefined,
          )

          _tradeCalcData.marketRatePrice = marketRatePrice.minus(1).times(100).toFixed(2)
          myLog(
            'hookSwap: stob',
            _tradeCalcData.StoB,
            marketPrice.toString(),
            'marketPriceRate',
            _tradeCalcData.marketRatePrice,
            isNotMatchMarketPrice,
          )
        }
        let isShowBtradeAllow = false
        if (
          priceImpactObj.value &&
          priceImpactObj.value > 1 &&
          bTradeMarketArray &&
          (bTradeMarketArray.includes(_tradeData.buy.belong + '-' + _tradeData.sell.belong) ||
            bTradeMarketArray.includes(_tradeData.sell.belong + '-' + _tradeData.buy.belong))
        ) {
          isShowBtradeAllow = true
        }

        updatePageTradeLite({
          market,
          calcTradeParams: {
            ...calcTradeParams,
            feeBips: feeBips ? feeBips : DefaultFeeBips,
            takerRate: takerRate ? takerRate : 0,
          } as any,
          priceImpactObj,
          lastStepAt: type,
          feeBips,
          takerRate,
          sellMinAmtInfo: sellMinAmtInfo as any,
          buyMinAmtInfo: buyMinAmtInfo as any,
          totalFee,
          maxFeeBips,
          feeTakerRate,
          tradeCost,
        })
        //setOutput(calcTradeParams)
        if (account.readyState !== AccountStatus.ACTIVATED) {
          // @ts-ignore
          _tradeCalcData.priceImpact = undefined
          _tradeCalcData.minimumReceived = undefined
        }
        if (_tradeData?.isChecked !== undefined) {
          myLog('hookSwap: tradeCalcData?.isChecked', _tradeData)
          _tradeCalcData.isChecked = _tradeData.isChecked
        }
        setTradeCalcData((state) => ({
          ...state,
          ..._tradeCalcData,
          isShowBtradeAllow,
          lastStepAt: type,
          walletMap,
        }))
        setTradeData((state) => ({
          ...state,
          ..._tradeData,
        }))
      }
    },
    [
      account.readyState,
      amountMap,
      pageTradeLite,
      tradeCalcData,
      tradeData,
      coinMap,
      tokenMap,
      marketMap,
      marketArray,
      bTradeMarketArray,
    ],
  )

  return {
    tradeCalcData,
    tradeData,
    handleSwapPanelEvent,
    onSwapClick,
    swapBtnI18nKey,
    swapBtnStatus,
    toastOpen,
    closeToast,
    should15sRefresh,
    market,
    refreshRef,
    isSwapLoading,
    toPro,
    isMarketInit,
    isMobile,
    setToastOpen,
    showAlert,
    pageTradeLite,
    // setShowWhich,
    // setConfirmed,
    handleClose: () => {
      setShowWhich((state) => ({ ...state, isShow: false }))
      setConfirmed([false, false])
      setIsSwapLoading(false)
    },
    handleConfirm: () => {
      if (showAlert.step == 1 && confirmed[1] == false) {
        setShowWhich(() => ({ step: 2, showWitch: ShowWitchAle3t1.SmallPrice, isShow: true }))
      } else {
        setShowWhich((state) => ({ ...state, isShow: false }))
      }
      setConfirmed((state) => {
        state[showAlert.step - 1] = true
        return state
      })
    },
    priceLevel: getPriceImpactInfo(pageTradeLite.calcTradeParams, account.readyState),
  }
}

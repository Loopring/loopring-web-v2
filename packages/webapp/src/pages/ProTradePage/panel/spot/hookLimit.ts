import React from 'react'
import {
  BIGO,
  getPriceImpactInfo,
  LoopringAPI,
  PriceLevel, ShowWitchAle3t1,
  store,
  useAccount, useAlert,
  usePageTradePro,
  usePlaceOrder,
  useSubmitBtn,
  useSystem,
  useToast,
  useTokenMap,
  useTokenPrices,
  walletLayer2Service,
} from '@loopring-web/core'
import {
  AccountStatus,
  getValuePrecisionThousand,
  IBData,
  MarketType,
  myLog,
  TradeBaseType,
  TradeBtnStatus,
  TradeProType,
} from '@loopring-web/common-resources'
import {
  DepthType,
  LimitTradeData,
  ToastType,
  useOpenModals,
  useSettings,
  useToggle,
} from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import * as sdk from '@loopring-web/loopring-sdk'
import * as _ from 'lodash'
import BigNumber from 'bignumber.js'

export const useLimit = <C extends { [key: string]: any }>({
  market,
}: { market: MarketType } & any) => {
  const {
    pageTradePro,
    updatePageTradePro,
    // __DAYS__,
    __SUBMIT_LOCK_TIMER__,
    // __TOAST_AUTO_CLOSE_TIMER__
  } = usePageTradePro()
  const { marketMap, tokenMap } = useTokenMap()
  const { tokenPrices } = useTokenPrices()
  const { forexMap, allowTrade } = useSystem()
  const { account } = useAccount()
  const { setShowSupport, setShowTradeIsFrozen } = useOpenModals()
  const {
    toggle: { order },
  } = useToggle()
  const { currency, isMobile } = useSettings()

  const { t } = useTranslation('common')

  // const [alertOpen, setAlertOpen] = React.useState<boolean>(false)
  // @ts-ignore
  const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i)
  // const [isMarketLoading, setIsMarketLoading] = React.useState(false)

  const walletMap = pageTradePro.tradeCalcProData.walletMap ?? {}
  const marketPrecision = marketMap[market].precisionForPrice
  const tradePrice =
    pageTradePro.market === market && pageTradePro.ticker
      ? pageTradePro.ticker.close
        ? pageTradePro.ticker.close.toFixed(marketPrecision)
        : pageTradePro?.depth?.mid_price.toFixed(marketPrecision)
      : 0
  let balance =
    tradePrice &&
    tokenPrices &&
    forexMap &&
    Number(tradePrice) * tokenPrices[quoteSymbol as string] * (forexMap[currency] ?? 0)

  const [limitTradeData, setLimitTradeData] = React.useState<LimitTradeData<IBData<any>>>({
    base: {
      belong: baseSymbol,
      balance: walletMap ? walletMap[baseSymbol as string]?.count : 0,
    } as IBData<any>,
    quote: {
      belong: quoteSymbol,
      balance: walletMap ? walletMap[quoteSymbol as string]?.count : 0,
    } as IBData<any>,
    price: {
      belong: pageTradePro.tradeCalcProData.coinQuote,
      tradeValue: tradePrice,
      balance,
    } as IBData<any>,
    type: pageTradePro.tradeType ?? TradeProType.buy,
    isChecked: undefined,
  })
  const [isLimitLoading, setIsLimitLoading] = React.useState(false)

  const { toastOpen, setToastOpen, closeToast } = useToast()

  React.useEffect(() => {
    resetTradeData()
  }, [pageTradePro.tradeCalcProData.walletMap, pageTradePro.market, currency])

  React.useEffect(() => {
    if (pageTradePro.chooseDepth) {
      const {
        system: { forexMap },
        settings: { currency },
      } = store.getState()
      //@ts-ignore
      const [, baseSymbol, quoteSymbol] = pageTradePro.market.match(/(\w+)-(\w+)/i)
      const { decimals: baseDecimal, precision: basePrecision } = tokenMap[baseSymbol]
      const tradePrice = pageTradePro.chooseDepth
        ? pageTradePro.chooseDepth.price
        : pageTradePro.market === market && pageTradePro.ticker
        ? pageTradePro.ticker.close
          ? pageTradePro.ticker.close.toFixed(marketPrecision)
          : pageTradePro?.depth?.mid_price.toFixed(marketPrecision)
        : 0
      let balance =
        tradePrice &&
        tokenPrices &&
        forexMap &&
        Number(tradePrice) * tokenPrices[quoteSymbol as string] * (forexMap[currency] ?? 0)

      if (
        (pageTradePro.tradeType === TradeProType.buy &&
          pageTradePro.chooseDepth.type === DepthType.ask) ||
        (pageTradePro.tradeType === TradeProType.sell &&
          pageTradePro.chooseDepth.type === DepthType.bid)
      ) {
        const amount = getValuePrecisionThousand(
          sdk.toBig(pageTradePro.chooseDepth.amtTotal).div('1e' + baseDecimal),
          undefined,
          undefined,
          basePrecision,
          true,
        ).replaceAll(sdk.SEP, '')
        onChangeLimitEvent(
          {
            ...limitTradeData,
            base: {
              ...limitTradeData.base,
              tradeValue: Number(amount),
            },
            price: {
              ...limitTradeData.price,
              tradeValue: Number(tradePrice),
              balance: Number(balance) ?? 0,
            },
          },
          TradeBaseType.price,
        )
      } else {
        onChangeLimitEvent(
          {
            ...limitTradeData,
            price: {
              ...limitTradeData.price,
              tradeValue: Number(tradePrice),
              balance: getValuePrecisionThousand(balance, undefined, undefined, undefined, true, {
                isFait: true,
              }),
            },
          },
          TradeBaseType.price,
        )
      }

      // (tradeData: LimitTradeData<IBData<any>>, formType: TradeBaseType)
    }
  }, [pageTradePro.chooseDepth])

  const resetTradeData = React.useCallback(
    (type?: TradeProType) => {
      const pageTradePro = store.getState()._router_pageTradePro.pageTradePro
      const walletMap = pageTradePro.tradeCalcProData.walletMap ?? {}
      // @ts-ignore
      const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i)
      setLimitTradeData((state) => {
        const tradePrice =
          pageTradePro.market === market && pageTradePro.ticker
            ? pageTradePro.ticker.close
              ? pageTradePro.ticker.close.toFixed(marketPrecision)
              : pageTradePro?.depth?.mid_price.toFixed(marketPrecision)
            : 0
        let balance =
          tradePrice &&
          tokenPrices &&
          forexMap &&
          Number(tradePrice) * tokenPrices[quoteSymbol as string] * (forexMap[currency] ?? 0)

        return {
          ...state,
          type: type ?? pageTradePro.tradeType,
          base: {
            belong: baseSymbol,
            balance: walletMap ? walletMap[baseSymbol as string]?.count : 0,
          } as IBData<any>,
          quote: {
            belong: quoteSymbol,
            balance: walletMap ? walletMap[quoteSymbol as string]?.count : 0,
          } as IBData<any>,
          price: {
            belong: quoteSymbol,
            tradeValue: tradePrice,
            balance,
          } as IBData<any>,
        }
      })
      updatePageTradePro({
        market,
        tradeType: type ?? pageTradePro.tradeType,
        minOrderInfo: null,
        sellUserOrderInfo: null,
        buyUserOrderInfo: null,
        request: null,
        calcTradeParams: null,
        limitCalcTradeParams: null,
        chooseDepth: null,
        tradeCalcProData: {
          ...pageTradePro.tradeCalcProData,
          // walletMap:walletMap as any,
          fee: undefined,
          minimumReceived: undefined,
          priceImpact: undefined,
          priceImpactColor: 'inherit',
          isNotMatchMarketPrice: false,
          marketPrice: undefined,
          marketRatePrice: undefined,
          isChecked: undefined,
        },
      })
    },
    [market, updatePageTradePro, marketPrecision, tokenPrices, forexMap, currency],
  )

  const limitSubmit = React.useCallback(
    async (event: MouseEvent, isAgree?: boolean) => {
      myLog('limitSubmit:', event, isAgree)

      const pageTradePro = store.getState()._router_pageTradePro.pageTradePro
      const { limitCalcTradeParams, request, tradeCalcProData } = pageTradePro

      // setAlertOpen(false)

      if (isAgree && LoopringAPI.userAPI && request) {
        try {
          myLog('try to submit order', limitCalcTradeParams, tradeCalcProData)

          const account = store.getState().account

          const req: sdk.GetNextStorageIdRequest = {
            accountId: account.accountId,
            sellTokenId: request.sellToken.tokenId as number,
          }

          const storageId = await LoopringAPI.userAPI.getNextStorageId(req, account.apiKey)

          const requestClone = _.cloneDeep(request)
          requestClone.storageId = storageId.orderId

          myLog(requestClone)

          const response: { hash: string } | any = await LoopringAPI.userAPI.submitOrder(
            requestClone,
            account.eddsaKey.sk,
            account.apiKey,
          )

          myLog(response)
          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            setToastOpen({
              open: true,
              type: ToastType.error,
              content: t('labelLimitFailed') + ' : ' + response.message,
            })
          } else {
            await sdk.sleep(__SUBMIT_LOCK_TIMER__)

            const resp = await LoopringAPI.userAPI.getOrderDetails(
              {
                accountId: account.accountId,
                orderHash: response?.hash,
              },
              account.apiKey,
            )

            myLog('-----> resp:', resp)

            if (resp.orderDetail?.status !== undefined) {
              myLog('resp.orderDetail:', resp.orderDetail)
              switch (resp.orderDetail?.status) {
                case sdk.OrderStatus.cancelled:
                  const baseAmount = sdk.toBig(resp.orderDetail.volumes.baseAmount)
                  const baseFilled = sdk.toBig(resp.orderDetail.volumes.baseFilled)
                  const quoteAmount = sdk.toBig(resp.orderDetail.volumes.quoteAmount)
                  const quoteFilled = sdk.toBig(resp.orderDetail.volumes.quoteFilled)
                  const percentage1 = baseAmount.eq(BIGO)
                    ? 0
                    : baseFilled.div(baseAmount).toNumber()
                  const percentage2 = quoteAmount.eq(BIGO)
                    ? 0
                    : quoteFilled.div(quoteAmount).toNumber()
                  myLog('percentage1:', percentage1, ' percentage2:', percentage2)
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
                case sdk.OrderStatus.processing:
                  setToastOpen({
                    open: true,
                    type: ToastType.success,
                    content: t('labelOrderProcessing'),
                  })
                  break
                default:
                  setToastOpen({
                    open: true,
                    type: ToastType.error,
                    content: t('labelLimitFailed'),
                  })
              }
            }
            resetTradeData(pageTradePro.tradeType)
            walletLayer2Service.sendUserUpdate()
          }

          setIsLimitLoading(false)
        } catch (reason: any) {
          sdk.dumpError400(reason)
          setToastOpen({
            open: true,
            type: ToastType.error,
            content: t('labelLimitFailed'),
          })
        }
        setIsLimitLoading(false)
      } else {
        setIsLimitLoading(false)
      }
    },
    [__SUBMIT_LOCK_TIMER__, resetTradeData, setToastOpen, t],
  )

  const { makeLimitReqInHook } = usePlaceOrder()
  const onChangeLimitEvent = React.useCallback(
    (tradeData: LimitTradeData<IBData<any>>, formType: TradeBaseType) => {
      const pageTradePro = store.getState()._router_pageTradePro.pageTradePro

      if (formType === TradeBaseType.tab) {
        resetTradeData(tradeData.type)
      } else {
        let amountBase = formType === TradeBaseType.base ? tradeData.base.tradeValue : undefined
        let amountQuote = formType === TradeBaseType.quote ? tradeData.quote.tradeValue : undefined
        let dustCalcTradeParams: any

        if (formType === TradeBaseType.price || formType === TradeBaseType.checkMarketPrice) {
          amountBase =
            tradeData.base.tradeValue !== undefined ? tradeData.base.tradeValue : undefined
          amountQuote =
            amountBase !== undefined
              ? undefined
              : tradeData.quote.tradeValue !== undefined
              ? tradeData.quote.tradeValue
              : undefined
        }

        // myLog(`tradeData price:${tradeData.price.tradeValue}`, tradeData.type, amountBase, amountQuote)

        const { limitRequest, calcTradeParams, sellUserOrderInfo, buyUserOrderInfo, minOrderInfo } =
          makeLimitReqInHook({
            isBuy: tradeData.type === 'buy',
            base: tradeData.base.belong,
            quote: tradeData.quote.belong,
            price: tradeData.price.tradeValue as number,
            depth: pageTradePro.depthForCalc,
            amountBase,
            amountQuote,
          })

        let isNotMatchMarketPrice, marketPrice, marketRatePrice
        if (
          tokenPrices &&
          tradeData?.price?.tradeValue &&
          // @ts-ignore
          sdk.toBig(tradeData.price.tradeValue).gt(0)
        ) {
          marketPrice = sdk
            .toBig(tokenPrices[tradeData.base.belong])
            .div(tokenPrices[tradeData.quote.belong])
          marketRatePrice =
            tradeData.type === 'sell'
              ? marketPrice.div(tradeData?.price?.tradeValue)
              : sdk
                  .toBig(1)
                  .div(marketPrice)
                  .div(1 / tradeData?.price?.tradeValue)

          isNotMatchMarketPrice = marketRatePrice.gt(1.05)
          marketPrice = getValuePrecisionThousand(
            marketPrice.toString(),
            tokenMap[tradeData.quote.belong].precision,
            tokenMap[tradeData.quote.belong].precision,
            tokenMap[tradeData.quote.belong].precision,
          )
          marketRatePrice = marketRatePrice.minus(1).times(100).toFixed(2)
          dustCalcTradeParams = makeLimitReqInHook({
            isBuy: tradeData.type === 'buy',
            base: tradeData.base.belong,
            quote: tradeData.quote.belong,
            price: tradeData.price.tradeValue as number,
            depth: pageTradePro.depthForCalc,
            // @ts-ignore
            amountBase:
              tradeData.type === 'buy'
                ? undefined
                : sdk
                    .toBig(tokenMap[baseSymbol]?.orderAmounts.dust)
                    .div('1e' + tokenMap[tradeData.base.belong].decimals)
                    .toString(),
            // @ts-ignore
            amountQuote:
              tradeData.type === 'buy'
                ? sdk
                    .toBig(tokenMap[quoteSymbol]?.orderAmounts.dust)
                    .div('1e' + tokenMap[tradeData.quote.belong].decimals)
                    .toString()
                : undefined,
          }).calcTradeParams
        }
        const minAmount = BigNumber.max(
          minOrderInfo?.minAmount ?? 0,
          dustCalcTradeParams?.baseVol ?? 0,
        ).toString()
        const minAmtShow = sdk
          .toBig(minAmount)
          .div('1e' + tokenMap[minOrderInfo?.symbol ?? baseSymbol].decimals)
          .toNumber()
        updatePageTradePro({
          market,
          sellUserOrderInfo,
          buyUserOrderInfo,
          minOrderInfo: {
            ...minOrderInfo,
            minAmount,
            minAmtShow,
            minAmtCheck: sdk.toBig(calcTradeParams?.baseVol ?? 0).gte(minAmount),
          },
          request: limitRequest as sdk.SubmitOrderRequestV3,
          limitCalcTradeParams: calcTradeParams,
          tradeCalcProData: {
            ...pageTradePro.tradeCalcProData,
            fee:
              calcTradeParams && calcTradeParams.maxFeeBips
                ? calcTradeParams.maxFeeBips?.toString()
                : undefined,
            isNotMatchMarketPrice,
            marketPrice,
            marketRatePrice,
            isChecked: tradeData.isChecked !== undefined && tradeData.isChecked,
          },
        })
        setLimitTradeData((state) => {
          const tradePrice = tradeData.price.tradeValue
          let balance =
            tradePrice &&
            tokenPrices &&
            forexMap &&
            Number(tradePrice) * tokenPrices[quoteSymbol as string] * (forexMap[currency] ?? 0)

          return {
            ...state,
            price: {
              belong: quoteSymbol,
              tradeValue: tradePrice,
              balance,
            } as IBData<any>,
            base: {
              ...state.base,
              tradeValue: calcTradeParams?.baseVolShow as number,
            },
            quote: {
              ...state.quote,
              tradeValue: calcTradeParams?.quoteVolShow as number,
            },
            isChecked: tradeData.isChecked !== undefined && tradeData.isChecked,
          }
        })
      }
    },
    [
      resetTradeData,
      makeLimitReqInHook,
      updatePageTradePro,
      market,
      tokenPrices,
      quoteSymbol,
      forexMap,
      currency,
    ],
  )
  const handlePriceError = React.useCallback(
    (data: IBData<any>): { error: boolean; message?: string | JSX.Element } | undefined => {
      const tradeValue = data.tradeValue
      if (tradeValue) {
        const [, precision] = tradeValue.toString().split('.')
        if (precision && precision.length > marketMap[market].precisionForPrice) {
          return {
            error: true,
            message: t('labelErrorPricePrecisionLimit', {
              symbol: data.belong,
              decimal: marketMap[market].precisionForPrice,
            }),
          }
        }
        return undefined
      } else {
        return undefined
      }
    },
    [market, marketMap, t],
  )
  const {showAlert, confirmed, setShowWhich, setConfirmed} = useAlert()
  const doShowAlert = () => {
    const pageTradePro = store.getState()._router_pageTradePro.pageTradePro
    const {priceLevel} = getPriceImpactInfo(pageTradePro.calcTradeParams, account.readyState)
    myLog('hookSwap:---- swapCalculatorCallback priceLevel:', priceLevel)
    setConfirmed((state) => {
      state[ 1 ] = true
      setShowWhich(() => {
        if (pageTradePro?.tradeCalcProData?.isNotMatchMarketPrice) {
          return {isShow: true, step: 1, showWitch: ShowWitchAle3t1.AlertImpact}
        } else if (priceLevel === PriceLevel.Lv1 || priceLevel === PriceLevel.Lv2) {
          return {isShow: true, step: 1, showWitch: ShowWitchAle3t1.ConfirmImpact}
        } else {
          state[ 0 ] = true
          return {isShow: false, step: 2, showWitch: ''}
        }
      })
      return state
    })
  }
  React.useEffect(() => {
    if (confirmed[ 0 ] === true && confirmed[ 1 ] === true) {
      limitSubmit(undefined as any, true)
      setConfirmed([false, false])
    }
  }, [confirmed[ 0 ], confirmed[ 1 ]])
  const onSubmitBtnClick = React.useCallback(async () => {
    setIsLimitLoading(true)
    const pageTradePro = store.getState()._router_pageTradePro.pageTradePro
    const { priceLevel } = getPriceImpactInfo(
      pageTradePro.limitCalcTradeParams,
      account.readyState,
      false,
    )
    if (!allowTrade?.order?.enable) {
      setShowSupport({ isShow: true })
      setIsLimitLoading(false)
    } else if (!order.enable) {
      setShowTradeIsFrozen({ isShow: true, type: 'Limit' })
      setIsLimitLoading(false)
    } else {
      doShowAlert()
    }
    // switch (priceLevel) {
    //   case PriceLevel.Lv1:
    //     setAlertOpen(true)
    //     break
    //   default:
    //     limitSubmit(undefined as any, true)
    //     break
    // }
    // }
  }, [
    account.readyState,
    allowTrade.order.enable,
    limitSubmit,
    order.enable,
    setShowSupport,
    setShowTradeIsFrozen,
  ])
  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string
  } => {
    const account = store.getState().account
    const pageTradePro = store.getState()._router_pageTradePro.pageTradePro
    const {
      minOrderInfo,
      // calcTradeParams,
    } = pageTradePro
    if (account.readyState === AccountStatus.ACTIVATED) {
      // const type = limitTradeData.type === TradeProType.sell ? 'quote' : 'base';
      if (
        limitTradeData?.base.tradeValue === undefined ||
        limitTradeData?.quote.tradeValue === undefined ||
        limitTradeData?.price.tradeValue === undefined ||
        limitTradeData?.base.tradeValue === 0 ||
        limitTradeData?.quote.tradeValue === 0 ||
        limitTradeData?.price.tradeValue === 0
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: 'labelEnterAmount',
        }
      } else if (!minOrderInfo?.minAmtCheck) {
        let minOrderSize = 'Error'
        if (minOrderInfo?.symbol) {
          const basePrecision = tokenMap[minOrderInfo.symbol].precision
          const showValue = getValuePrecisionThousand(
            minOrderInfo?.minAmtShow,
            undefined,
            undefined,
            basePrecision,
            true,
            { isAbbreviate: true },
          )
          minOrderSize = `${showValue} ${minOrderInfo?.symbol}`
        }
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelLimitMin| ${minOrderSize}`,
        }
      } else if (
        sdk
          .toBig(
            limitTradeData[limitTradeData.type === TradeProType.buy ? 'quote' : 'base']
              ?.tradeValue ?? '',
          )
          .gt(limitTradeData[limitTradeData.type === TradeProType.buy ? 'quote' : 'base'].balance)
      ) {
        return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: '' }
      } else {
        return {
          label: '',
          tradeBtnStatus: TradeBtnStatus.AVAILABLE,
        }
        // if (
        //   pageTradePro?.tradeCalcProData.isNotMatchMarketPrice &&
        //   !pageTradePro.tradeCalcProData.isChecked
        // ) {
        //   return {
        //     label: '',
        //     tradeBtnStatus: TradeBtnStatus.DISABLED,
        //   }
        // } else {
        //   return {
        //     label: '',
        //     tradeBtnStatus: TradeBtnStatus.AVAILABLE,
        //   }
        // }
      }
    }
    return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
  }, [limitTradeData, tokenMap, pageTradePro.tradeCalcProData?.isChecked])

  const {
    btnStatus: tradeLimitBtnStatus,
    onBtnClick: limitBtnClick,
    btnLabel: tradeLimitI18nKey,
    btnStyle: tradeLimitBtnStyle,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading: isLimitLoading,
    submitCallback: onSubmitBtnClick,
  })
  return {
    toastOpen,
    setToastOpen,
    closeToast,
    // limitAlertOpen: alertOpen,
    resetLimitData: resetTradeData,
    isLimitLoading: false,
    limitTradeData,
    onChangeLimitEvent,
    tradeLimitI18nKey,
    tradeLimitBtnStatus,
    limitSubmit,
    limitBtnClick,
    handlePriceError,
    tradeLimitBtnStyle: {
      ...tradeLimitBtnStyle,
      ...{
        fontSize: isMobile ? (tradeLimitI18nKey !== '' ? '1.2rem' : '1.4rem') : '1.6rem',
      },
    },
    showAlert,
    handleClose: () => {
      setShowWhich((state) => ({...state, isShow: false}))
      setConfirmed([false, false])
      // setIsMarketLoading(false)
    },
    handleConfirm: () => {
      setShowWhich((state) => ({...state, isShow: false}))
      setConfirmed((state) => {
        state[ showAlert.step - 1 ] = true
        return state
      })
    },
    priceLevel: getPriceImpactInfo(pageTradePro.calcTradeParams, account.readyState),

    // marketTicker,
  }
}

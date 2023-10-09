import React from 'react'
import {
  AccountStep,
  DualChgData,
  DualWrapProps,
  useOpenModals,
  useToggle,
} from '@loopring-web/component-lib'
import {
  AccountStatus,
  CustomErrorWithCode,
  DualCalcData,
  DualTrade,
  DualViewInfo,
  DualViewType,
  getValuePrecisionThousand,
  globalSetup,
  myLog,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
  SUBMIT_PANEL_AUTO_CLOSE,
  TradeBtnStatus,
} from '@loopring-web/common-resources'

import {
  confirmation,
  DAYS,
  getTimestampDaysLater,
  makeDualViewItem,
  makeWalletLayer2,
  TradeDual,
  useDualMap,
  useSubmitBtn,
  useToast,
  useWalletLayer2Socket,
  walletLayer2Service,
} from '@loopring-web/core'
import _ from 'lodash'

import * as sdk from '@loopring-web/loopring-sdk'

import { LoopringAPI, store, useAccount, useSystem, useTokenMap } from '../../index'
import { useTradeDual } from '../../stores'
import { useLocation } from 'react-router-dom'

export const useDualTrade = <
  T extends DualTrade<I>,
  I,
  ACD extends DualCalcData<R>,
  R extends DualViewInfo,
>({
  setConfirmDualAutoInvest,
}: {
  setConfirmDualAutoInvest: (state: boolean) => void
}) => {
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const viewType = searchParams.get('viewType')
  const refreshRef = React.useRef()
  const { exchangeInfo, allowTrade } = useSystem()
  const { tokenMap, marketArray } = useTokenMap()
  const { setShowAccount } = useOpenModals()
  const { marketMap: dualMarketMap } = useDualMap()
  const { account, status: accountStatus } = useAccount()
  const { setShowDual } = useOpenModals()
  const {
    confirmation: {
      // confirmedDualInvest,
      confirmDualAutoInvest,
    },
  } = confirmation.useConfirmation()
  const { toastOpen, closeToast } = useToast()
  const {
    modals: { isShowDual },
    setShowSupport,
    setShowTradeIsFrozen,
  } = useOpenModals()
  const { tradeDual, updateTradeDual, resetTradeDual } = useTradeDual()
  const [serverUpdate, setServerUpdate] = React.useState(false)
  const {
    toggle: { dualInvest, dual_reinvest },
  } = useToggle()

  const [[coinSellSymbol, coinBuySymbol], setSellBuySymbol] = React.useState<
    [string | undefined, string | undefined]
  >([undefined, undefined])
  // });
  const [isLoading, setIsLoading] = React.useState(false)
  const [productInfo, setProductInfo] = React.useState<R>(undefined as any)

  const refreshDual = React.useCallback(
    ({
      dualInfo = productInfo,
      tradeData,
      balance,
      index = productInfo?.__raw__.index,
    }: {
      dualInfo?: R
      tradeData?: T
      balance?: { [key: string]: sdk.DualBalance }
      index?: sdk.DualIndex
    }) => {
      let walletMap: any = {}
      let { sellSymbol, buySymbol } = isShowDual.dualInfo as R
      // feeVol: string | undefined = undefined;
      let { info } = dualInfo.__raw__
      const {
        tradeDual: { coinSell: _coinSell },
      } = store.getState()._router_tradeDual
      let _updateInfo: Partial<TradeDual<R>> = {
        dualViewInfo: _.cloneDeep(dualInfo),
      }
      if (productInfo?.productId === dualInfo.productId) {
        _updateInfo = {
          ...(tradeDual as TradeDual<R>),
          ..._updateInfo,
        }
      } else {
        // resetTradeDual();
        // info = _updateInfo.dualViewInfo.__raw__.info;
      }
      if (index && _updateInfo.dualViewInfo) {
        _updateInfo.dualViewInfo.__raw__.index = index
      }
      if (balance) {
        _updateInfo.balance = balance
      }

      const [baseSymbol, quoteSymbol] = [sellSymbol, buySymbol]

      const dualMarket =
        dualMarketMap[`DUAL-${sellSymbol}-${buySymbol}`] ??
        dualMarketMap[`DUAL-${buySymbol}-${sellSymbol}`]

      setSellBuySymbol([baseSymbol, quoteSymbol])
      let coinSell: T =
        tradeData && tradeData.belong === baseSymbol
          ? tradeData
          : _coinSell?.belong === baseSymbol
          ? ({
              ..._coinSell,
            } as unknown as T)
          : ({
              balance: _updateInfo?.coinSell?.balance ?? 0,
              tradeValue: _updateInfo?.coinSell?.tradeValue ?? undefined,
              belong: baseSymbol,
              isRenew:
                _updateInfo?.coinSell?.isRenew ??
                (dual_reinvest?.enable &&
                  [DualViewType.DualDip, DualViewType.DualGain].includes(viewType as DualViewType))
                  ? true
                  : false,
            } as unknown as T)
      const existedMarket = sdk.getExistedMarket(marketArray, baseSymbol, quoteSymbol)
      if (account.readyState == AccountStatus.ACTIVATED && existedMarket) {
        walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap
        coinSell.balance = walletMap[baseSymbol]?.count
      }

      const dualViewInfo = makeDualViewItem(
        info,
        index ?? ({} as any),
        dualInfo.__raw__.rule,
        sellSymbol,
        buySymbol,
        dualMarket,
      )
      if (_updateInfo.balance) {
        const calDualValue: sdk.CalDualResult = sdk.calcDual({
          ...dualInfo.__raw__,
          balance: _updateInfo.balance,
          // feeVol,
          sellToken: tokenMap[baseSymbol],
          buyToken: tokenMap[quoteSymbol],
          sellAmount: coinSell.tradeValue?.toString() ?? undefined,
          dualMarket,
        })
        _updateInfo = {
          ..._updateInfo,
          ...(calDualValue as TradeDual<R>),
        }
      }

      updateTradeDual({ ..._updateInfo, dualViewInfo, coinSell })
    },
    [
      account.readyState,
      dualMarketMap,
      isShowDual.dualInfo,
      marketArray,
      productInfo,
      tokenMap,
      tradeDual,
      updateTradeDual,
    ],
  )

  const handleOnchange = ({ tradeData }: DualChgData<T>) => {
    if (
      tradeData?.isRenew &&
      !confirmDualAutoInvest &&
      [DualViewType.All, DualViewType.DualBegin].includes(viewType as DualViewType)
    ) {
      setConfirmDualAutoInvest(true)
    } else {
      refreshDual({ tradeData })
    }
  }

  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string
  } => {
    const account = store.getState().account
    const tradeDual = store.getState()._router_tradeDual.tradeDual
    if (account.readyState === AccountStatus.ACTIVATED && coinSellSymbol && tradeDual?.coinSell) {
      const sellToken = tokenMap[tradeDual?.coinSell.belong]
      const sellExceed = sdk
        .toBig(tradeDual.coinSell?.tradeValue ?? 0)
        .gt(tradeDual?.coinSell?.balance ?? 0)
      // myLog("sellExceed", sellExceed, tradeDual.sellVol, tradeDual);
      if (
        tradeDual?.sellVol === undefined ||
        sdk.toBig(tradeDual?.sellVol).lte(0) ||
        tradeDual?.maxFeeBips === undefined ||
        tradeDual?.maxFeeBips === 0
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: 'labelEnterAmount',
        }
      } else if (
        sdk
          .toBig(tradeDual?.sellVol ?? 0)
          .minus(tradeDual?.miniSellVol ?? 0)
          .lt(0)
      ) {
        const sellMinVal = getValuePrecisionThousand(
          sdk.toBig(tradeDual?.miniSellVol).div('1e' + sellToken?.decimals),
          sellToken.precision,
          sellToken.precision,
          sellToken.precision,
          false,
          { floor: false, isAbbreviate: true },
        )
        const mimOrderSize = sellMinVal + ' ' + sellToken.symbol
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelDualMin| ${mimOrderSize}`,
        }
      } else if (sellExceed) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelDualNoEnough| ${coinSellSymbol}`,
        }
      } else if (
        tradeDual?.maxSellAmount &&
        tradeDual?.sellVol &&
        sellToken &&
        sdk.toBig(tradeDual?.coinSell?.tradeValue ?? 0).gte(tradeDual?.maxSellAmount)
      ) {
        const sellMaxVal = getValuePrecisionThousand(
          tradeDual?.maxSellAmount,
          sellToken.precision,
          sellToken.precision,
          sellToken.precision,
          false,
          { floor: false, isAbbreviate: true },
        )
        const maxOrderSize = sellMaxVal + ' ' + sellToken.symbol
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelDualMax| ${maxOrderSize}`,
        }
      } else {
        return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' } // label: ''}
      }
    }
    return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
  }, [coinSellSymbol, tokenMap])
  const should15sRefresh = _.debounce(async (clearTrade: boolean = false) => {
    if (productInfo && coinSellSymbol && coinBuySymbol && LoopringAPI.defiAPI) {
      if (clearTrade) {
        setIsLoading(true)
      }
      const dualMarket =
        dualMarketMap[`DUAL-${coinSellSymbol}-${coinBuySymbol}`] ??
        dualMarketMap[`DUAL-${coinBuySymbol}-${coinSellSymbol}`]
      Promise.all([
        LoopringAPI.defiAPI?.getDualIndex({
          baseSymbol: productInfo.__raw__.info.base,
          quoteSymbol: dualMarket.quoteAlias,
        }),
        LoopringAPI.defiAPI?.getDualPrices({
          baseSymbol: productInfo.__raw__.info.base,
          productIds: productInfo.productId,
        }),
        LoopringAPI.defiAPI?.getDualBalance(),
      ])
        .then(([dualIndexResponse, dualPriceResponse, dualBalanceResponse]) => {
          const {
            tradeDual: { dualViewInfo },
          } = store.getState()._router_tradeDual
          let dualInfo: R = _.cloneDeep(dualViewInfo) as R
          let balance = undefined,
            index = undefined
          if (
            (dualIndexResponse as sdk.RESULT_INFO).code ||
            (dualIndexResponse as sdk.RESULT_INFO).message
          ) {
          } else {
            index = dualIndexResponse.dualPrice
          }
          if (
            (dualPriceResponse as sdk.RESULT_INFO).code ||
            (dualPriceResponse as sdk.RESULT_INFO).message
          ) {
          }
          if (dualInfo?.__raw__?.info) {
            dualInfo.__raw__.info = {
              ...dualInfo.__raw__.info,
            }
          }
          if (
            (dualBalanceResponse as sdk.RESULT_INFO).code ||
            (dualBalanceResponse as sdk.RESULT_INFO).message
          ) {
          } else {
            balance = dualBalanceResponse.raw_data.reduce((prev: any, item: any) => {
              prev[item.coin] = item
              return prev
            }, {} as any)
          }
          refreshDual({ dualInfo, balance, index })
          setIsLoading(false)
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }, globalSetup.wait)

  const refreshClick = React.useCallback(() => {
    if (refreshRef.current && tradeDual) {
      //@ts-ignore
      refreshRef.current.firstElementChild.click()
      myLog('should15sRefresh refreshRef.current click only')
      should15sRefresh(true)
    }
  }, [tradeDual])
  React.useEffect(() => {
    if (isShowDual?.isShow && isShowDual?.dualInfo?.__raw__) {
      setProductInfo(isShowDual.dualInfo as R)
      refreshDual({ dualInfo: isShowDual.dualInfo as R })
    } else {
      resetTradeDual()
    }
    refreshClick()
    return () => {
      myLog('should15sRefresh cancel')
      resetTradeDual()
      should15sRefresh.cancel()
    }
  }, [isShowDual, refreshRef.current])

  const walletLayer2Callback = React.useCallback(async () => {
    const {
      tradeDual: { coinSell },
    } = store.getState()._router_tradeDual
    if (coinSell) {
      if (account.readyState === AccountStatus.ACTIVATED) {
        refreshDual({ tradeData: { ...coinSell } as T })
      } else {
        refreshDual({ tradeData: { ...coinSell, tradeValue: undefined } as T })
      }
    }
  }, [account.readyState, refreshDual])

  useWalletLayer2Socket({ walletLayer2Callback })
  const sendRequest = React.useCallback(async () => {
    const tradeDual = store.getState()._router_tradeDual.tradeDual
    try {
      setIsLoading(true)
      if (
        LoopringAPI.userAPI &&
        LoopringAPI.defiAPI &&
        tradeDual &&
        tradeDual.coinSell?.belong &&
        tradeDual.maxFeeBips &&
        exchangeInfo
      ) {
        const sellToken = tokenMap[tradeDual.coinSell?.belong]
        const req: sdk.GetNextStorageIdRequest = {
          accountId: account.accountId,
          sellTokenId: sellToken?.tokenId ?? 0,
        }
        const storageId = await LoopringAPI.userAPI.getNextStorageId(req, account.apiKey)
        if ((storageId as sdk.RESULT_INFO).code || (storageId as sdk.RESULT_INFO).message) {
          const errorItem = SDK_ERROR_MAP_TO_UI[700001]
          throw new CustomErrorWithCode({
            ...storageId,
            ...errorItem,
          } as any)
        }
        const {
          dualType,
          productId,
          profit,
          // dualPrice: { dualBid },
        } = tradeDual.dualViewInfo.__raw__.info

        const isRenew = tradeDual.coinSell?.isRenew
          ? {
              isRecursive: true,
              maxRecurseProductDuration: Number(tradeDual?.coinSell?.renewDuration ?? 7) * 86400000,
            }
          : {}
        // myLog("fee", tradeDual.feeVol);
        const request: sdk.DualOrderRequest = {
          clientOrderId: '',
          exchange: exchangeInfo.exchangeAddress,
          storageId: storageId.orderId,
          accountId: account.accountId,
          sellToken: {
            tokenId: sellToken?.tokenId ?? 0,
            volume: tradeDual.sellVol,
          },
          buyToken:
            dualType === sdk.DUAL_TYPE.DUAL_BASE
              ? {
                  tokenId: tokenMap[tradeDual.greaterEarnTokenSymbol]?.tokenId ?? 0,
                  volume: tradeDual.greaterEarnVol,
                }
              : {
                  tokenId: tokenMap[tradeDual.lessEarnTokenSymbol]?.tokenId ?? 0,
                  volume: tradeDual.lessEarnVol,
                },
          validUntil: getTimestampDaysLater(DAYS * 12),
          maxFeeBips: tradeDual.maxFeeBips,
          fillAmountBOrS: false,
          fee: tradeDual.feeVol ?? '0',
          baseProfit: profit,
          productId,
          settleRatio: tradeDual.dualViewInfo.settleRatio.replaceAll(sdk.SEP, ''), //sdk.toBig(tradeDual.dualViewInfo.settleRatio).f,
          expireTime: tradeDual.dualViewInfo.expireTime,
          ...isRenew,
        }
        myLog('DualTrade request:', request)
        const response = await LoopringAPI.defiAPI.orderDual(
          request,
          account.eddsaKey.sk,
          account.apiKey,
        )
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          const errorItem = /DUAL_PRODUCT_STOPPED/gi.test(
            (response as sdk.RESULT_INFO).message ?? '',
          )
            ? SDK_ERROR_MAP_TO_UI[115003]
            : SDK_ERROR_MAP_TO_UI[700001]
          throw new CustomErrorWithCode({
            ...response,
            ...errorItem,
          } as any)
        } else {
          setShowDual({ isShow: false, dualInfo: undefined })
          setShowAccount({
            isShow: true,
            step: AccountStep.Dual_Success,
            info: {
              symbol: sellToken.symbol,
              value: tradeDual.coinSell.tradeValue,
            },
          })
          await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
          if (
            store.getState().modals.isShowAccount.isShow &&
            store.getState().modals.isShowAccount.step == AccountStep.Dual_Success
          ) {
            setShowAccount({ isShow: false })
          }
        }
      } else {
        throw new Error('api not ready')
      }
      walletLayer2Service.sendUserUpdate()
    } catch (reason) {
      setShowAccount({
        isShow: true,
        step: AccountStep.Dual_Failed,
        error: reason as sdk.RESULT_INFO,
        info: {
          symbol: tradeDual?.coinSell?.belong,
        },
      })
    } finally {
      should15sRefresh(true)
    }
  }, [
    account.accountId,
    account.apiKey,
    account.eddsaKey.sk,
    exchangeInfo,
    setShowAccount,
    setShowDual,
    tokenMap,
  ])

  // const isNoBalance = ;
  const onSubmitBtnClick = React.useCallback(async () => {
    const { tradeDual } = store.getState()._router_tradeDual

    if (
      (account.readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        exchangeInfo &&
        account.eddsaKey?.sk,
      tradeDual.sellVol)
    ) {
      if (!allowTrade.defiInvest.enable) {
        setShowSupport({ isShow: true })
      } else if (!dualInvest.enable) {
        setShowTradeIsFrozen({ isShow: true, type: 'DualInvest' })
      } else {
        sendRequest()
      }
    } else {
      return false
    }
  }, [tokenMap, coinSellSymbol])

  React.useEffect(() => {
    if (accountStatus === SagaStatus.UNSET) {
      walletLayer2Callback()
      //
    }
  }, [accountStatus])

  const {
    btnStatus,
    onBtnClick,
    btnLabel: tradeMarketI18nKey,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading,
    submitCallback: onSubmitBtnClick,
  })

  const dualTradeProps: DualWrapProps<T, I, ACD> = {
    refreshRef,
    disabled: false,
    btnInfo: {
      label: tradeMarketI18nKey,
      params: {},
    },
    toggle: dual_reinvest,
    isLoading,
    tokenMap: tokenMap as any,
    onRefreshData: should15sRefresh,
    onSubmitClick: onBtnClick as () => void,
    onChangeEvent: handleOnchange,
    tokenSellProps: {},
    dualCalcData: tradeDual as ACD,
    // maxSellVol: tradeDual.maxSellVol,
    tokenSell: tokenMap[coinSellSymbol ?? ''],
    btnStatus,
    accStatus: account.readyState as AccountStatus,
  } // as ForceWithdrawProps<any, any>;
  return {
    dualTradeProps,
    serverUpdate,
    setServerUpdate,
    dualToastOpen: toastOpen,
    closeDualToast: closeToast,
  }
}
